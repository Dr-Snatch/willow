import type { Patient, TodaySession, Template, CopingPlan, SessionInsight, PatientActivity, PersonalContextData } from '../types'

export const THERAPIST = {
  name: 'Dr. Sarah Chen',
  title: 'Clinical Psychologist',
  patientCount: 12,
  email: 'sarah.chen@willow.health',
  registrationNumber: 'HCPC PYL12847',
  practiceEmail: 'admin@sarahchen-psychology.co.uk',
  memberSince: '12 Mar 2024',
  plan: 'Professional',
  patientLimit: 25,
  renewalDate: '12 Mar 2027',
}

export const PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Marcus Webb',
    initials: 'MW',
    status: 'crisis',
    therapyType: 'CBT',
    startDate: '14 Jan 2025',
    statusNote: 'Flagged: self-harm ideation in last check-in',
    checkInsThisWeek: 3,
    moodTrend: 'down',
    hasEpisodeSignal: true,
    episodeDescription: 'AI detected language consistent with self-harm ideation across 2 check-ins in the past 72 hours. Samaritans soft-flag sent.',
    connectedSince: '14 Jan 2025',
    consentDate: '14 Jan 2025',
    lastConsentUpdate: '14 Jan 2025',
    consentVersion: 'v1.2',
    sharesConversations: true,
    sharesMood: true,
    sharesSteps: false,
  },
  {
    id: 'p2',
    name: 'Priya Okafor',
    initials: 'PO',
    status: 'elevated',
    therapyType: 'ACT',
    startDate: '3 Oct 2024',
    statusNote: 'AI signal: mood episode detected, 3-day low',
    checkInsThisWeek: 5,
    moodTrend: 'down',
    hasEpisodeSignal: true,
    episodeDescription: 'Mood scores have averaged 1.8/5 over the past 3 days. Elevated language around hopelessness detected in 2 conversations. No crisis-level content.',
    connectedSince: '3 Oct 2024',
    consentDate: '3 Oct 2024',
    lastConsentUpdate: '18 Feb 2025',
    consentVersion: 'v1.2',
    sharesConversations: true,
    sharesMood: true,
    sharesSteps: true,
  },
  {
    id: 'p3',
    name: 'James Thornton',
    initials: 'JT',
    status: 'low-engagement',
    therapyType: 'CBT',
    startDate: '22 Aug 2024',
    statusNote: '1 check-in this week, missed last 2 sessions',
    checkInsThisWeek: 1,
    moodTrend: 'stable',
    hasEpisodeSignal: false,
    connectedSince: '22 Aug 2024',
    consentDate: '22 Aug 2024',
    lastConsentUpdate: '22 Aug 2024',
    consentVersion: 'v1.1',
    sharesConversations: false,
    sharesMood: true,
    sharesSteps: false,
  },
  {
    id: 'p4',
    name: 'Aisha Nkemelu',
    initials: 'AN',
    status: 'stable',
    therapyType: 'DBT',
    startDate: '5 Jun 2024',
    statusNote: 'Regular check-ins, positive mood trend',
    checkInsThisWeek: 6,
    moodTrend: 'up',
    hasEpisodeSignal: false,
    connectedSince: '5 Jun 2024',
    consentDate: '5 Jun 2024',
    lastConsentUpdate: '1 Apr 2025',
    consentVersion: 'v1.2',
    sharesConversations: true,
    sharesMood: true,
    sharesSteps: true,
  },
  {
    id: 'p5',
    name: 'Oliver Hayes',
    initials: 'OH',
    status: 'new',
    therapyType: 'Person-centred',
    startDate: '25 Apr 2025',
    statusNote: 'New patient — onboarded last week',
    checkInsThisWeek: 2,
    moodTrend: 'stable',
    hasEpisodeSignal: false,
    connectedSince: '25 Apr 2025',
    consentDate: '25 Apr 2025',
    lastConsentUpdate: '25 Apr 2025',
    consentVersion: 'v1.2',
    sharesConversations: true,
    sharesMood: true,
    sharesSteps: false,
  },
]

