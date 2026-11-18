import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported || !text.trim()) {
        onEnd?.();
        return;
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.95;
      u.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /en[-_]US/i.test(v.lang) && /female|samantha|google/i.test(v.name)) ||
        voices.find((v) => /en[-_]US/i.test(v.lang)) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (preferred) u.voice = preferred;
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      u.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    setSpeaking(false);
  }, [supported]);

  useEffect(() => {
    if (!supported) return;
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
  }, [supported]);

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, []);

  return { speak, stop, speaking, supported };
}
