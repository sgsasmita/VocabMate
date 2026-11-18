import { useCallback, useMemo } from 'react';
import { useLocalStorage, type AppState, type WordProgressMap, type SessionRecord, type QuizRecord } from './useLocalStorage';
import { VOCABULARY } from '@/data/vocabulary';

const PROGRESS_KEY = 'vocabmate.wordprogress';
const STATE_KEY = 'vocabmate.state';

function todayStr() {
  return new Date().toDateString();
}

function daysBetween(a: string, b: string) {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86_400_000);
}

export function useAppStore() {
  const [state, setState] = useLocalStorage<AppState>(STATE_KEY, {
    userName: 'Friend',
    streak: 1,
    lastActiveDate: todayStr(),
    dailyGoal: 3,
    wordsLearnedToday: 0,
    wordsLearnedTodayDate: todayStr(),
    sessions: [],
    quizzes: [],
  });
  const [wordProgress, setWordProgress] = useLocalStorage<WordProgressMap>(PROGRESS_KEY, {});

  // Streak maintenance: run on mount and whenever state is read.
  const ensureStreak = useCallback(() => {
    setState((prev) => {
      const today = todayStr();
      if (prev.lastActiveDate === today) return prev;
      const gap = daysBetween(prev.lastActiveDate, today);
      const streak = gap === 1 ? prev.streak + 1 : gap === 0 ? prev.streak : 1;
      const wordsReset = prev.wordsLearnedTodayDate === today ? prev.wordsLearnedToday : 0;
      return { ...prev, streak, lastActiveDate: today, wordsLearnedToday: wordsReset, wordsLearnedTodayDate: today };
    });
  }, [setState]);

  const setUserName = useCallback((name: string) => setState((p) => ({ ...p, userName: name || 'Friend' })), [setState]);

  const setDailyGoal = useCallback((goal: number) => setState((p) => ({ ...p, dailyGoal: Math.max(1, Math.min(10, goal)) })), [setState]);

  const toggleSaved = useCallback((id: string) => setWordProgress((p) => ({ ...p, [id]: { saved: !p[id]?.saved, learned: p[id]?.learned ?? false } })), [setWordProgress]);

  const markLearned = useCallback((id: string) => {
    setWordProgress((p) => {
      const wasLearned = p[id]?.learned ?? false;
      return { ...p, [id]: { saved: p[id]?.saved ?? false, learned: true, learnedAt: new Date().toISOString() } };
    });
    setState((prev) => {
      const today = todayStr();
      const alreadyCounted = wordProgress[id]?.learned;
      const wordsToday = prev.wordsLearnedTodayDate === today ? prev.wordsLearnedToday : 0;
      if (alreadyCounted) return prev;
      return { ...prev, wordsLearnedToday: wordsToday + 1, wordsLearnedTodayDate: today };
    });
  }, [setWordProgress, setState, wordProgress]);

  const recordSession = useCallback((s: Omit<SessionRecord, 'id' | 'date'>) => {
    setState((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { ...s, id: crypto.randomUUID(), date: new Date().toISOString() }],
    }));
  }, [setState]);

  const recordQuiz = useCallback((q: Omit<QuizRecord, 'id' | 'date' | 'accuracy'>) => {
    setState((prev) => ({
      ...prev,
      quizzes: [...prev.quizzes, { ...q, id: crypto.randomUUID(), date: new Date().toISOString(), accuracy: q.total ? Math.round((q.correct / q.total) * 100) : 0 }],
    }));
  }, [setState]);

  const totalLearned = useMemo(() => Object.values(wordProgress).filter((w) => w.learned).length, [wordProgress]);
  const totalSaved = useMemo(() => Object.values(wordProgress).filter((w) => w.saved).length, [wordProgress]);

  const dailyProgress = state.wordsLearnedTodayDate === todayStr() ? state.wordsLearnedToday : 0;
  const dailyGoalPct = Math.min(100, Math.round((dailyProgress / state.dailyGoal) * 100));

  const quizAccuracy = useMemo(() => {
    if (state.quizzes.length === 0) return 0;
    const totalQ = state.quizzes.reduce((a, q) => a + q.total, 0);
    const totalC = state.quizzes.reduce((a, q) => a + q.correct, 0);
    return totalQ ? Math.round((totalC / totalQ) * 100) : 0;
  }, [state.quizzes]);

  // Word of the day — deterministic based on date
  const wordOfTheDay = useMemo(() => {
    const seed = new Date().getDate() + new Date().getMonth();
    const learnedIds = new Set(Object.entries(wordProgress).filter(([, v]) => v.learned).map(([k]) => k));
    const pool = VOCABULARY.filter((w) => !learnedIds.has(w.id));
    const list = pool.length ? pool : VOCABULARY;
    return list[seed % list.length];
  }, [wordProgress]);

  return {
    state,
    wordProgress,
    ensureStreak,
    setUserName,
    setDailyGoal,
    toggleSaved,
    markLearned,
    recordSession,
    recordQuiz,
    totalLearned,
    totalSaved,
    dailyProgress,
    dailyGoalPct,
    quizAccuracy,
    wordOfTheDay,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
