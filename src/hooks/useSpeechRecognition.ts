import { useCallback, useEffect, useRef, useState } from 'react';

type RecognitionState = 'idle' | 'listening' | 'error';

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (finalText: string) => void;
}

export function useSpeechRecognition({ lang = 'en-US', onResult }: UseSpeechRecognitionOptions = {}) {
  const [state, setState] = useState<RecognitionState>('idle');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const listeningRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const supported =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    setError(null);
    if (!supported) {
      setError('Speech recognition is not available in this browser. Use the text box below.');
      setState('error');
      return;
    }
    if (listeningRef.current) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      listeningRef.current = true;
      setState('listening');
      setInterim('');
    };

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText.trim()) {
        setInterim('');
        onResultRef.current?.(finalText.trim());
      }
    };

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      listeningRef.current = false;
      setState('idle');
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        setError('Microphone permission was blocked. You can type your reply instead.');
      } else if (ev.error === 'no-speech') {
        setError('I did not hear anything. Try again or type your reply.');
      } else if (ev.error === 'network') {
        setError('Network issue during speech recognition. Try typing your reply.');
      } else {
        setError('Speech recognition hit a snag. You can type your reply instead.');
      }
    };

    rec.onend = () => {
      listeningRef.current = false;
      setState('idle');
      setInterim('');
    };

    try {
      rec.start();
    } catch {
      listeningRef.current = false;
      setState('idle');
    }
  }, [lang, supported]);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (rec && listeningRef.current) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
    listeningRef.current = false;
    setState('idle');
  }, []);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return { state, interim, error, supported: !!supported, start, stop, clearError: () => setError(null) };
}
