import { create } from 'zustand';

// Tier 1: synchronous lexicon — <10ms, no network
const CRISIS_PATTERNS = [
  /\bsuicid[e|al]*\b/i,
  /\bkill\s+myself\b/i,
  /\bend\s+(my\s+)?life\b/i,
  /\bnot\s+worth\s+living\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[- ]?harm\b/i,
  /\bcut\s+myself\b/i,
  /\boverdose\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bcan'?t\s+go\s+on\b/i,
  /\bgive\s+up\s+on\s+(my\s+)?life\b/i,
  /\bhurt\s+myself\b/i,
  /\bdon'?t\s+want\s+to\s+be\s+here\b/i,
  /\bend\s+it\s+(all)?\b/i,
];

interface CrisisState {
  isCrisis: boolean;
  postCrisisMode: boolean;
  checkCrisis: (text: string) => boolean;
  setNotCrisis: () => void;
  escalateToCrisis: () => void;
}

export const useCrisisStore = create<CrisisState>((set) => ({
  isCrisis: false,
  postCrisisMode: false,

  checkCrisis: (text: string) => {
    const detected = CRISIS_PATTERNS.some((pattern) => pattern.test(text));
    if (detected) set({ isCrisis: true });
    return detected;
  },

  // Called by Tier 2 Haiku check or any async escalation
  escalateToCrisis: () => set({ isCrisis: true }),

  setNotCrisis: () => set({ isCrisis: false, postCrisisMode: true }),
}));
