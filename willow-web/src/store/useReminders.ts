import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
  timeLabel: string;
  instructions: string;
  prescriber: string;
  takenDates: string[];
}

export interface WellnessReminder {
  id: string;
  title: string;
  timeLabel: string;
  days: number[];
  enabled: boolean;
}

export interface ActivityDay {
  day: string;
  steps: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const ACTIVITY_WEEK: ActivityDay[] = [
  { day: 'Mon', steps: 7420 },
  { day: 'Tue', steps: 5130 },
  { day: 'Wed', steps: 2210 },
  { day: 'Thu', steps: 6810 },
  { day: 'Fri', steps: 8360 },
  { day: 'Sat', steps: 5900 },
  { day: 'Sun', steps: 4210 },
];

interface RemindersState {
  medications: MedicationEntry[];
  wellnessReminders: WellnessReminder[];
  stepGoal: number;
  stepSharingEnabled: boolean;
  activityWeek: ActivityDay[];
  todaySteps: number;

  toggleMedicationTaken: (id: string) => void;
  toggleWellnessReminder: (id: string) => void;
  updateWellnessTime: (id: string, timeLabel: string) => void;
  updateWellnessDays: (id: string, days: number[]) => void;
  addWellnessReminder: (title: string, timeLabel: string, days: number[]) => void;
  removeWellnessReminder: (id: string) => void;
  setStepGoal: (goal: number) => void;
  setStepSharing: (enabled: boolean) => void;
  setTodaySteps: (steps: number) => void;
}

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set) => ({
      medications: [
        {
          id: 'med-1',
          name: 'Sertraline',
          dose: '50mg',
          timeLabel: '8:30 am',
          instructions: 'Take once daily with water.',
          prescriber: 'Dr. Rivera',
          takenDates: [todayKey()],
        },
        {
          id: 'med-2',
          name: 'Vitamin D',
          dose: '1000 IU',
          timeLabel: '7:00 pm',
          instructions: 'Take with food if possible.',
          prescriber: 'Dr. Rivera',
          takenDates: [],
        },
      ],
      wellnessReminders: [
        { id: 'wr-1', title: 'Evening walk',    timeLabel: '6:00 pm', days: [1,2,3,4,5,6,7], enabled: true },
        { id: 'wr-2', title: 'Daily check-in',  timeLabel: '8:30 pm', days: [1,2,3,4,5,6,7], enabled: true },
        { id: 'wr-3', title: 'Wind down',        timeLabel: '10:00 pm', days: [1,2,3,4,5,6,7], enabled: true },
      ],
      stepGoal: 6000,
      stepSharingEnabled: true,
      activityWeek: ACTIVITY_WEEK,
      todaySteps: 3241,

      toggleMedicationTaken: (id) =>
        set((s) => ({
          medications: s.medications.map((m) => {
            if (m.id !== id) return m;
            const today = todayKey();
            const taken = m.takenDates.includes(today);
            return {
              ...m,
              takenDates: taken
                ? m.takenDates.filter((d) => d !== today)
                : [...m.takenDates, today],
            };
          }),
        })),

      toggleWellnessReminder: (id) =>
        set((s) => ({
          wellnessReminders: s.wellnessReminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      updateWellnessTime: (id, timeLabel) =>
        set((s) => ({
          wellnessReminders: s.wellnessReminders.map((r) =>
            r.id === id ? { ...r, timeLabel } : r
          ),
        })),

      updateWellnessDays: (id, days) =>
        set((s) => ({
          wellnessReminders: s.wellnessReminders.map((r) =>
            r.id === id ? { ...r, days } : r
          ),
        })),

      addWellnessReminder: (title, timeLabel, days) =>
        set((s) => ({
          wellnessReminders: [
            ...s.wellnessReminders,
            { id: `wr-${Date.now()}`, title: title || 'Custom reminder', timeLabel, days, enabled: true },
          ],
        })),

      removeWellnessReminder: (id) =>
        set((s) => ({
          wellnessReminders: s.wellnessReminders.filter((r) => r.id !== id),
        })),

      setStepGoal: (goal) => set({ stepGoal: goal }),
      setStepSharing: (enabled) => set({ stepSharingEnabled: enabled }),
      setTodaySteps: (steps) => set({ todaySteps: steps }),
    }),
    { name: 'willow-reminders' }
  )
);
