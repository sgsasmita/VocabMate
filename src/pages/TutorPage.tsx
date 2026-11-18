import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Send, RotateCcw, X, AlertCircle, Volume2, Square,
  Sparkles, RefreshCw, Repeat, BookOpen, Lightbulb, GraduationCap,
  CheckCircle2, Loader2, Wifi, WifiOff,
} from 'lucide-react';
import { VoiceOrb, type OrbState } from '@/components/VoiceOrb';
import { Button } from '@/components/ui';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import {
  fetchTutorReply, startTutorConversation, checkTutorConnection,
  type TutorMessage, type TutorLevel, type ConnectionStatus,
} from '@/lib/tutorApi';
import type { AppStore } from '@/hooks/useAppStore';
import { cn } from '@/lib/utils';

interface TutorPageProps {
  store: AppStore;
}

type Sender = 'tutor' | 'learner';

interface TranscriptEntry {
  id: string;
  sender: Sender;
  text: string;
}

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

const LEVELS: Array<{ id: TutorLevel; label: string; desc: string }> = [
  { id: 'beginner', label: 'Beginner', desc: 'Simple words, slow pace' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Clear, slightly challenging' },
  { id: 'advanced', label: 'Advanced', desc: 'Sophisticated, nuanced' },
];

const QUICK_COMMANDS: Array<{ label: string; text: string; icon: typeof Repeat }> = [
  { label: 'Repeat that', text: 'Can you repeat that please?', icon: Repeat },
  { label: 'Another example', text: 'Give me another example.', icon: BookOpen },
  { label: 'Explain simply', text: 'Can you explain that more simply?', icon: Lightbulb },
  { label: 'Another word', text: 'Teach me another word.', icon: Sparkles },
];

export function TutorPage({ store }: TutorPageProps) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [lastReply, setLastReply] = useState('');
  const [level, setLevel] = useState<TutorLevel>('intermediate');
  const [connection, setConnection] = useState<ConnectionStatus>('unknown');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const sessionStartRef = useRef<number>(Date.now());
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<TutorMessage[]>([]);

  const synth = useSpeechSynthesis();

  // Connection check on mount.
  useEffect(() => {
    let active = true;
    setConnection('checking');
    void checkTutorConnection().then((s) => {
      if (active) setConnection(s);
    });
    return () => { active = false; };
  }, []);

  const speakReply = useCallback(
    (replyText: string) => {
      setPhase('speaking');
      setLastReply(replyText);
      synth.speak(replyText, () => {
        setPhase((p) => (p === 'speaking' ? 'idle' : p));
      });
    },
    [synth]
  );

  const addEntry = useCallback((sender: Sender, entryText: string) => {
    setTranscript((prev) => [...prev, { id: crypto.randomUUID(), sender, text: entryText }]);
  }, []);

  const sendToTutor = useCallback(
    async (learnerText: string) => {
      if (!learnerText.trim()) return;
      addEntry('learner', learnerText);
      historyRef.current.push({ role: 'user', content: learnerText });
      setPhase('thinking');
      setError(null);
      try {
        const reply = await fetchTutorReply(historyRef.current, {
          userName: store.state.userName,
          level,
          usedWords,
        });
        historyRef.current.push({ role: 'model', content: reply });
        addEntry('tutor', reply);
        speakReply(reply);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong reaching the tutor.';
        setError(msg);
        setPhase('idle');
      }
    },
    [addEntry, speakReply, store.state.userName, level, usedWords]
  );

  const recognition = useSpeechRecognition({
    onResult: (finalText) => {
      setPhase('thinking');
      void sendToTutor(finalText);
    },
  });

  const handleMicToggle = useCallback(() => {
    if (phase === 'listening') {
      recognition.stop();
      setPhase('idle');
    } else {
      if (synth.speaking) synth.stop();
      setError(null);
      recognition.clearError();
      setPhase('listening');
      recognition.start();
    }
  }, [phase, recognition, synth]);

  const handleSendText = useCallback(() => {
    const t = text.trim();
    if (!t || phase === 'thinking') return;
    setText('');
    if (phase === 'listening') recognition.stop();
    void sendToTutor(t);
  }, [text, phase, recognition, sendToTutor]);

  const handleCommand = useCallback((cmd: string) => {
    if (phase === 'thinking') return;
    if (phase === 'listening') recognition.stop();
    void sendToTutor(cmd);
  }, [phase, recognition, sendToTutor]);

  const startSession = useCallback(async () => {
    setStarted(true);
    sessionStartRef.current = Date.now();
    historyRef.current = [];
    setTranscript([]);
    setUsedWords([]);
    setError(null);
    setPhase('thinking');
    try {
      const reply = await startTutorConversation({
        userName: store.state.userName,
        level,
        usedWords: [],
      });
      const opening = buildOpening(store.state.userName, level);
      historyRef.current.push({ role: 'user', content: opening });
      historyRef.current.push({ role: 'model', content: reply });
      addEntry('tutor', reply);
      speakReply(reply);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not start the session.';
      setError(msg);
      setPhase('idle');
    }
  }, [addEntry, speakReply, store.state.userName, level]);

  const endSession = useCallback(() => {
    synth.stop();
    recognition.stop();
    if (started) {
      const durationSec = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const exchanges = transcript.filter((t) => t.sender === 'learner').length;
      const tutorTurns = transcript.filter((t) => t.sender === 'tutor').length;
      store.recordSession({ durationSec, exchanges, newWords: Math.max(0, tutorTurns) });
    }
    setStarted(false);
    setPhase('idle');
    setTranscript([]);
    historyRef.current = [];
    setUsedWords([]);
    setLastReply('');
  }, [synth, recognition, started, transcript, store]);

  const retryConnection = useCallback(() => {
    setConnection('checking');
    void checkTutorConnection().then(setConnection);
  }, []);

  const replay = useCallback(() => {
    if (lastReply) speakReply(lastReply);
  }, [lastReply, speakReply]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, phase]);

  const orbState: OrbState =
    phase === 'listening' ? 'listening' : phase === 'thinking' ? 'thinking' : phase === 'speaking' ? 'speaking' : 'idle';

  const phaseLabel =
    phase === 'listening' ? 'Listening…'
    : phase === 'thinking' ? 'Thinking…'
    : phase === 'speaking' ? 'Speaking…'
    : started ? 'Tap the mic to respond'
    : 'Ready to begin';

  // Pre-session screen
  if (!started) {
    return (
      <div className="view-enter">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-6 text-center sm:py-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-lavender-200 px-3 py-1 text-xs font-semibold text-plum-700">
            <Sparkles className="h-3 w-3" /> AI Voice Tutor
          </span>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Your personal English tutor</h1>
          <p className="max-w-lg text-plum-600 leading-relaxed">
            Have a natural conversation with your AI tutor. It introduces a new word, explains its meaning,
            helps you pronounce it, and guides you to use it in your own sentences — with friendly feedback along the way.
          </p>

          <div className="my-1">
            <VoiceOrb state="idle" size="md" />
          </div>

          {/* Connection status */}
          <ConnectionBadge status={connection} onRetry={retryConnection} />

          {/* Level selector */}
          <div className="w-full max-w-md">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-plum-400">
              <GraduationCap className="h-3.5 w-3.5" /> Your level
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={cn(
                    'rounded-2xl border p-3 text-center transition-all',
                    level === l.id
                      ? 'border-plum-600 bg-plum-700 text-ivory shadow-soft'
                      : 'border-lavender-200 bg-white text-plum-700 hover:border-plum-300 hover:bg-lavender-100/60'
                  )}
                >
                  <div className="text-sm font-semibold">{l.label}</div>
                  <div className={cn('mt-0.5 text-[11px] leading-tight', level === l.id ? 'text-ivory/70' : 'text-plum-400')}>
                    {l.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={startSession}
            disabled={phase === 'thinking' || connection === 'checking'}
          >
            {phase === 'thinking' ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <><Mic className="h-4 w-4" /> Start a session</>}
          </Button>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl bg-peach-100 px-4 py-3 text-left text-sm text-plum-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!recognition.supported && (
            <p className="text-xs text-plum-400">
              Voice input isn't available in this browser, but you can type your replies instead — the tutor works either way.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="view-enter grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Orb + controls */}
      <div className="lg:col-span-2 flex flex-col items-center justify-start gap-5 rounded-4xl bg-white p-6 shadow-soft border border-lavender-100/60 lg:sticky lg:top-28 self-start">
        <VoiceOrb state={orbState} size="md" />

        {/* Waveform */}
        <Waveform active={phase === 'listening' || phase === 'speaking'} speaking={phase === 'speaking'} />

        <div className="text-center">
          <div className="font-serif text-lg font-semibold text-plum-800">{phaseLabel}</div>
          {phase === 'listening' && recognition.interim && (
            <div className="mt-1 max-w-xs text-sm italic text-plum-400">"{recognition.interim}"</div>
          )}
        </div>

        {/* Connection pill */}
        <ConnectionBadge status={connection} onRetry={retryConnection} compact />

        <div className="flex items-center gap-3">
          <button
            onClick={handleMicToggle}
            title={phase === 'listening' ? 'Stop listening' : 'Speak your reply'}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full shadow-card transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-plum-400',
              phase === 'listening'
                ? 'bg-peach-300 text-plum-800 scale-110'
                : 'bg-plum-700 text-ivory hover:bg-plum-800 hover:scale-105'
            )}
          >
            {phase === 'listening' ? <MicOff className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
          </button>
          <button
            onClick={replay}
            disabled={!lastReply || phase === 'speaking'}
            title="Replay tutor audio"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-lavender-100 text-plum-700 transition-all hover:bg-lavender-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={endSession}
            title="End session"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-peach-100 text-plum-700 transition-all hover:bg-peach-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {recognition.error && (
          <div className="flex items-start gap-2 rounded-xl bg-peach-100 px-3 py-2 text-xs text-plum-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{recognition.error}</span>
          </div>
        )}

        {!recognition.supported && (
          <p className="text-center text-xs text-plum-400">Voice input unavailable — use the text box to reply.</p>
        )}

        {synth.speaking && (
          <button onClick={() => synth.stop()} className="flex items-center gap-1.5 text-xs font-semibold text-plum-500 hover:text-plum-700">
            <Square className="h-3 w-3" /> Stop speaking
          </button>
        )}
      </div>

      {/* Transcript + input */}
      <div className="lg:col-span-3 flex flex-col rounded-4xl bg-white p-5 shadow-soft border border-lavender-100/60 min-h-[60vh]">
        <div className="mb-3 flex items-center justify-between border-b border-lavender-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-semibold">Conversation</h2>
            <span className="rounded-full bg-lavender-100 px-2 py-0.5 text-[11px] font-semibold text-plum-500 capitalize">{level}</span>
          </div>
          <span className="text-xs text-plum-400">{transcript.length} messages</span>
        </div>

        <div ref={transcriptRef} className="flex-1 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: '46vh' }}>
          {transcript.length === 0 && phase === 'thinking' && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-lavender-100 px-4 py-3 shadow-soft">
                <TypingDots />
              </div>
            </div>
          )}
          {transcript.map((entry) => (
            <div
              key={entry.id}
              className={cn('flex animate-fadeIn', entry.sender === 'learner' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft',
                  entry.sender === 'learner'
                    ? 'bg-plum-700 text-ivory rounded-br-md'
                    : 'bg-lavender-100 text-plum-800 rounded-bl-md'
                )}
              >
                <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest opacity-60">
                  {entry.sender === 'learner' ? 'You' : 'Tutor'}
                </div>
                {entry.text}
                {entry.sender === 'tutor' && (
                  <button
                    onClick={() => synth.speak(entry.text)}
                    className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-plum-500 hover:text-plum-700"
                  >
                    <Volume2 className="h-3 w-3" /> Replay
                  </button>
                )}
              </div>
            </div>
          ))}

          {phase === 'thinking' && transcript.length > 0 && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-lavender-100 px-4 py-3 shadow-soft">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-peach-100 px-3 py-2 text-xs text-plum-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-plum-400 hover:text-plum-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Quick commands */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-lavender-100 pt-3">
          {QUICK_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.label}
                onClick={() => handleCommand(cmd.text)}
                disabled={phase === 'thinking'}
                className="flex items-center gap-1.5 rounded-full bg-lavender-100/80 px-3 py-1.5 text-xs font-semibold text-plum-600 transition-all hover:bg-lavender-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Icon className="h-3 w-3" /> {cmd.label}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder={phase === 'listening' ? 'Listening… or type your reply' : 'Type your reply…'}
            className="flex-1 rounded-2xl border border-lavender-200 bg-ivory px-4 py-2.5 text-sm text-plum-800 placeholder:text-plum-300 focus:border-plum-400 focus:outline-none focus:ring-2 focus:ring-plum-200"
          />
          <Button onClick={handleSendText} disabled={phase === 'thinking' || !text.trim()} size="md">
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildOpening(userName: string, level: TutorLevel): string {
  return `Hi! My name is ${userName}. I am a ${level} English learner and I would like to learn a new vocabulary word today. Please teach me one.`;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 animate-bounce rounded-full bg-plum-400" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-plum-400" style={{ animationDelay: '0.15s' }} />
      <span className="h-2 w-2 animate-bounce rounded-full bg-plum-400" style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

function ConnectionBadge({
  status, onRetry, compact,
}: { status: ConnectionStatus; onRetry: () => void; compact?: boolean }) {
  const config: Record<ConnectionStatus, { label: string; cls: string; icon: typeof Wifi }> = {
    unknown: { label: 'Checking connection…', cls: 'bg-lavender-100 text-plum-500', icon: Wifi },
    checking: { label: 'Checking connection…', cls: 'bg-lavender-100 text-plum-500', icon: Loader2 },
    connected: { label: 'Tutor online', cls: 'bg-plum-700/10 text-plum-700', icon: CheckCircle2 },
    disconnected: { label: 'Backend not connected', cls: 'bg-peach-200 text-plum-700', icon: WifiOff },
    'missing-key': { label: 'AI key needed', cls: 'bg-butter-300/60 text-plum-700', icon: AlertCircle },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold', c.cls, compact && 'text-[11px] px-2.5 py-1')}>
      <Icon className={cn('h-3.5 w-3.5', status === 'checking' && 'animate-spin')} />
      <span>{c.label}</span>
      {(status === 'disconnected' || status === 'missing-key') && (
        <button onClick={onRetry} className="ml-1 flex items-center gap-0.5 hover:opacity-70" title="Retry connection check">
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function Waveform({ active, speaking }: { active: boolean; speaking: boolean }) {
  const bars = 9;
  return (
    <div className="flex h-8 items-center justify-center gap-1" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const center = Math.abs(i - (bars - 1) / 2);
        const baseHeight = 4 + center * 1.5;
        return (
          <span
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-200',
              speaking ? 'bg-butter-400' : 'bg-lavender-300',
              active ? 'animate-orbListen' : ''
            )}
            style={{
              height: active ? `${baseHeight + (i % 3) * 4}px` : '4px',
              animationDelay: `${i * 0.08}s`,
              animationDuration: speaking ? '0.6s' : '1s',
            }}
          />
        );
      })}
    </div>
  );
}
