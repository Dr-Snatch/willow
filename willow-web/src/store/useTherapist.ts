import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PatientStatus = 'crisis' | 'elevated' | 'stable' | 'low-engagement' | 'new';

export interface CopingPlan {
  id: string;
  name: string;
  trigger: string;
  aiResponse: string;
  usageCount: number;
  active: boolean;
}

export interface CopingTemplate {
  id: string;
  name: string;
  trigger: string;
  aiResponse: string;
  appliedToCount: number;
  status: 'active' | 'draft';
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  treatment: string;
  connectedSince: string;
  status: PatientStatus;
  statusNote: string;
  episodeSignal: string | null;
  engagement: {
    willowCompanion: boolean;
    weeklyGifts: boolean;
    streakDisplay: boolean;
    growthPhrase: boolean;
    rewardMessage: string;
  };
  copingPlans: CopingPlan[];
  clinical: {
    highRisk: boolean;
    monitorEpisodes: boolean;
    privateNotes: string;
    aiSignal: string | null;
  };
  sharing: {
    aiConversations: boolean;
    moodData: boolean;
    activityData: boolean;
    medicationAdherence: boolean;
  };
  consentVersion: string;
  consentDate: string;
  consentUpdated: string;
}

interface TherapistState {
  profile: {
    name: string;
    title: string;
    specialisation: string;
    bio: string;
    registration: string;
    practiceEmail: string;
  };
  patients: Patient[];
  engagementDefaults: {
    willowCompanion: boolean;
    weeklyGifts: boolean;
    streakDisplay: boolean;
    growthPhrase: boolean;
  };
  templates: CopingTemplate[];
  availability: {
    sessionDuration: number;
    bufferMinutes: number;
    sessionTypes: { video: boolean; phone: boolean; inPerson: boolean };
    workingDays: boolean[];
    startHour: number;
    endHour: number;
  };
  notifications: {
    crisisFlags: boolean;
    moodEpisodes: boolean;
    urgentPatterns: boolean;
    weeklySummary: boolean;
    weekCompletions: boolean;
    sessionReminders: boolean;
    preBriefReady: boolean;
    doNotDisturb: boolean;
    quietStartHour: number;
    quietEndHour: number;
  };
  security: {
    biometric: boolean;
    autoLockMinutes: number;
  };

  updateProfile: (updates: Partial<TherapistState['profile']>) => void;
  updatePatientEngagement: (id: string, updates: Partial<Patient['engagement']>) => void;
  updatePatientClinical: (id: string, updates: Partial<Patient['clinical']>) => void;
  addCopingPlan: (patientId: string, plan: Omit<CopingPlan, 'id'>) => void;
  deactivateCopingPlan: (patientId: string, planId: string) => void;
  updateEngagementDefaults: (updates: Partial<TherapistState['engagementDefaults']>) => void;
  addTemplate: (template: Omit<CopingTemplate, 'id'>) => void;
  updateAvailability: (updates: Partial<TherapistState['availability']>) => void;
  updateNotifications: (updates: Partial<TherapistState['notifications']>) => void;
  updateSecurity: (updates: Partial<TherapistState['security']>) => void;
}

