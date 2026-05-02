export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Message {
  role: Role;
  content: string;
  timestamp?: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface CheckInEntry {
  mood: number;
  sleep: number;
  notes: string;
  timestamp: number;
  timeOfDay: TimeOfDay;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

export function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function dateStr(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
