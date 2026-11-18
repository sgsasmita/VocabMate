import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'button';
}

export function Card({ children, className, onClick, as = 'div' }: CardProps) {
  const Comp = as as 'div';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'rounded-3xl bg-white shadow-soft border border-lavender-100/60 transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-card hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
    >
      {children}
    </Comp>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  title?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  type = 'button',
  title,
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      'bg-plum-700 text-ivory hover:bg-plum-800 shadow-soft hover:shadow-card',
    secondary:
      'bg-lavender-200 text-plum-800 hover:bg-lavender-300 shadow-soft',
    accent: 'bg-butter-300 text-plum-800 hover:bg-butter-400 shadow-soft',
    ghost: 'text-plum-700 hover:bg-lavender-100',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3.5 py-2 text-sm rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-2xl',
    lg: 'px-7 py-3.5 text-base rounded-2xl',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-plum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        className
      )}
    >
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClass?: string;
}

export function ProgressBar({ value, max = 100, className, colorClass = 'bg-plum-600' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('h-2 w-full rounded-full bg-lavender-100 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