export const TODAY_SESSIONS: TodaySession[] = [
  { id: 's1', patientId: 'p2', patientName: 'Priya Okafor',  time: '10:00', type: 'Video' },
  { id: 's2', patientId: 'p1', patientName: 'Marcus Webb',   time: '14:30', type: 'In-person' },
]

export const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Mind-reading',
    trigger: 'I think they must think badly of me / I just know they\'re judging me',
    response: 'That sounds like a really uncomfortable feeling. It\'s natural to want to know what others think — can you notice that right now you\'re predicting rather than knowing? What would you need to feel more certain?',
    status: 'Active',
    appliedToCount: 3,
  },
  {
    id: 't2',
    name: 'Catastrophising',
    trigger: 'Everything is going to go wrong / This is going to be a disaster',
    response: 'I can hear how overwhelming this feels. When your mind goes to the worst outcome, it\'s often trying to protect you. What\'s the most likely outcome, rather than the worst case?',
    status: 'Active',
    appliedToCount: 4,
  },
  {
    id: 't3',
    name: 'Social anxiety',
    trigger: 'I\'m going to embarrass myself / I don\'t know what to say',
    response: 'Social situations can feel high-stakes. Notice that your body is preparing you — that energy isn\'t always a warning sign. What would you say to a friend who felt the same way?',
    status: 'Active',
    appliedToCount: 2,
  },
  {
    id: 't4',
    name: 'Sleep anxiety',
    trigger: 'I can\'t stop thinking / I\'ll never get to sleep',
    response: 'The pressure to sleep can make sleep harder. Rather than trying to sleep, can you just rest? Let your body be still without the expectation of sleep — and notice what happens.',
    status: 'Draft',
    appliedToCount: 0,
  },
]

export const DEFAULT_PATIENT_COPING_PLANS: Record<string, CopingPlan[]> = {
  p1: [
    {
      id: 'cp1-1',
      name: 'Catastrophising',
      trigger: 'Everything is going to go wrong / This is going to be a disaster',
      response: 'I can hear how overwhelming this feels. When your mind goes to the worst outcome, it\'s often trying to protect you. What\'s the most likely outcome, rather than the worst case?',
      usageCount: 7,
      active: true,
    },
  ],
  p2: [
    {
      id: 'cp2-1',
      name: 'Mind-reading',
      trigger: 'I think they must think badly of me / I just know they\'re judging me',
      response: 'That sounds like a really uncomfortable feeling. It\'s natural to want to know what others think — can you notice that right now you\'re predicting rather than knowing?',
      usageCount: 4,
      active: true,
    },
    {
      id: 'cp2-2',
      name: 'Sleep anxiety',
      trigger: 'I can\'t stop thinking / I\'ll never get to sleep',
      response: 'The pressure to sleep can make sleep harder. Rather than trying to sleep, can you just rest? Let your body be still without the expectation of sleep.',
      usageCount: 12,
      active: true,
    },
  ],
  p3: [],
  p4: [
    {
      id: 'cp4-1',
      name: 'Social anxiety',
      trigger: 'I\'m going to embarrass myself / I don\'t know what to say',
      response: 'Social situations can feel high-stakes. Notice that your body is preparing you — that energy isn\'t always a warning sign.',
      usageCount: 3,
      active: true,
    },
  ],
  p5: [],
}

