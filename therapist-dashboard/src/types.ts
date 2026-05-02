export type PatientStatus = 'crisis' | 'elevated' | 'low-engagement' | 'stable' | 'new'
export type PatientTab = 'brief' | 'insights' | 'activity' | 'engagement' | 'coping-plans' | 'clinical' | 'data' | 'export' | 'connection'
export type Section = 'overview' | 'patients' | 'coping-plans' | 'availability' | 'notifications' | 'data-privacy' | 'security' | 'account'
export type SessionType = 'Video' | 'Phone' | 'In-person'
export type ExportFormat = 'PDF' | 'CSV'
export type MoodTrend = 'up' | 'down' | 'stable'

export interface Patient {
  id: string
  name: string
  initials: string
  status: PatientStatus
  therapyType: string
  startDate: string
  statusNote: string
  checkInsThisWeek: number
  moodTrend: MoodTrend
  hasEpisodeSignal: boolean
  episodeDescription?: string
  connectedSince: string
  consentDate: string
  lastConsentUpdate: string
  consentVersion: string
  sharesConversations: boolean
  sharesMood: boolean
  sharesSteps: boolean
}

export interface TodaySession {
  id: string
  patientId: string
  patientName: string
  time: string
  type: SessionType
}

export interface CopingPlan {
  id: string
  name: string
  trigger: string
  response: string
  usageCount: number
  active: boolean
}

export interface Template {
  id: string
  name: string
  trigger: string
  response: string
  status: 'Active' | 'Draft'
  appliedToCount: number
}

export type InsightType = 'emotion' | 'trigger' | 'pattern' | 'theme'
export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface InsightProvenance {
  models: string[]
  roundsNeeded: number
  synthesisUsed: boolean
}

export interface PipelineInsight {
  id: string
  type: InsightType
  label: string
  observation: string
  confidence: number
  evidence: string[]
  provenance: InsightProvenance
}

export interface SessionInsight {
  sessionId: string
  date: string
  dateLabel: string
  insights: PipelineInsight[]
}

export interface PersonalContextData {
  conversationCount: number
  recurringEmotions: { label: string; count: number; total: number }[]
  knownTriggers: { context: string; response: string }[]
  behaviouralCycles: string[]
  protectiveFactors: string[]
}

export interface DayActivity {
  date: string
  mood: MoodLevel | null
  sleep: number | null
  steps: number | null
  medicationTaken: boolean | null
  notes?: string
}

export interface PatientActivity {
  days: DayActivity[]
  stepGoal: number
  medications: { name: string; dosage: string; timing: string }[]
}

export interface PatientDetailState {
  companionEnabled: boolean
  giftsEnabled: boolean
  streakEnabled: boolean
  growthPhraseEnabled: boolean
  rewardMessage: string
  highRisk: boolean
  monitorEpisodes: boolean
  clinicalNotes: string
  copingPlans: CopingPlan[]
  exportDateFrom: string
  exportDateTo: string
  exportQuickRange: string
  exportFormat: ExportFormat
  exportIncludes: {
    mood: boolean
    conversations: boolean
    medication: boolean
    activity: boolean
    episodeSignals: boolean
    copingUsage: boolean
  }
}
