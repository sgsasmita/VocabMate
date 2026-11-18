import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value]);

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof v === 'function' ? (v as (p: T) => T)(prev) : v));
  }, []);

  return [value, set];
}

export interface WordProgress {
  saved: boolean;
  learned: boolean;
  learnedAt?: string;
}

export type WordProgressMap = Record<string, WordProgress>;

export interface SessionRecord {
  id: string;
  date: string;
  durationSec: number;
  exchanges: number;
  newWords: number;
}

export interface QuizRecord {
  id: string;
  date: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface AppState {
  userName: string;
  streak: number;
  lastActiveDate: string;
  dailyGoal: number;
  wordsLearnedToday: number;
  wordsLearnedTodayDate: string;
  sessions: SessionRecord[];
  quizzes: QuizRecord[];
}

const DEFAULT_STATE: AppState = {
  userName: 'Friend',
  streak: 1,
  lastActiveDate: new Date().toDateString(),
  dailyGoal: 3,
  wordsLearnedToday: 0,
  wordsLearnedTodayDate: new Date().toDateString(),
  sessions: [],
  quizzes: [],
};
