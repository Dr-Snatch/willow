import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckInEntry, dateStr, getTimeOfDay } from '../types';
import { useStreakStore } from './useStreak';
import { useProfileStore } from './useProfile';

interface CheckInState {
  mood: number | null;
  sleep: number | null;
  thoughts: string;
  history: CheckInEntry[];
  setMood: (mood: number) => void;
  setSleep: (sleep: number) => void;
  setThoughts: (thoughts: string) => void;
  submitCheckIn: () => CheckInEntry | null;
  clearDraft: () => void;
  hasCheckedInToday: () => boolean;
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      mood: null,
      sleep: null,
      thoughts: '',
      history: [],

      setMood: (mood) => set({ mood }),
      setSleep: (sleep) => set({ sleep }),
      setThoughts: (thoughts) => set({ thoughts }),

      hasCheckedInToday: () => {
        const today = dateStr();
        return get().history.some((e) => dateStr(new Date(e.timestamp)) === today);
      },

      submitCheckIn: () => {
        const { mood, sleep, thoughts } = get();
        if (mood === null || sleep === null) return null;
        const now = new Date();
        const entry: CheckInEntry = {
          mood,
          sleep,
          notes: thoughts,
          timestamp: now.getTime(),
          timeOfDay: getTimeOfDay(),
          dayOfWeek: now.getDay(),
        };
        set((state) => ({
          history: [entry, ...state.history].slice(0, 90),
          mood: null,
          sleep: null,
          thoughts: '',
        }));
        useStreakStore.getState().onCheckIn();
        if (thoughts.trim()) {
          useProfileStore.getState().addCheckInNote(thoughts.trim(), mood);
        }
        return entry;
      },

      clearDraft: () => set({ mood: null, sleep: null, thoughts: '' }),
    }),
    { name: 'willow-checkin' }
  )
);
