const WILLOW_KEYS = [
  'willow-user',
  'willow-checkin',
  'willow-conversation',
  'willow-profile',
  'willow-streak',
  'willow-reminders',
];

function daysAgo(n: number): number {
  return Date.now() - n * 86400000;
}

function dateStrFrom(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function populateSampleData(): void {
  // User
  localStorage.setItem('willow-user', JSON.stringify({
    state: { name: 'Alex', hasOnboarded: true },
    version: 0,
  }));

  // Check-in history — 25 entries over 28 days
  const moods =    [4, 3, 2, 4, 5, 3, 2, 4, 3, 3, 2, 4, 4, 3, 5, 4, 2, 3, 4, 4, 3, 2, 4, 3, 5];
  const sleeps =   [4, 3, 2, 4, 4, 3, 2, 3, 3, 4, 2, 4, 3, 3, 5, 4, 2, 3, 4, 3, 3, 2, 4, 4, 5];
  const notes = [
    'Had a productive morning. Felt a bit anxious before the meeting but it went okay.',
    'Tired. Work was stressful. Took a walk which helped.',
    "Couldn't stop overthinking at night. Didn't sleep well.",
    'Session with my therapist was really helpful. Felt lighter after.',
    'Best day in a while. Spent time outside with friends.',
    'Nothing special. Just got through the day.',
    'Felt disconnected. Hard to explain.',
    'Good morning run. Headspace feels clearer.',
    'Anxious about a deadline. Managed to get it done.',
    '',
    'Low energy. Stayed in all day.',
    'Talked to a friend — that helped a lot.',
    'Decent day. A bit of rumination in the evening.',
    '',
    'Felt really present today. Noticed the small things.',
    'Work pressure again. Breathing exercises helped.',
    'Hard morning. Better by afternoon.',
    '',
    'Journalled for 20 mins before bed. Calmer.',
    'Good session. Noticed the catastrophising pattern.',
    '',
    'Really tired. Not much to report.',
    'Feeling more like myself again.',
    '',
    'Strong end to the week. Grateful.',
  ];
  const steps =    [6200, 3100, 1800, 7400, 9100, 5400, 2100, 8200, 6000, 4300, 1500, 7100, 5200, 3800, 8400, 6700, 2400, 5100, 7200, 6400, 4100, 1900, 7800, 5600, 9200];
  const timesOfDay = ['morning', 'evening', 'night', 'morning', 'afternoon', 'evening', 'night', 'morning', 'morning', 'evening', 'night', 'morning', 'afternoon', 'evening', 'morning', 'morning', 'night', 'evening', 'morning', 'afternoon', 'evening', 'night', 'morning', 'evening', 'morning'];

  const skipDays = new Set([3, 7, 11, 18]);
  const history = [];
  let dayIndex = 0;
  for (let i = 0; i < 28 && dayIndex < moods.length; i++) {
    if (skipDays.has(i)) continue;
    const ts = daysAgo(i);
    const d = new Date(ts);
    history.push({
      mood: moods[dayIndex],
      sleep: sleeps[dayIndex],
      notes: notes[dayIndex],
      timestamp: ts,
      timeOfDay: timesOfDay[dayIndex],
      dayOfWeek: d.getDay(),
      steps: steps[dayIndex],
    });
    dayIndex++;
  }

  localStorage.setItem('willow-checkin', JSON.stringify({
    state: { mood: null, sleep: null, thoughts: '', steps: null, history },
    version: 0,
  }));

  // Streak
  const today = dateStrFrom(Date.now());
  const yesterday = dateStrFrom(daysAgo(1));
  localStorage.setItem('willow-streak', JSON.stringify({
    state: {
      health: 72,
      streak: 5,
      longestStreak: 12,
      lastActiveDate: yesterday,
      lastCheckInDate: today,
      lastConversationDate: yesterday,
    },
    version: 0,
  }));

  // Profile — session insights and pattern counts
  const sessionInsights = [
    {
      id: 'seed-1',
      timestamp: daysAgo(1),
      summary: 'Alex explored ongoing work-related anxiety, particularly around performance expectations. Noticed a pattern of catastrophising when deadlines approach. Identified that physical movement significantly improves their mood.',
      patterns: ['anxiety', 'catastrophising'],
    },
    {
      id: 'seed-2',
      timestamp: daysAgo(4),
      summary: 'Discussed a difficult interaction with a colleague that triggered self-critical thoughts. Alex was able to identify the mind-reading pattern and challenge it with evidence.',
      patterns: ['rumination', 'self-criticism'],
    },
    {
      id: 'seed-3',
      timestamp: daysAgo(8),
      summary: 'Reflected on a period of low mood following reduced social contact. Explored the connection between isolation and mood dip. Alex committed to scheduling one social activity this week.',
      patterns: ['low mood', 'withdrawal'],
    },
    {
      id: 'seed-4',
      timestamp: daysAgo(12),
      summary: 'Expressed frustration about slow progress in therapy. Reframed this as part of the process rather than a failure. Explored self-compassion techniques briefly.',
      patterns: ['self-criticism', 'rumination'],
    },
    {
      id: 'seed-5',
      timestamp: daysAgo(17),
      summary: 'Good session — Alex reported feeling more grounded this week. Discussed how the morning routine is helping. Some residual anxiety about an upcoming family event.',
      patterns: ['anxiety'],
    },
    {
      id: 'seed-6',
      timestamp: daysAgo(22),
      summary: 'Explored recurring "what if" thought patterns that tend to spike in the evenings. Practised the thought record technique. Alex found it useful to write thoughts down.',
      patterns: ['anxiety', 'rumination'],
    },
  ];

  const patternCounts: Record<string, number> = {
    anxiety: 3,
    rumination: 3,
    'self-criticism': 2,
    catastrophising: 1,
    'low mood': 1,
    withdrawal: 1,
  };

  const recentNotes = history
    .filter((e) => e.notes)
    .slice(0, 5)
    .map((e) => ({ text: e.notes, timestamp: e.timestamp, mood: e.mood }));

  localStorage.setItem('willow-profile', JSON.stringify({
    state: {
      sessionInsights,
      patternCounts,
      sessionCount: sessionInsights.length,
      recentNotes,
      handoff: '',
      handoffUpdatedAt: null,
    },
    version: 0,
  }));

  // Reminders — mark first medication as taken today
  const existingReminders = localStorage.getItem('willow-reminders');
  if (existingReminders) {
    try {
      const parsed = JSON.parse(existingReminders);
      parsed.state.todaySteps = 4210;
      parsed.state.medications = parsed.state.medications.map((m: { id: string; takenDates: string[] }, i: number) => ({
        ...m,
        takenDates: i === 0 ? [today] : [],
      }));
      localStorage.setItem('willow-reminders', JSON.stringify(parsed));
    } catch {
      // leave reminders as-is
    }
  }

  // Clear conversation so fresh greeting fires
  localStorage.setItem('willow-conversation', JSON.stringify({
    state: { messages: [] },
    version: 0,
  }));

  window.location.reload();
}

export function wipeAllData(): void {
  WILLOW_KEYS.forEach((key) => localStorage.removeItem(key));
  window.location.reload();
}
