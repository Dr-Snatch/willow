import { useState, useId, useEffect } from 'react';
import { useCheckInStore } from '../store/useCheckIn';
import { useConversationStore } from '../store/useConversation';
import { useUserStore } from '../store/useUser';
import { useRemindersStore } from '../store/useReminders';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Check, Smartphone } from 'lucide-react';

const MOODS = [
  { value: 1, label: 'Awful', color: '#DC4444' },
  { value: 2, label: 'Low',   color: '#E8721A' },
  { value: 3, label: 'Okay',  color: '#CA9B0E' },
  { value: 4, label: 'Good',  color: '#2E9E56' },
  { value: 5, label: 'Great', color: '#1F7A40' },
];

const SLEEP = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
];

const NOTES_MAX = 500;

function getGreeting(name?: string): string {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${time},\n${name}.` : `${time}.`;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

const WeekHistory = ({ history }: { history: { mood: number; timestamp: number }[] }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7: ({ mood: number; timestamp: number } | null)[] = Array(7).fill(null);
  const now = Date.now();

  history.slice(0, 7).forEach((entry) => {
    const daysAgo = Math.floor((now - entry.timestamp) / 86400000);
    if (daysAgo < 7) last7[6 - daysAgo] = entry;
  });

  const moodColor = (value: number) => MOODS.find((m) => m.value === value)?.color;
  const moodLabel = (value: number) => MOODS.find((m) => m.value === value)?.label ?? String(value);

  return (
    <div className="flex justify-between gap-1" role="list" aria-label="Mood history for the past 7 days">
      {last7.map((entry, i) => {
        const dayLabel = days[(new Date().getDay() - (6 - i) + 7) % 7];
        const isToday  = i === 6;
        const color    = entry ? moodColor(entry.mood) : undefined;
        const dayName  = isToday ? 'Today' : dayLabel;
        const cellLabel = entry
          ? `${dayName}: ${moodLabel(entry.mood)}`
          : `${dayName}: no check-in`;

        return (
          <div key={i} className="flex flex-col items-center gap-2" role="listitem" aria-label={cellLabel}>
            <div
              className={`h-10 w-10 rounded-xl border transition-all duration-300 ${
                isToday ? 'ring-1 ring-brand/25' : ''
              }`}
              style={{
                backgroundColor: color ? `${color}22` : '#E2DBD1',
                borderColor: color ? `${color}40` : '#E2DBD1',
              }}
              aria-hidden="true"
            >
              {entry && color && (
                <div className="h-full w-full rounded-xl" style={{ backgroundColor: `${color}30` }}>
                  <div className="mx-auto mt-[10px] h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                </div>
              )}
            </div>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider ${
                isToday ? 'text-brand' : 'text-text-muted'
              }`}
              aria-hidden="true"
            >
              {dayName}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CheckInView = () => {
  const { mood, sleep, thoughts, steps, setMood, setSleep, setThoughts, setSteps, submitCheckIn, history } =
    useCheckInStore();
  const { clearMessages, setPendingCheckIn } = useConversationStore();
  const { name } = useUserStore();
  const { medications, todaySteps, toggleMedicationTaken, setTodaySteps } = useRemindersStore();
  const navigate  = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const moodGroupId  = useId();
  const sleepGroupId = useId();
  const notesId      = useId();
  const counterId    = useId();
  const stepsId      = useId();

  // Pre-populate steps from reminders store on first render
  useEffect(() => {
    if (steps === null) setSteps(todaySteps);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date().toISOString().slice(0, 10);
  const canSubmit    = mood !== null && sleep !== null;
  const selectedMood = MOODS.find((m) => m.value === mood);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (steps !== null) setTodaySteps(steps);
    const entry = submitCheckIn();
    if (!entry) return;
    clearMessages();
    setPendingCheckIn(entry);
    setSubmitted(true);
    setTimeout(() => navigate('/chat'), 1800);
  };

  if (submitted) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background gap-4 page-enter">
        <div className="check-in-success flex flex-col items-center gap-3 text-center" role="status" aria-live="assertive">
          <div
            className="h-12 w-12 rounded-2xl border-2 mx-auto"
            style={{
              backgroundColor: selectedMood ? `${selectedMood.color}18` : undefined,
              borderColor: selectedMood ? `${selectedMood.color}40` : undefined,
            }}
            aria-hidden="true"
          />
          <CheckCircle2 className="h-10 w-10 text-brand" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold tracking-tight text-text">
              Logged {selectedMood?.label}.
            </p>
            <p className="text-sm text-text-secondary mt-1">Heading to chat…</p>
          </div>
        </div>
      </div>
    );
  }

  const greetingLines = getGreeting(name || undefined).split('\n');

  return (
    <div className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-9">

        {/* Header */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted mb-3" aria-hidden="true">
            <time dateTime={new Date().toISOString().split('T')[0]}>{formatDate()}</time>
          </p>
          <h1
            className="font-display font-light italic leading-[1.06] tracking-tighter text-text"
            style={{ fontSize: 'clamp(2rem, 3.2vw, 2.8rem)' }}
          >
            {greetingLines.map((line, i) => (
              <span key={i}>
                {line}{i < greetingLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>

        {/* This week */}
        {history.length > 0 && (
          <section aria-label="This week's check-ins" className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
              This week
            </p>
            <WeekHistory history={history} />
          </section>
        )}

        {/* Check-in form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          noValidate
          className="flex flex-col gap-9"
        >
          {/* Mood */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <p id={moodGroupId} className="text-sm font-medium text-text">How are you feeling?</p>
              {selectedMood && (
                <span className="text-sm font-medium transition-colors duration-300" style={{ color: selectedMood.color }}>
                  {selectedMood.label}
                </span>
              )}
            </div>
            <div
              role="group"
              aria-labelledby={moodGroupId}
              className="flex overflow-hidden rounded-2xl border border-border bg-surface"
            >
              {MOODS.map(({ value, label, color }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setMood(value)}
                  aria-pressed={mood === value}
                  aria-label={label}
                  className="flex flex-1 flex-col items-center py-4 gap-2.5 transition-all duration-300"
                  style={mood === value ? { backgroundColor: `${color}12` } : {}}
                >
                  <div
                    className="h-5 w-5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: color,
                      opacity: mood === value ? 1 : 0.28,
                      transform: mood === value ? 'scale(1.2)' : 'scale(1)',
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-[10px] font-medium tracking-tight transition-colors duration-300"
                    style={{ color: mood === value ? color : '#A8A29E' }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="flex flex-col gap-3">
            <p id={sleepGroupId} className="text-sm font-medium text-text">How did you sleep?</p>
            <div
              role="group"
              aria-labelledby={sleepGroupId}
              className="flex justify-between gap-2"
            >
              {SLEEP.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setSleep(value)}
                  aria-pressed={sleep === value}
                  aria-label={label}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3.5 transition-all duration-300 ease-expo ${
                    sleep === value
                      ? 'border-brand/30 bg-brand-muted'
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div
                    className="h-1.5 w-6 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: sleep === value ? '#2E7D5A' : '#E2DBD1',
                      opacity: sleep !== null && sleep < value ? 0.4 : 1,
                    }}
                    aria-hidden="true"
                  />
                  <span className={`text-[11px] font-medium tracking-tight ${sleep === value ? 'text-brand' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <label htmlFor={notesId} className="text-sm font-medium text-text">
                What's on your mind?{' '}
                <span className="font-normal text-text-muted">optional</span>
              </label>
              <span
                id={counterId}
                aria-live="polite"
                aria-atomic="true"
                className={`text-xs ${thoughts.length > NOTES_MAX - 50 ? 'text-amber-500' : 'text-text-muted'}`}
              >
                {thoughts.length}/{NOTES_MAX}
              </span>
            </div>
            <textarea
              id={notesId}
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value.slice(0, NOTES_MAX))}
              placeholder="A sentence or two is enough…"
              rows={4}
              aria-describedby={counterId}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted transition-all duration-300 focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <label htmlFor={stepsId} className="text-sm font-medium text-text">
                Steps today{' '}
                <span className="font-normal text-text-muted">optional</span>
              </label>
              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                <Smartphone className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                syncs from phone
              </span>
            </div>
            <input
              id={stepsId}
              type="number"
              min={0}
              max={99999}
              value={steps ?? ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setSteps(isNaN(v) ? null : Math.max(0, Math.min(99999, v)));
              }}
              placeholder="e.g. 4 200"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted transition-all duration-300 focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Medication */}
          {medications.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-text">Medications today</p>
              <div className="flex flex-col gap-2" role="group" aria-label="Medication taken today">
                {medications.map((med) => {
                  const taken = med.takenDates.includes(today);
                  return (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => toggleMedicationTaken(med.id)}
                      aria-pressed={taken}
                      aria-label={`${med.name} ${med.dose} — ${taken ? 'taken' : 'not taken'}`}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                        taken
                          ? 'border-brand/30 bg-brand-muted'
                          : 'border-border bg-surface hover:border-border-strong'
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        taken ? 'border-brand bg-brand text-white' : 'border-border'
                      }`}>
                        {taken && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${taken ? 'text-brand' : 'text-text'}`}>
                          {med.name}
                        </span>
                        <span className="ml-2 text-xs text-text-secondary">{med.dose} · {med.timeLabel}</span>
                      </div>
                      {taken && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-brand">
                          Taken
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="btn-dark mb-4 w-full rounded-xl border border-text/20 bg-text py-3.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Log check-in
          </button>
        </form>

      </div>
    </div>
  );
};

export default CheckInView;
