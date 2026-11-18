import { Flame, BookOpen, Sparkles, ArrowRight, Calendar, Volume2 } from 'lucide-react';
import type { AppStore } from '@/hooks/useAppStore';
import { VOCABULARY } from '@/data/vocabulary';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { PronounceButton } from '@/components/PronounceButton';
import type { PageId } from '@/components/AppShell';
import { formatDate } from '@/lib/utils';

interface HomePageProps {
  store: AppStore;
  onNavigate: (p: PageId) => void;
}

export function HomePage({ store, onNavigate }: HomePageProps) {
  const { state, wordProgress, totalLearned, dailyProgress, dailyGoalPct, wordOfTheDay } = store;

  const recent = Object.entries(wordProgress)
    .filter(([, v]) => v.learned && v.learnedAt)
    .sort((a, b) => new Date(b[1].learnedAt!).getTime() - new Date(a[1].learnedAt!).getTime())
    .slice(0, 4)
    .map(([id]) => VOCABULARY.find((w) => w.id === id))
    .filter(Boolean);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-plum-700 via-plum-700 to-plum-600 p-6 text-ivory shadow-card sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lavender-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-butter-300/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <Badge className="bg-butter-300/20 text-butter-200">
              <Sparkles className="h-3 w-3" /> {greeting}
            </Badge>
            <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Welcome back, {state.userName}.
            </h1>
            <p className="text-plum-100/80 text-base leading-relaxed">
              You're on a {state.streak}-day streak. Keep the momentum going — your voice tutor is ready whenever you are.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button variant="accent" size="lg" onClick={() => onNavigate('tutor')}>
                <Volume2 className="h-4 w-4" /> Start Learning
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('library')}
                className="bg-white/10 text-ivory hover:bg-white/20"
              >
                Browse Library <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-serif font-semibold text-butter-300">{state.streak}</span>
              <span className="text-xs uppercase tracking-widest text-plum-100/70">day streak</span>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-4xl font-serif font-semibold text-lavender-300">{totalLearned}</span>
              <span className="text-xs uppercase tracking-widest text-plum-100/70">words learned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Learning streak"
          value={`${state.streak} days`}
          accent="peach"
          sub="Keep showing up daily"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total words learned"
          value={`${totalLearned}`}
          accent="lavender"
          sub={`of ${VOCABULARY.length} in the library`}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Daily goal"
          value={`${dailyProgress} / ${state.dailyGoal}`}
          accent="butter"
          sub="words today"
        >
          <ProgressBar value={dailyGoalPct} className="mt-3" colorClass="bg-butter-400" />
        </StatCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Word of the day */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-lavender-100 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold">Word of the day</h2>
            <Badge className="bg-lavender-200 text-plum-700">
              <Sparkles className="h-3 w-3" /> {wordOfTheDay.category}
            </Badge>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-serif text-3xl font-semibold text-plum-800">{wordOfTheDay.word}</h3>
              <span className="text-sm text-plum-400">{wordOfTheDay.phonetic}</span>
              <span className="text-xs italic text-plum-400">{wordOfTheDay.partOfSpeech}</span>
            </div>
            <p className="mt-3 text-plum-700 leading-relaxed">{wordOfTheDay.meaning}</p>
            <p className="mt-3 rounded-2xl bg-lavender-100/70 px-4 py-3 text-sm italic text-plum-700">
              "{wordOfTheDay.example}"
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <PronounceButton text={wordOfTheDay.word} label="Hear it" />
              <Button variant="ghost" size="sm" onClick={() => onNavigate('library')}>
                Explore more <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent vocabulary */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-lavender-100 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold">Recent vocabulary</h2>
            <button onClick={() => onNavigate('library')} className="text-xs font-semibold text-plum-500 hover:text-plum-700">
              See all
            </button>
          </div>
          <div className="p-4">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-100">
                  <BookOpen className="h-5 w-5 text-plum-400" />
                </div>
                <p className="text-sm text-plum-500">No words learned yet. Start a session with your tutor!</p>
                <Button size="sm" onClick={() => onNavigate('tutor')}>Start a session</Button>
              </div>
            ) : (
              <ul className="space-y-1">
                {recent.map((w) => (
                  <li key={w!.id}>
                    <button
                      onClick={() => onNavigate('library')}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-lavender-100/70"
                    >
                      <div>
                        <div className="font-serif text-base font-semibold text-plum-800">{w!.word}</div>
                        <div className="text-xs text-plum-400">{w!.category} · learned {formatDate(wordProgress[w!.id].learnedAt!)}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-plum-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: 'peach' | 'lavender' | 'butter';
  children?: React.ReactNode;
}) {
  const accents: Record<string, string> = {
    peach: 'bg-peach-200 text-plum-700',
    lavender: 'bg-lavender-200 text-plum-700',
    butter: 'bg-butter-300 text-plum-700',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-plum-400">{label}</div>
          <div className="mt-1 font-serif text-2xl font-semibold text-plum-800">{value}</div>
          {sub && <div className="mt-0.5 text-xs text-plum-400">{sub}</div>}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accents[accent]}`}>{icon}</span>
      </div>
      {children}
    </Card>
  );
}
