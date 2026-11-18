import { cn } from '@/lib/utils';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceOrbProps {
  state: OrbState;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SIZES = {
  sm: { wrap: 'h-24 w-24', core: 'h-16 w-16' },
  md: { wrap: 'h-44 w-44', core: 'h-28 w-28' },
  lg: { wrap: 'h-64 w-64', core: 'h-40 w-40' },
};

export function VoiceOrb({ state, size = 'lg', onClick }: VoiceOrbProps) {
  const s = SIZES[size];

  const coreAnim =
    state === 'listening'
      ? 'animate-orbListen'
      : state === 'thinking'
      ? 'animate-orbThink'
      : state === 'speaking'
      ? 'animate-orbSpeak'
      : 'animate-orbPulse';

  const ringColor =
    state === 'listening'
      ? 'border-peach-300'
      : state === 'thinking'
      ? 'border-lavender-300'
      : state === 'speaking'
      ? 'border-butter-300'
      : 'border-lavender-300';

  return (
    <div
      className={cn('relative flex items-center justify-center', s.wrap, onClick && 'cursor-pointer')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label="Voice orb"
    >
      {/* Outer glow */}
      <div className={cn('absolute inset-0 rounded-full orb-glow blur-2xl', state !== 'idle' && 'opacity-100')} />

      {/* Ripples while active */}
      {state !== 'idle' && (
        <>
          <span className={cn('absolute inset-0 rounded-full border-2', ringColor, 'animate-ripple')} />
          <span className={cn('absolute inset-0 rounded-full border-2', ringColor, 'animate-ripple')} style={{ animationDelay: '0.8s' }} />
        </>
      )}

      {/* Floating ring */}
      <div className={cn('absolute inset-2 rounded-full border border-lavender-200/70 animate-floatSlow')} />
      <div className={cn('absolute inset-6 rounded-full border border-butter-200/40 animate-floatSlow')} style={{ animationDelay: '1.5s' }} />

      {/* Core */}
      <div
        className={cn(
          'relative rounded-full orb-core shadow-orb',
          s.core,
          coreAnim
        )}
      >
        {/* Glossy highlight */}
        <div className="absolute left-[18%] top-[14%] h-1/3 w-1/3 rounded-full bg-white/40 blur-md" />
        <div className="absolute bottom-[12%] right-[20%] h-1/4 w-1/4 rounded-full bg-white/20 blur-sm" />
      </div>

      {/* Tiny orbiting dots */}
      <span className="absolute top-1 right-6 h-2 w-2 rounded-full bg-butter-300 animate-floatSlow shadow-soft" />
      <span className="absolute bottom-2 left-8 h-1.5 w-1.5 rounded-full bg-peach-300 animate-floatSlow shadow-soft" style={{ animationDelay: '2s' }} />
    </div>
  );
}
