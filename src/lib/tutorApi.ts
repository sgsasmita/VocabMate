import { supabase } from './supabase';

export interface TutorMessage {
  role: 'user' | 'model';
  content: string;
}

export type TutorLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TutorRequestOptions {
  userName?: string;
  level?: TutorLevel;
  usedWords?: string[];
}

export type ConnectionStatus = 'unknown' | 'checking' | 'connected' | 'disconnected' | 'missing-key';

function levelInstruction(level: TutorLevel): string {
  switch (level) {
    case 'beginner':
      return 'The learner is a beginner. Use very simple English, short sentences, and common everyday words. Be extra encouraging and go slowly.';
    case 'advanced':
      return 'The learner is advanced. Introduce nuanced, sophisticated vocabulary and discuss subtle usage and connotation. You may use richer sentence structures.';
    default:
      return 'The learner is intermediate. Use clear, accessible English with slightly challenging vocabulary.';
  }
}

function buildOpeningMessage(userName: string, level: TutorLevel, usedWords: string[]): string {
  const usedClause = usedWords.length > 0
    ? ` We have already covered these words this session, so do not repeat them: ${usedWords.join(', ')}.`
    : '';
  return `Hi! My name is ${userName}. I am a ${level} English learner and I would like to learn a new vocabulary word today. Please teach me one. Give me a friendly greeting first, then introduce one new word, explain its meaning simply, show how to pronounce it, give an example sentence, and then ask me to make my own sentence.${usedClause}`;
}

export async function checkTutorConnection(): Promise<ConnectionStatus> {
  if (!supabase) return 'disconnected';
  try {
    const { data, error } = await supabase.functions.invoke('tutor', {
      method: 'GET',
    });
    if (error && /failed to fetch|network/i.test(error.message)) return 'disconnected';
    // The health endpoint returns { status: 'ok' } or { status: 'missing-key' }.
    const status = (data as { status?: string } | null)?.status;
    if (status === 'ok') return 'connected';
    if (status === 'missing-key') return 'missing-key';
    // If we got any reachable response, the function is live.
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

export async function fetchTutorReply(
  messages: TutorMessage[],
  options: TutorRequestOptions = {}
): Promise<string> {
  const { userName = 'Friend', level = 'intermediate', usedWords = [] } = options;

  if (!supabase) {
    throw new Error(
      'The tutor service could not be reached because the app is not linked to its backend. ' +
        'In Bolt, open the database panel and make sure the Supabase connection is active, then refresh this page.'
    );
  }

  const recent = messages.slice(-12);
  const body = {
    messages: recent,
    userName,
    level,
    usedWords,
    opening: recent.length === 0 ? buildOpeningMessage(userName, level, usedWords) : undefined,
  };

  let data: { reply?: string; error?: string } | null = null;
  let invokeError: Error | null = null;
  let errorResponse: Response | null = null;

  try {
    const res = await supabase.functions.invoke('tutor', { body });
    data = res.data as { reply?: string; error?: string } | null;
    invokeError = res.error as Error | null;
    // When the edge function returns a non-2xx status, the Supabase client
    // throws a FunctionsHttpError whose .context is the original Response.
    // We read its body to surface the real error instead of the generic message.
    if (invokeError && (invokeError as unknown as { context?: Response }).context) {
      errorResponse = (invokeError as unknown as { context: Response }).context;
    }
  } catch (err) {
    invokeError = err instanceof Error ? err : new Error(String(err));
  }

  // If we have the original error Response, read its body for the real message.
  if (errorResponse) {
    let bodyError = '';
    try {
      const bodyJson = await errorResponse.json();
      bodyError = bodyJson?.error || '';
    } catch {
      try {
        bodyError = await errorResponse.text();
      } catch {
        bodyError = '';
      }
    }
    const combined = bodyError || invokeError?.message || '';
    if (/key|configured|gemini/i.test(combined) && /missing|not configured|invalid|no available/i.test(combined)) {
      throw new Error(
        "The AI tutor could not generate a response. This usually means the Gemini API key needs attention. Open Bolt's database panel → Secrets and verify that GEMINI_API_KEY is set to a valid Google AI Studio key."
      );
    }
    if (/429|rate limit|quota/i.test(combined)) {
      throw new Error('The tutor is receiving too many requests right now. Please wait a moment and try again.');
    }
    if (combined) {
      throw new Error(combined);
    }
    throw new Error('The tutor service returned an error. Please try again.');
  }

  if (invokeError) {
    const msg = invokeError.message || '';
    if (/failed to fetch|network|fetch/i.test(msg)) {
      throw new Error('Could not reach the tutor service. Check your internet connection and try again.');
    }
    if (/key|api[_ -]?key|secret|configured/i.test(msg)) {
      throw new Error(
        "The AI tutor is not configured yet. Add a secret named GEMINI_API_KEY in Bolt's database Secrets panel, then start a new session."
      );
    }
    throw new Error(msg || 'The tutor service could not be reached.');
  }

  if (data?.error) {
    if (/key|configured/i.test(data.error)) {
      throw new Error(
        "The AI tutor needs a Gemini API key. Open Bolt's database panel → Secrets, add a secret named GEMINI_API_KEY with your key, then start a new session."
      );
    }
    throw new Error(data.error);
  }

  if (!data?.reply) {
    throw new Error('The tutor returned an empty response. Please try again.');
  }

  return data.reply as string;
}

export async function startTutorConversation(options: TutorRequestOptions): Promise<string> {
  const opening = buildOpeningMessage(options.userName || 'Friend', options.level || 'intermediate', options.usedWords || []);
  return fetchTutorReply([{ role: 'user', content: opening }], options);
}

export const LEVEL_INSTRUCTION = levelInstruction;
