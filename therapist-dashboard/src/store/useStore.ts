import { create } from 'zustand'
import type { Section, PatientTab, PatientDetailState, Template } from '../types'
import { PATIENTS, DEFAULT_PATIENT_COPING_PLANS, TEMPLATES } from '../data/mock'

function defaultPatientState(patientId: string): PatientDetailState {
  const patient = PATIENTS.find(p => p.id === patientId)
  return {
    companionEnabled: patient?.status !== 'crisis',
    giftsEnabled: patient?.status !== 'crisis',
    streakEnabled: false,
    growthPhraseEnabled: true,
    rewardMessage: '',
    highRisk: patient?.status === 'crisis',
    monitorEpisodes: patient?.hasEpisodeSignal ?? false,
    clinicalNotes: '',
    copingPlans: DEFAULT_PATIENT_COPING_PLANS[patientId] ?? [],
    exportDateFrom: '2025-01-01',
    exportDateTo: new Date().toISOString().split('T')[0],
    exportQuickRange: 'Last month',
    exportFormat: 'PDF',
    exportIncludes: {
      mood: true,
      conversations: true,
      medication: true,
      activity: false,
      episodeSignals: true,
      copingUsage: true,
    },
  }
}

interface AvailabilityState {
  sessionDuration: number
  bufferMinutes: number
  sessionType: 'Video' | 'Phone' | 'In-person'
  workingDays: Record<string, boolean>
  startTime: string
  endTime: string
  minNoticeHours: number
  bookAheadWeeks: number
}

interface NotificationState {
  crisisFlags: boolean
  episodeSignals: boolean
  urgentPatterns: boolean
  weeklyDigest: boolean
  weekCompletions: boolean
  sessionReminders: boolean
  preBriefReady: boolean
  quietEnabled: boolean
  quietStart: string
  quietEnd: string
}

interface EngagementDefaults {
  companionEnabled: boolean
  giftsEnabled: boolean
  streakEnabled: boolean
  growthPhraseEnabled: boolean
}

interface SecurityState {
  biometricEnabled: boolean
  autoLockMinutes: number
}

interface AccountState {
  fullName: string
  title: string
  specialisation: string
  bio: string
}

interface StoreState {
  // Navigation
  activeSection: Section
  setActiveSection: (s: Section) => void

  // Patient selection
  selectedPatientId: string | null
  selectedPatientTab: PatientTab
  selectPatient: (id: string, tab?: PatientTab) => void
  clearPatient: () => void

  // Template selection
  selectedTemplateId: string | null
  selectTemplate: (id: string | null) => void
  templates: Template[]
  updateTemplate: (id: string, updates: Partial<Template>) => void
  createTemplate: () => void

  // Per-patient state
  patientState: Record<string, PatientDetailState>
  updatePatient: (id: string, updates: Partial<PatientDetailState>) => void
  updatePatientNested: <K extends keyof PatientDetailState>(
    id: string,
    key: K,
    subKey: string,
    value: unknown
  ) => void
  addCopingPlan: (patientId: string, name: string, trigger: string, response: string) => void
  deactivateCopingPlan: (patientId: string, planId: string) => void

  // Availability
  availability: AvailabilityState
  updateAvailability: (updates: Partial<AvailabilityState>) => void

  // Notifications
  notifications: NotificationState
  updateNotification: (key: keyof NotificationState, value: boolean | string) => void

  // Engagement defaults
  engagementDefaults: EngagementDefaults
  updateEngagementDefault: (key: keyof EngagementDefaults, value: boolean) => void

  // Security
  security: SecurityState
  updateSecurity: (updates: Partial<SecurityState>) => void

  // Account
  account: AccountState
  updateAccount: (updates: Partial<AccountState>) => void
}