const SAMPLE_PATIENTS: Patient[] = [
  {
    id: 'p1', name: 'Sarah Garcia', initials: 'SG', treatment: 'CBT · Anxiety', connectedSince: '14 Jan 2026',
    status: 'crisis', statusNote: 'Crisis flag active', episodeSignal: null,
    engagement: { willowCompanion: false, weeklyGifts: false, streakDisplay: false, growthPhrase: false, rewardMessage: '' },
    copingPlans: [], clinical: { highRisk: true, monitorEpisodes: true, privateNotes: '', aiSignal: null },
    sharing: { aiConversations: true, moodData: true, activityData: false, medicationAdherence: true },
    consentVersion: 'v1.2', consentDate: '14 Jan 2026', consentUpdated: '14 Jan 2026',
  },
  {
    id: 'p2', name: 'Sarah Mitchell', initials: 'SM', treatment: 'CBT · Anxiety', connectedSince: '12 Mar 2025',
    status: 'elevated', statusNote: 'Elevated mood signal', episodeSignal: 'Possible elevated episode — 6 consecutive days avg mood ≥8.5. Grandiose language detected in AI chat. High engagement (14+ sessions/day). Review for hypomania/mania or BPD emotional dysregulation.',
    engagement: { willowCompanion: true, weeklyGifts: true, streakDisplay: false, growthPhrase: true, rewardMessage: '' },
    copingPlans: [
      { id: 'cp1', name: 'Mind-reading reframe', trigger: '"They must be angry / ignoring me"', aiResponse: '"What else could explain this behaviour?"', usageCount: 3, active: true },
      { id: 'cp2', name: 'Anxiety spiral pause', trigger: 'Escalating "what if" statements', aiResponse: '"What\'s one thing that\'s definitely okay right now?"', usageCount: 0, active: true },
    ],
    clinical: { highRisk: false, monitorEpisodes: true, privateNotes: 'Dx: GAD. Current mood cycling pattern — possible BPD/bipolar differential. Discuss at supervision.', aiSignal: 'Possible elevated episode — 6 consecutive days avg mood ≥8.5. Grandiose language detected in AI chat. High engagement (14+ sessions/day). Review for hypomania/mania or BPD emotional dysregulation.' },
    sharing: { aiConversations: true, moodData: true, activityData: true, medicationAdherence: true },
    consentVersion: 'v1.2', consentDate: '12 Mar 2025', consentUpdated: '1 Apr 2025',
  },
  {
    id: 'p3', name: 'James Li', initials: 'JL', treatment: 'DBT · Depression', connectedSince: '5 Nov 2025',
    status: 'stable', statusNote: '7/7 this week · stable', episodeSignal: null,
    engagement: { willowCompanion: true, weeklyGifts: true, streakDisplay: true, growthPhrase: true, rewardMessage: 'Great week, James — really proud of your consistency.' },
    copingPlans: [
      { id: 'cp3', name: 'Catastrophising pause', trigger: 'Worst-case spiral thoughts', aiResponse: '"What\'s the most likely outcome here?"', usageCount: 5, active: true },
    ],
    clinical: { highRisk: false, monitorEpisodes: false, privateNotes: '', aiSignal: null },
    sharing: { aiConversations: true, moodData: true, activityData: true, medicationAdherence: true },
    consentVersion: 'v1.2', consentDate: '5 Nov 2025', consentUpdated: '5 Nov 2025',
  },
  {
    id: 'p4', name: 'Riya Patel', initials: 'RP', treatment: 'ACT · Anxiety', connectedSince: '2 Feb 2026',
    status: 'low-engagement', statusNote: 'Low engagement · 2/7', episodeSignal: null,
    engagement: { willowCompanion: true, weeklyGifts: false, streakDisplay: false, growthPhrase: true, rewardMessage: '' },
    copingPlans: [],
    clinical: { highRisk: false, monitorEpisodes: false, privateNotes: 'Low check-in rate. Consider discussing barriers at next session.', aiSignal: null },
    sharing: { aiConversations: true, moodData: true, activityData: false, medicationAdherence: true },
    consentVersion: 'v1.2', consentDate: '2 Feb 2026', consentUpdated: '2 Feb 2026',
  },
  {
    id: 'p5', name: 'Tom Chen', initials: 'TC', treatment: 'CBT · OCD', connectedSince: '18 Jan 2026',
    status: 'stable', statusNote: 'Active · 4/7', episodeSignal: null,
    engagement: { willowCompanion: true, weeklyGifts: false, streakDisplay: false, growthPhrase: false, rewardMessage: '' },
    copingPlans: [
      { id: 'cp4', name: 'OCD thought detachment', trigger: 'Intrusive thought loops', aiResponse: '"Notice the thought without engaging — it will pass."', usageCount: 8, active: true },
    ],
    clinical: { highRisk: false, monitorEpisodes: false, privateNotes: 'Streak off due to perfectionism risk (OCD history). Review at 3-month mark.', aiSignal: null },
    sharing: { aiConversations: true, moodData: true, activityData: false, medicationAdherence: true },
    consentVersion: 'v1.2', consentDate: '18 Jan 2026', consentUpdated: '18 Jan 2026',
  },
  {
    id: 'p6', name: 'Amara Williams', initials: 'AW', treatment: 'CBT · Depression', connectedSince: '28 Apr 2026',
    status: 'new', statusNote: 'New patient · session Thu', episodeSignal: null,
    engagement: { willowCompanion: false, weeklyGifts: false, streakDisplay: false, growthPhrase: false, rewardMessage: '' },
    copingPlans: [],
    clinical: { highRisk: false, monitorEpisodes: false, privateNotes: '', aiSignal: null },
    sharing: { aiConversations: false, moodData: false, activityData: false, medicationAdherence: true },
    consentVersion: 'v1.0', consentDate: '28 Apr 2026', consentUpdated: '28 Apr 2026',
  },
];

