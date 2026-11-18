import { useEffect, useState } from 'react';
import { GraduationCap, Home, Mic, BookOpen, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PageId = 'home' | 'tutor' | 'library' | 'practice' | 'progress';

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof Home;
}

const NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tutor', label: 'Voice Tutor', icon: Mic },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'practice', label: 'Practice', icon: Target },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
];

interface AppShellProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  streak: number;
  children: React.ReactNode;
}

export function AppShell({ current, onNavigate, streak, children }: AppShellProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-ivory text-plum-800">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-lavender-200/40 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-butter-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-peach-200/30 blur-3xl" />
      </div>

      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled ? 'glass border-b border-lavender-100/70 shadow-soft' : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum-700 text-butter-300 shadow-soft transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-semibold tracking-tight text-plum-800">VocabMate</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-plum-400">Voice-first English</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300',
                    active
                      ? 'bg-plum-700 text-ivory shadow-soft'
                      : 'text-plum-600 hover:bg-lavender-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 rounded-2xl bg-butter-300/40 px-3 py-2 text-sm font-semibold text-plum-700">
            <span aria-hidden>🔥</span>
            <span>{streak}</span>
            <span className="hidden text-xs font-500 text-plum-500 sm:inline">day streak</span>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                  active ? 'bg-plum-700 text-ivory' : 'text-plum-600 hover:bg-lavender-100'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
        <div key={current} className="view-enter">{children}</div>
      </main>

      <footer className="relative border-t border-lavender-100/70 py-6 text-center text-xs text-plum-400">
        VocabMate — learn English one conversation at a time.
      </footer>
    </div>
  );
}
