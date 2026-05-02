import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dateStr } from '../types';

interface StreakState {
  health: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lastCheckInDate: string | null;
  lastConversationDate: string | null;
  onCheckIn: () => void;
  onConversation: () => void;
  checkDecay: () => void;
}

function markActive(set: (fn: (s: StreakState) => Partial<StreakState>) => void, get: () => StreakState) {
  const today = dateStr();
  const state = get();
  if (state.lastActiveDate === today) return;

  const lad = state.lastActiveDate;
  let newStreak = 1;
  if (lad) {
    const last = new Date(lad);
    const now = new Date(today);
    const diff = Math.round((now.getTime() - last.getTime()) / 86400000);
    if (diff === 1) newStreak = state.streak + 1;
  }

  set((s) => ({
    lastActiveDate: today,
    streak: newStreak,
    longestStreak: Math.max(newStreak, s.longestStreak),
    health: Math.min(100, s.health + 10),
  }));
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      health: 40,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      lastCheckInDate: null,
      lastConversationDate: null,

      onCheckIn: () => {
        const today = dateStr();
        set((s) => ({
          lastCheckInDate: today,
          health: Math.min(100, s.health + 8),
        }));
        if (get().lastConversationDate === today) markActive(set, get);
      },

      onConversation: () => {
        const today = dateStr();
        set((s) => ({
          lastConversationDate: today,
          health: Math.min(100, s.health + 4),
        }));
        if (get().lastCheckInDate === today) markActive(set, get);
      },

      checkDecay: () => {
        const lad = get().lastActiveDate;
        if (!lad) return;
        const today = dateStr();
        if (lad === today) return;
        const msPerDay = 86400000;
        const diffDays = Math.round((new Date(today).getTime() - new Date(lad).getTime()) / msPerDay);
        if (diffDays <= 1) return;
        const missed = diffDays - 1;
        set((s) => ({
          health: Math.max(0, s.health - missed * 15),
          streak: 0,
        }));
      },
    }),
    { name: 'willow-streak' }
  )
);
