import { Flame, BookOpen, Target, MessageCircle, TrendingUp, Calendar, Award, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { AppStore } from '@/hooks/useAppStore';
import { VOCABULARY } from '@/data/vocabulary';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { formatDate, formatDuration } from '@/lib/utils';

interface ProgressPageProps {
  store: AppStore;
}

export function ProgressPage({ store }: ProgressPageProps) {
  const { state, totalLearned, totalSaved, quizAccuracy, dailyProgress, dailyGoalPct } = store;
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.userName);

  const recentSessions = [...state.sessions].slice(-5).reverse();
  const recentQuizzes = [...state.quizzes].slice(-5).reverse();

  const categoryProgress = VOCABULARY.reduce<Record<string, { learned: number; total: number }>>((acc, w) => {
    acc[w.category] ??= { learned: 0, total: 0 };
    acc[w.category].total += 1;
    if (store.wordProgress[w.id]?.learned) acc[w.category].learned += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Your Progress</h1>
          <p className="mt-1 text-plum-500">A look at how far you've come.</p>
        </div>
        <div className="flex items-center gap-2">
          {editingName ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                store.setUserName(nameInput.trim() || 'Friend');
                setEditingName(false);
              }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="rounded-xl border border-lavender-200 bg-white px-3 py-1.5 text-sm focus:border-plum-400 focus:outline-none"
              />
              <Button size="sm" type="submit">Save</Button>
            </form>
          ) : (
            <button onClick={() => { setNameInput(state.userName); setEditingName(true); }} className="flex items-center gap-1.5 text-sm font-semibold text-plum-500 hover:text-plum-700">
              <Pencil className="h-3.5 w-3.5" /> {state.userName}
            </button>
          )}
        </div>
      </header>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <BigStat icon={<Flame className="h-5 w-5" />} value={`${state.streak}`} label="Day streak" accent="peach" />
        <BigStat icon={<BookOpen className="h-5 w-5" />} value={`${totalLearned}`} label="Words learned" accent="lavender" />
        <BigStat icon={<Target className="h-5 w-5" />} value={`${quizAccuracy}%`} label="Quiz accuracy" accent="butter" />
        <BigStat icon={<MessageCircle className="h-5 w-5" />} value={`${state.sessions.length}`} label="Sessions" accent="plum" />
      </div>

      {/* Daily goal */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold">Today's goal</h2>
            <p className="text-sm text-plum-500">{dailyProgress} of {state.dailyGoal} words learned today.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-plum-400">Daily goal:</span>
            <div className="flex items-center gap-1">
              {[3, 5, 10].map((g) => (
                <button
                  key={g}
                  onClick={() => store.setDailyGoal(g)}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold transition-all ${
                    state.dailyGoal === g ? 'bg-plum-700 text-ivory' : 'bg-lavender-100 text-plum-600 hover:bg-lavender-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ProgressBar value={dailyGoalPct} className="mt-4 h-3" colorClass="bg-butter-400" />
        <div className="mt-2 text-right text-xs font-semibold text-plum-400">{dailyGoalPct}%</div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category breakdown */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-plum-400" />
            <h2 className="font-serif text-xl font-semibold">By category</h2>
          </div>
          <div className="mt-4 space-y-4">
            {Object.entries(categoryProgress).map(([cat, { learned, total }]) => {
              const pct = total ? Math.round((learned / total) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-plum-700">{cat}</span>
                    <span className="text-plum-400">{learned}/{total}</span>
                  </div>
                  <ProgressBar value={pct} className="mt-1.5" colorClass="bg-plum-500" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Saved words */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-plum-400" />
            <h2 className="font-serif text-xl font-semibold">Saved words</h2>
          </div>
          <div className="mt-4">
            <div className="font-serif text-4xl font-semibold text-plum-800">{totalSaved}</div>
            <p className="text-sm text-plum-500">words bookmarked for later.</p>
          </div>
        </Card>
      </div>

      {/* Recent sessions */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-plum-400" />
          <h2 className="font-serif text-xl font-semibold">Recent sessions</h2>
        </div>
        {recentSessions.length === 0 ? (
          <p className="mt-4 text-sm text-plum-400">No sessions yet. Start a conversation with your voice tutor!</p>
        ) : (
          <ul className="mt-4 divide-y divide-lavender-100">
            {recentSessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-semibold text-plum-700">{formatDate(s.date)}</div>
                  <div className="text-xs text-plum-400">{s.exchanges} exchanges · {s.newWords} words covered</div>
                </div>
                <Badge className="bg-lavender-100 text-plum-600">{formatDuration(s.durationSec)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Recent quizzes */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-plum-400" />
          <h2 className="font-serif text-xl font-semibold">Recent quizzes</h2>
        </div>
        {recentQuizzes.length === 0 ? (
          <p className="mt-4 text-sm text-plum-400">No quizzes yet. Take a practice quiz to track your accuracy!</p>
        ) : (
          <ul className="mt-4 divide-y divide-lavender-100">
            {recentQuizzes.map((q) => (
              <li key={q.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-semibold text-plum-700">{formatDate(q.date)}</div>
                  <div className="text-xs text-plum-400">{q.correct}/{q.total} correct</div>
                </div>
                <Badge className={q.accuracy >= 80 ? 'bg-butter-300 text-plum-800' : 'bg-lavender-100 text-plum-600'}>{q.accuracy}%</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function BigStat({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: 'peach' | 'lavender' | 'butter' | 'plum' }) {
  const accents: Record<string, string> = {
    peach: 'bg-peach-200 text-plum-700',
    lavender: 'bg-lavender-200 text-plum-700',
    butter: 'bg-butter-300 text-plum-700',
    plum: 'bg-plum-700 text-ivory',
  };
  return (
    <Card className="p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accents[accent]}`}>{icon}</span>
      <div className="mt-3 font-serif text-3xl font-semibold text-plum-800">{value}</div>
      <div className="text-xs uppercase tracking-widest text-plum-400">{label}</div>
    </Card>
  );
}