// ── Session Insights ──────────────────────────────────────
export const PATIENT_SESSION_INSIGHTS: Record<string, SessionInsight[]> = {
  p1: [
    {
      sessionId: 's-p1-3',
      date: '2025-04-28',
      dateLabel: '28 Apr',
      insights: [
        {
          id: 'i1',
          type: 'emotion',
          label: 'Hopelessness connected to future',
          observation: 'Language consistent with hopelessness appears when the person describes future plans — possibilities are framed as closed or unavailable.',
          confidence: 0.91,
          evidence: ['"I just don\'t see the point of planning anything anymore"', '"Things aren\'t going to change"'],
          provenance: { models: ['gemini', 'grok', 'claude', 'gpt'], roundsNeeded: 1, synthesisUsed: true },
        },
        {
          id: 'i2',
          type: 'trigger',
          label: 'Isolation following conflict',
          observation: 'Social withdrawal appears to follow interpersonal conflict — the person describes retreating rather than engaging after friction.',
          confidence: 0.84,
          evidence: ['"After what happened I just couldn\'t face anyone"'],
          provenance: { models: ['gemini', 'grok', 'claude', 'gpt'], roundsNeeded: 1, synthesisUsed: true },
        },
        {
          id: 'i3',
          type: 'pattern',
          label: 'Self-blame as default response',
          observation: 'Responsibility for negative outcomes is consistently attributed to self even when external factors are described.',
          confidence: 0.78,
          evidence: ['"It\'s always my fault somehow"', '"I should have seen it coming"'],
          provenance: { models: ['gemini', 'grok', 'claude'], roundsNeeded: 2, synthesisUsed: true },
        },
      ],
    },
    {
      sessionId: 's-p1-2',
      date: '2025-04-14',
      dateLabel: '14 Apr',
      insights: [
        {
          id: 'i4',
          type: 'theme',
          label: 'Loss of identity through work',
          observation: 'A recurring theme of self-worth being contingent on occupational performance — difficulty articulating value outside of productivity.',
          confidence: 0.76,
          evidence: ['"If I\'m not working I don\'t know who I am"'],
          provenance: { models: ['gemini', 'claude', 'gpt'], roundsNeeded: 2, synthesisUsed: true },
        },
      ],
    },
  ],
  p2: [
    {
      sessionId: 's-p2-5',
      date: '2025-04-30',
      dateLabel: '30 Apr',
      insights: [
        {
          id: 'i5',
          type: 'emotion',
          label: 'Persistent low mood, diminished affect',
          observation: 'Emotional tone throughout the session is notably flat — the person describes experiences without affective colouring, suggesting reduced emotional range.',
          confidence: 0.88,
          evidence: ['"I don\'t really feel anything about it"', '"Everything just feels grey"'],
          provenance: { models: ['gemini', 'grok', 'claude', 'gpt'], roundsNeeded: 1, synthesisUsed: true },
        },
        {
          id: 'i6',
          type: 'trigger',
          label: 'Sleep disruption preceding low days',
          observation: 'Poor sleep is described as preceding, rather than following, periods of low mood — suggesting sleep quality as a primary trigger rather than a symptom.',
          confidence: 0.81,
          evidence: ['"When I can\'t sleep it just ruins the whole next day"'],
          provenance: { models: ['gemini', 'grok', 'claude', 'gpt'], roundsNeeded: 1, synthesisUsed: true },
        },
      ],
    },
    {
      sessionId: 's-p2-4',
      date: '2025-04-16',
      dateLabel: '16 Apr',
      insights: [
        {
          id: 'i7',
          type: 'pattern',
          label: 'Rumination following social comparison',
          observation: 'Ruminative thinking appears to be triggered by social comparison — the person revisits perceived inadequacies after observing others.',
          confidence: 0.73,
          evidence: ['"I just keep thinking about how much better everyone else is doing"'],
          provenance: { models: ['gemini', 'grok', 'claude'], roundsNeeded: 2, synthesisUsed: true },
        },
      ],
    },
  ],
  p3: [],
  p4: [
    {
      sessionId: 's-p4-8',
      date: '2025-04-25',
      dateLabel: '25 Apr',
      insights: [
        {
          id: 'i8',
          type: 'theme',
          label: 'Growing confidence in social contexts',
          observation: 'Social situations are described with notably less anticipatory anxiety than in prior sessions — the person uses approach-oriented rather than avoidance-oriented language.',
          confidence: 0.85,
          evidence: ['"I actually looked forward to it this time"', '"It wasn\'t as bad as I thought it would be"'],
          provenance: { models: ['gemini', 'grok', 'claude', 'gpt'], roundsNeeded: 1, synthesisUsed: true },
        },
      ],
    },
  ],
  p5: [],
}