export const useStore = create<StoreState>((set, get) => ({
  activeSection: 'overview',
  setActiveSection: (s) => set({ activeSection: s }),

  selectedPatientId: null,
  selectedPatientTab: 'brief',
  selectPatient: (id, tab = 'brief') => {
    const state = get()
    if (!state.patientState[id]) {
      set((s) => ({
        patientState: { ...s.patientState, [id]: defaultPatientState(id) },
      }))
    }
    set({ selectedPatientId: id, selectedPatientTab: tab })
  },
  clearPatient: () => set({ selectedPatientId: null }),

  selectedTemplateId: TEMPLATES[0]?.id ?? null,
  selectTemplate: (id) => set({ selectedTemplateId: id }),
  templates: TEMPLATES,
  updateTemplate: (id, updates) =>
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  createTemplate: () => {
    const id = `t${Date.now()}`
    set((s) => ({
      templates: [
        ...s.templates,
        { id, name: 'New template', trigger: '', response: '', status: 'Draft', appliedToCount: 0 },
      ],
      selectedTemplateId: id,
    }))
  },

  patientState: Object.fromEntries(PATIENTS.map((p) => [p.id, defaultPatientState(p.id)])),
  updatePatient: (id, updates) =>
    set((s) => ({
      patientState: {
        ...s.patientState,
        [id]: { ...s.patientState[id], ...updates },
      },
    })),
  updatePatientNested: (id, key, subKey, value) =>
    set((s) => ({
      patientState: {
        ...s.patientState,
        [id]: {
          ...s.patientState[id],
          [key]: {
            ...(s.patientState[id][key] as Record<string, unknown>),
            [subKey]: value,
          },
        },
      },
    })),
  addCopingPlan: (patientId, name, trigger, response) =>
    set((s) => ({
      patientState: {
        ...s.patientState,
        [patientId]: {
          ...s.patientState[patientId],
          copingPlans: [
            ...s.patientState[patientId].copingPlans,
            { id: `cp-${Date.now()}`, name, trigger, response, usageCount: 0, active: true },
          ],
        },
      },
    })),
  deactivateCopingPlan: (patientId, planId) =>
    set((s) => ({
      patientState: {
        ...s.patientState,
        [patientId]: {
          ...s.patientState[patientId],
          copingPlans: s.patientState[patientId].copingPlans.map((p) =>
            p.id === planId ? { ...p, active: false } : p
          ),
        },
      },
    })),

  availability: {
    sessionDuration: 50,
    bufferMinutes: 15,
    sessionType: 'Video',
    workingDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
    startTime: '09:00',
    endTime: '17:00',
    minNoticeHours: 24,
    bookAheadWeeks: 6,
  },
  updateAvailability: (updates) =>
    set((s) => ({ availability: { ...s.availability, ...updates } })),

  notifications: {
    crisisFlags: true,
    episodeSignals: true,
    urgentPatterns: true,
    weeklyDigest: true,
    weekCompletions: false,
    sessionReminders: true,
    preBriefReady: true,
    quietEnabled: true,
    quietStart: '20:00',
    quietEnd: '08:00',
  },
  updateNotification: (key, value) =>
    set((s) => ({ notifications: { ...s.notifications, [key]: value } })),

  engagementDefaults: {
    companionEnabled: true,
    giftsEnabled: true,
    streakEnabled: false,
    growthPhraseEnabled: true,
  },
  updateEngagementDefault: (key, value) =>
    set((s) => ({ engagementDefaults: { ...s.engagementDefaults, [key]: value } })),

  security: {
    biometricEnabled: true,
    autoLockMinutes: 5,
  },
  updateSecurity: (updates) => set((s) => ({ security: { ...s.security, ...updates } })),

  account: {
    fullName: 'Dr. Sarah Chen',
    title: 'Clinical Psychologist',
    specialisation: 'Anxiety, OCD, Trauma (EMDR)',
    bio: 'I work with adults experiencing anxiety, OCD, and trauma using evidence-based approaches including CBT, ACT, and EMDR. I believe in a collaborative, non-judgmental therapeutic relationship.',
  },
  updateAccount: (updates) => set((s) => ({ account: { ...s.account, ...updates } })),
}))
