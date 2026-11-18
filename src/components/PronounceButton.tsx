import { Volume2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PronounceButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function PronounceButton({ text, className, label }: PronounceButtonProps) {
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        play();
      }}
      title={`Pronounce "${text}"`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
        playing
          ? 'bg-butter-300 text-plum-800'
          : 'bg-lavender-100 text-plum-700 hover:bg-lavender-200',
        className
      )}
    >
      <Volume2 className={cn('h-3.5 w-3.5', playing && 'animate-pulse')} />
      {label ?? 'Pronounce'}
    </button>
  );
}