const SAMPLE_TEMPLATES: CopingTemplate[] = [
  { id: 't1', name: 'Mind-reading reframe', trigger: '"They must be angry / don\'t like me / ignoring me"', aiResponse: '"What else could explain this behaviour? Is there evidence for your first thought?"', appliedToCount: 4, status: 'active' },
  { id: 't2', name: 'Catastrophising pause', trigger: 'Worst-case scenario spiral', aiResponse: '"What\'s the most realistic outcome? What would you tell a friend in this situation?"', appliedToCount: 2, status: 'active' },
  { id: 't3', name: 'Social anxiety grounding', trigger: 'Pre-social situation anxiety spike', aiResponse: '"What\'s one small thing you can do to feel more grounded right now?"', appliedToCount: 0, status: 'draft' },
  { id: 't4', name: 'Sleep anxiety wind-down', trigger: 'Racing thoughts at bedtime', aiResponse: '"Let\'s try a brief breathing exercise before you settle."', appliedToCount: 1, status: 'active' },
];

export const useTherapistStore = create<TherapistState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Dr. Layla Hassan',
        title: 'Clinical Psychologist',
        specialisation: 'CBT · Anxiety · Depression · OCD',
        bio: 'I work with adults on anxiety, depression, and OCD using evidence-based CBT approaches.',
        registration: 'HCPC · PYL12345',
        practiceEmail: 'layla@practice.co.uk',
      },
      patients: SAMPLE_PATIENTS,
      engagementDefaults: {
        willowCompanion: false,
        weeklyGifts: false,
        streakDisplay: false,
        growthPhrase: false,
      },
      templates: SAMPLE_TEMPLATES,
      availability: {
        sessionDuration: 50,
        bufferMinutes: 15,
        sessionTypes: { video: true, phone: false, inPerson: false },
        workingDays: [true, true, true, true, true, false, false],
        startHour: 9,
        endHour: 18,
      },
      notifications: {
        crisisFlags: true,
        moodEpisodes: true,
        urgentPatterns: true,
        weeklySummary: true,
        weekCompletions: false,
        sessionReminders: true,
        preBriefReady: true,
        doNotDisturb: true,
        quietStartHour: 20,
        quietEndHour: 8,
      },
      security: {
        biometric: true,
        autoLockMinutes: 5,
      },

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      updatePatientEngagement: (id, updates) =>
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === id ? { ...p, engagement: { ...p.engagement, ...updates } } : p
          ),
        })),

      updatePatientClinical: (id, updates) =>
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === id ? { ...p, clinical: { ...p.clinical, ...updates } } : p
          ),
        })),

      addCopingPlan: (patientId, plan) =>
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === patientId
              ? { ...p, copingPlans: [...p.copingPlans, { ...plan, id: `cp-${Date.now()}` }] }
              : p
          ),
        })),

      deactivateCopingPlan: (patientId, planId) =>
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === patientId
              ? { ...p, copingPlans: p.copingPlans.map((c) => c.id === planId ? { ...c, active: false } : c) }
              : p
          ),
        })),

      updateEngagementDefaults: (updates) =>
        set((s) => ({ engagementDefaults: { ...s.engagementDefaults, ...updates } })),

      addTemplate: (template) =>
        set((s) => ({ templates: [...s.templates, { ...template, id: `t-${Date.now()}` }] })),

      updateAvailability: (updates) =>
        set((s) => ({ availability: { ...s.availability, ...updates } })),

      updateNotifications: (updates) =>
        set((s) => ({ notifications: { ...s.notifications, ...updates } })),

      updateSecurity: (updates) =>
        set((s) => ({ security: { ...s.security, ...updates } })),
    }),
    { name: 'willow-therapist' }
  )
);
