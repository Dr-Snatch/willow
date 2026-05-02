import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  hasOnboarded: boolean;
  setName: (name: string) => void;
  completeOnboarding: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      hasOnboarded: false,
      setName: (name) => set({ name }),
      completeOnboarding: (name) => set({ name, hasOnboarded: true }),
    }),
    { name: 'willow-user' }
  )
);
