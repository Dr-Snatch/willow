import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionInsight {
  id: string;
  timestamp: number;
  summary: string;
  patterns: string[];
}

export interface ProfileNote {
  text: string;
  timestamp: number;
  mood: number;
}

interface ProfileState {
  sessionInsights: SessionInsight[];
  patternCounts: Record<string, number>;
  sessionCount: number;
  recentNotes: ProfileNote[];
  handoff: string;
  handoffUpdatedAt: number | null;
  addSessionInsight: (insight: Omit<SessionInsight, 'id'>) => void;
  addCheckInNote: (text: string, mood: number) => void;
  setHandoff: (text: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      sessionInsights: [],
      patternCounts: {},
      sessionCount: 0,
      recentNotes: [],
      handoff: '',
      handoffUpdatedAt: null,

      addSessionInsight: (insight) => {
        const id = `${insight.timestamp}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => {
          const counts = { ...state.patternCounts };
          insight.patterns.forEach((p) => {
            counts[p] = (counts[p] ?? 0) + 1;
          });
          return {
            sessionInsights: [{ ...insight, id }, ...state.sessionInsights].slice(0, 30),
            patternCounts: counts,
            sessionCount: state.sessionCount + 1,
          };
        });
      },

      addCheckInNote: (text, mood) => {
        if (!text.trim()) return;
        set((state) => ({
          recentNotes: [
            { text: text.trim(), timestamp: Date.now(), mood },
            ...state.recentNotes,
          ].slice(0, 20),
        }));
      },

      setHandoff: (text) => set({ handoff: text, handoffUpdatedAt: Date.now() }),
    }),
    { name: 'willow-profile' }
  )
);