// ── Personal Context ──────────────────────────────────────
export const PATIENT_PERSONAL_CONTEXT: Record<string, PersonalContextData> = {
  p1: {
    conversationCount: 14,
    recurringEmotions: [
      { label: 'Hopelessness', count: 9, total: 14 },
      { label: 'Shame', count: 7, total: 14 },
      { label: 'Anger (suppressed)', count: 5, total: 14 },
    ],
    knownTriggers: [
      { context: 'Interpersonal conflict', response: 'social withdrawal and self-blame' },
      { context: 'Work performance pressure', response: 'hopelessness and identity threat' },
    ],
    behaviouralCycles: [
      'Conflict → withdrawal → isolation → worsening mood → self-blame',
      'Performance pressure → catastrophising → avoidance → confirmation of fears',
    ],
    protectiveFactors: [
      'Creative work (music) as emotional outlet',
      'Close relationship with sibling',
    ],
  },
  p2: {
    conversationCount: 11,
    recurringEmotions: [
      { label: 'Low mood', count: 8, total: 11 },
      { label: 'Anxiety (anticipatory)', count: 6, total: 11 },
      { label: 'Exhaustion', count: 5, total: 11 },
    ],
    knownTriggers: [
      { context: 'Poor sleep', response: 'diminished affect and cognitive slowing' },
      { context: 'Social comparison (social media)', response: 'ruminative thinking and self-inadequacy' },
    ],
    behaviouralCycles: [
      'Poor sleep → reduced affect → social comparison → rumination → further sleep disruption',
    ],
    protectiveFactors: [
      'Exercise (when mood is sufficient)',
      'Connection with therapist described as stabilising',
      'Structured routine on good days',
    ],
  },
  p3: {
    conversationCount: 3,
    recurringEmotions: [
      { label: 'Avoidance', count: 2, total: 3 },
    ],
    knownTriggers: [],
    behaviouralCycles: [],
    protectiveFactors: [],
  },
  p4: {
    conversationCount: 22,
    recurringEmotions: [
      { label: 'Anxiety (social)', count: 8, total: 22 },
      { label: 'Pride (emerging)', count: 6, total: 22 },
    ],
    knownTriggers: [
      { context: 'New social situations', response: 'anticipatory anxiety, avoidance urge' },
    ],
    behaviouralCycles: [],
    protectiveFactors: [
      'DBT skills increasingly applied in context',
      'Supportive friendship group',
      'Regular physical activity',
    ],
  },
  p5: {
    conversationCount: 2,
    recurringEmotions: [],
    knownTriggers: [],
    behaviouralCycles: [],
    protectiveFactors: [],
  },
}

