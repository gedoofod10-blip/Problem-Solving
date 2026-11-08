"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TOTAL_LEVELS } from "@/data/curriculum";

export interface LevelResult {
  levelId: number;
  score: number;
  total: number;
  xpEarned: number;
  passed: boolean;
  completedAt: string;
}

export interface ProgressState {
  userId: string;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  unlockedLevels: number[];
  completedLevels: number[];
  perfectLevels: number[];
  results: Record<number, LevelResult>;
  totalCorrect: number;
  totalAnswered: number;
  hearts: number;
  dailyXp: number;
  dailyDate: string | null;
}

const STORAGE_KEY = "algo-mind-progress-v1";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeUserId(): string {
  return "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function defaultState(): ProgressState {
  return {
    userId: makeUserId(),
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    unlockedLevels: [1],
    completedLevels: [],
    perfectLevels: [],
    results: {},
    totalCorrect: 0,
    totalAnswered: 0,
    hearts: 3,
    dailyXp: 0,
    dailyDate: null,
  };
}

function loadState(): ProgressState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as ProgressState;
    return { ...defaultState(), ...parsed, unlockedLevels: parsed.unlockedLevels?.length ? parsed.unlockedLevels : [1] };
  } catch {
    return defaultState();
  }
}

interface ProgressContextValue {
  state: ProgressState;
  isLoaded: boolean;
  addXp: (amount: number) => void;
  recordAnswer: (correct: boolean) => void;
  completeLevel: (levelId: number, score: number, total: number, xpEarned: number) => { passed: boolean; isNewUnlock: boolean; leveledUp: boolean };
  isUnlocked: (levelId: number) => boolean;
  isCompleted: (levelId: number) => boolean;
  resetProgress: () => void;
  touchActivity: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const dbb = new Date(b + "T00:00:00").getTime();
  return Math.round((dbb - da) / 86400000);
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    // streak maintenance on load
    const today = todayStr();
    let next = { ...loaded };
    if (loaded.dailyDate !== today) {
      next = { ...next, dailyXp: 0, dailyDate: today };
    }
    if (loaded.lastActiveDate && loaded.lastActiveDate !== today) {
      const diff = daysBetween(loaded.lastActiveDate, today);
      if (diff > 1) {
        next = { ...next, streak: 0 };
      }
    }
    if (!loaded.lastActiveDate) {
      next = { ...next, streak: 1, lastActiveDate: today };
    }
    setState(next);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    // sync to server (fire & forget)
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: state.userId,
        xp: state.xp,
        streak: state.streak,
        unlockedLevels: state.unlockedLevels,
        completedLevels: state.completedLevels,
        lastActive: state.lastActiveDate,
        totalCorrect: state.totalCorrect,
      }),
    }).catch(() => {});
  }, [state, isLoaded]);

  const touchActivity = useCallback(() => {
    setState((prev) => {
      const today = todayStr();
      if (prev.lastActiveDate === today) return prev;
      const diff = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : 99;
      const newStreak = diff === 1 ? prev.streak + 1 : 1;
      return { ...prev, lastActiveDate: today, streak: newStreak };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      const today = todayStr();
      const sameDay = prev.dailyDate === today;
      return {
        ...prev,
        xp: prev.xp + amount,
        dailyXp: (sameDay ? prev.dailyXp : 0) + amount,
        dailyDate: today,
      };
    });
  }, []);

  const recordAnswer = useCallback((correct: boolean) => {
    setState((prev) => ({
      ...prev,
      totalAnswered: prev.totalAnswered + 1,
      totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
    }));
  }, []);

  const completeLevel = useCallback((levelId: number, score: number, total: number, xpEarned: number) => {
    const passed = score / total >= 0.6;
    const perfect = score === total;
    let isNewUnlock = false;

    setState((prev) => {
      const today = todayStr();
      const sameDay = prev.dailyDate === today;
      const completedLevels = passed && !prev.completedLevels.includes(levelId)
        ? [...prev.completedLevels, levelId]
        : prev.completedLevels;
      const perfectLevels = passed && perfect && !prev.perfectLevels.includes(levelId)
        ? [...prev.perfectLevels, levelId]
        : prev.perfectLevels;
      let unlockedLevels = [...prev.unlockedLevels];
      const nextLevel = levelId + 1;
      if (passed && nextLevel <= TOTAL_LEVELS && !unlockedLevels.includes(nextLevel)) {
        unlockedLevels.push(nextLevel);
        isNewUnlock = true;
      }
      const prevBest = prev.results[levelId]?.score ?? -1;
      const isBetter = score > prevBest;
      return {
        ...prev,
        xp: isBetter ? prev.xp + xpEarned : prev.xp + Math.min(xpEarned, 10),
        dailyXp: (sameDay ? prev.dailyXp : 0) + (isBetter ? xpEarned : Math.min(xpEarned, 10)),
        dailyDate: today,
        completedLevels,
        perfectLevels,
        unlockedLevels,
        results: {
          ...prev.results,
          [levelId]: {
            levelId,
            score: Math.max(score, prevBest < 0 ? score : prevBest),
            total,
            xpEarned: Math.max(xpEarned, prev.results[levelId]?.xpEarned ?? 0),
            passed: prev.results[levelId]?.passed || passed,
            completedAt: new Date().toISOString(),
          },
        },
      };
    });

    touchActivity();
    return { passed, isNewUnlock, leveledUp: isNewUnlock };
  }, [touchActivity]);

  const isUnlocked = useCallback((levelId: number) => state.unlockedLevels.includes(levelId), [state.unlockedLevels]);
  const isCompleted = useCallback((levelId: number) => state.completedLevels.includes(levelId), [state.completedLevels]);

  const resetProgress = useCallback(() => {
    const fresh = defaultState();
    // keep same user id base? generate new
    setState({ ...fresh, streak: 1, lastActiveDate: todayStr(), dailyDate: todayStr() });
  }, []);

  const value = useMemo<ProgressContextValue>(() => ({
    state, isLoaded, addXp, recordAnswer, completeLevel, isUnlocked, isCompleted, resetProgress, touchActivity,
  }), [state, isLoaded, addXp, recordAnswer, completeLevel, isUnlocked, isCompleted, resetProgress, touchActivity]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