// ── Activity data (28 days) ────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const PATIENT_ACTIVITY: Record<string, PatientActivity> = {
  p1: {
    stepGoal: 5000,
    medications: [
      { name: 'Sertraline', dosage: '100mg', timing: 'Morning' },
    ],
    days: [
      { date: daysAgo(0),  mood: 1, sleep: 2, steps: 1200, medicationTaken: true },
      { date: daysAgo(1),  mood: 1, sleep: 2, steps: 800,  medicationTaken: true },
      { date: daysAgo(2),  mood: 2, sleep: 3, steps: 2100, medicationTaken: false },
      { date: daysAgo(3),  mood: 1, sleep: 1, steps: 600,  medicationTaken: true },
      { date: daysAgo(4),  mood: 2, sleep: 2, steps: 1800, medicationTaken: true },
      { date: daysAgo(5),  mood: 2, sleep: 3, steps: 3200, medicationTaken: true },
      { date: daysAgo(6),  mood: 1, sleep: 2, steps: 900,  medicationTaken: false },
      { date: daysAgo(7),  mood: 2, sleep: 2, steps: 1500, medicationTaken: true },
      { date: daysAgo(8),  mood: 3, sleep: 3, steps: 4200, medicationTaken: true },
      { date: daysAgo(9),  mood: 2, sleep: 2, steps: 2000, medicationTaken: true },
      { date: daysAgo(10), mood: 2, sleep: 3, steps: 2800, medicationTaken: true },
      { date: daysAgo(11), mood: 1, sleep: 1, steps: 500,  medicationTaken: false },
      { date: daysAgo(12), mood: 2, sleep: 2, steps: 1900, medicationTaken: true },
      { date: daysAgo(13), mood: 3, sleep: 3, steps: 3800, medicationTaken: true },
    ],
  },
  p2: {
    stepGoal: 6000,
    medications: [
      { name: 'Sertraline', dosage: '50mg', timing: 'Morning' },
      { name: 'Vitamin D', dosage: '1000IU', timing: 'Daily' },
    ],
    days: [
      { date: daysAgo(0),  mood: 1, sleep: 2, steps: 1800, medicationTaken: true },
      { date: daysAgo(1),  mood: 1, sleep: 1, steps: 1200, medicationTaken: true },
      { date: daysAgo(2),  mood: 2, sleep: 2, steps: 2400, medicationTaken: true },
      { date: daysAgo(3),  mood: 1, sleep: 2, steps: 900,  medicationTaken: false },
      { date: daysAgo(4),  mood: 2, sleep: 3, steps: 3100, medicationTaken: true },
      { date: daysAgo(5),  mood: 3, sleep: 3, steps: 5200, medicationTaken: true },
      { date: daysAgo(6),  mood: 3, sleep: 4, steps: 6800, medicationTaken: true },
      { date: daysAgo(7),  mood: 4, sleep: 4, steps: 7200, medicationTaken: true },
      { date: daysAgo(8),  mood: 3, sleep: 3, steps: 5800, medicationTaken: true },
      { date: daysAgo(9),  mood: 4, sleep: 4, steps: 6200, medicationTaken: true },
      { date: daysAgo(10), mood: 3, sleep: 3, steps: 4900, medicationTaken: true },
      { date: daysAgo(11), mood: 4, sleep: 4, steps: 7100, medicationTaken: true },
      { date: daysAgo(12), mood: 4, sleep: 4, steps: 6400, medicationTaken: true },
      { date: daysAgo(13), mood: 3, sleep: 3, steps: 5100, medicationTaken: true },
    ],
  },
  p3: {
    stepGoal: 8000,
    medications: [],
    days: [
      { date: daysAgo(0),  mood: 3, sleep: 3, steps: 4200, medicationTaken: null },
      { date: daysAgo(5),  mood: 3, sleep: 4, steps: 6800, medicationTaken: null },
      { date: daysAgo(10), mood: 4, sleep: 4, steps: 9200, medicationTaken: null },
    ],
  },
  p4: {
    stepGoal: 8000,
    medications: [],
    days: [
      { date: daysAgo(0),  mood: 4, sleep: 4, steps: 9200, medicationTaken: null },
      { date: daysAgo(1),  mood: 4, sleep: 4, steps: 8700, medicationTaken: null },
      { date: daysAgo(2),  mood: 5, sleep: 5, steps: 11200, medicationTaken: null },
      { date: daysAgo(3),  mood: 4, sleep: 4, steps: 8400, medicationTaken: null },
      { date: daysAgo(4),  mood: 4, sleep: 4, steps: 7900, medicationTaken: null },
      { date: daysAgo(5),  mood: 5, sleep: 5, steps: 12100, medicationTaken: null },
      { date: daysAgo(6),  mood: 4, sleep: 4, steps: 9800, medicationTaken: null },
      { date: daysAgo(7),  mood: 3, sleep: 3, steps: 6200, medicationTaken: null },
      { date: daysAgo(8),  mood: 4, sleep: 4, steps: 8900, medicationTaken: null },
      { date: daysAgo(9),  mood: 4, sleep: 4, steps: 9400, medicationTaken: null },
      { date: daysAgo(10), mood: 5, sleep: 5, steps: 11800, medicationTaken: null },
      { date: daysAgo(11), mood: 4, sleep: 4, steps: 8200, medicationTaken: null },
      { date: daysAgo(12), mood: 3, sleep: 4, steps: 7100, medicationTaken: null },
      { date: daysAgo(13), mood: 4, sleep: 4, steps: 8600, medicationTaken: null },
    ],
  },
  p5: {
    stepGoal: 7000,
    medications: [],
    days: [
      { date: daysAgo(0),  mood: 3, sleep: 3, steps: 5200, medicationTaken: null },
      { date: daysAgo(2),  mood: 4, sleep: 4, steps: 7800, medicationTaken: null },
      { date: daysAgo(5),  mood: 3, sleep: 3, steps: 4900, medicationTaken: null },
      { date: daysAgo(7),  mood: 3, sleep: 4, steps: 6100, medicationTaken: null },
    ],
  },
}
