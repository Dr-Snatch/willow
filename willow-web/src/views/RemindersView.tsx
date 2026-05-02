import { useId, useState } from 'react';
import { Check, Circle, Plus, Trash2, Smartphone } from 'lucide-react';
import { useRemindersStore } from '../store/useReminders';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Add Reminder form ────────────────────────────────────────────────────────

const AddReminderForm = ({ onAdd, onCancel }: { onAdd: (title: string, time: string, days: number[]) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('20:00');
  const [days, setDays] = useState<number[]>(ALL_DAYS);
  const titleId = useId();
  const timeId = useId();

  const toggleDay = (d: number) =>
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b));

  const submit = () => {
    const [h, m] = time.split(':').map(Number);
    const hr = h % 12 || 12;
    const ampm = h < 12 ? 'am' : 'pm';
    const label = `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
    onAdd(title.trim(), label, days);
  };

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand-muted px-5 py-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={titleId} className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Reminder name</label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morning stretch"
          autoFocus
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={timeId} className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Time</label>
        <input
          id={timeId}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Days</p>
        <div className="flex gap-1.5" role="group" aria-label="Select days">
          {DAY_LABELS.map((label, i) => {
            const d = i + 1;
            const on = days.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                aria-pressed={on}
                aria-label={label}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 ${
                  on ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted hover:bg-surface-2'
                }`}
              >
                {label.slice(0, 1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={days.length === 0}
          className="flex-1 btn-dark rounded-xl border border-text/20 bg-text py-2.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add reminder
        </button>
      </div>
    </div>
  );
};

// ── Main view ────────────────────────────────────────────────────────────────

const RemindersView = () => {
  const {
    medications, wellnessReminders, stepGoal, stepSharingEnabled, activityWeek, todaySteps,
    toggleMedicationTaken, toggleWellnessReminder, updateWellnessDays,
    addWellnessReminder, removeWellnessReminder, setStepGoal, setStepSharing,
  } = useRemindersStore();

  const [addingReminder, setAddingReminder] = useState(false);

  const today = todayKey();
  const maxSteps = Math.max(...activityWeek.map((d) => d.steps));
  const goalPct = Math.min(100, Math.round((todaySteps / stepGoal) * 100));

  const handleAdd = (title: string, time: string, days: number[]) => {
    addWellnessReminder(title, time, days);
    setAddingReminder(false);
  };

  return (
    <main className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Health & reminders
          </p>
          <h1
            className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
            style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}
          >
            Your routine.
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Medication, steps, and wellness reminders in one place.
          </p>
        </div>

        {/* Steps placeholder banner */}
        <div
          className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-4"
          role="note"
          aria-label="Steps sync notice"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted mt-0.5">
            <Smartphone className="h-4 w-4 text-brand" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-text">Step tracking syncs from your phone</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
              Step count and activity data shown here is a placeholder. In the app, this syncs automatically from your phone's health data. Location is never requested.
            </p>
          </div>
        </div>

        {/* Steps section */}
        <section aria-label="Daily steps">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Daily steps
          </p>

          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-5">
            {/* Today count + goal */}
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="text-3xl font-semibold tracking-tight text-text"
                  aria-label={`${todaySteps.toLocaleString()} steps today`}
                >
                  {todaySteps.toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  steps today · goal {stepGoal.toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  goalPct >= 100
                    ? 'border-brand/20 bg-brand-muted text-brand'
                    : 'border-border bg-surface-2 text-text-secondary'
                }`}
                aria-label={`${goalPct}% of daily goal`}
              >
                {goalPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 w-full rounded-full bg-surface-2 overflow-hidden"
              role="meter"
              aria-valuenow={todaySteps}
              aria-valuemin={0}
              aria-valuemax={stepGoal}
              aria-label={`Step progress: ${todaySteps} of ${stepGoal}`}
            >
              <div
                className="h-full rounded-full bg-brand transition-all duration-700 ease-expo"
                style={{ width: `${Math.min(100, goalPct)}%`, opacity: 0.8 }}
              />
            </div>

            {/* Weekly bar chart */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
                This week
              </p>
              <div
                className="flex items-end gap-2 h-20"
                role="img"
                aria-label={`Weekly steps: ${activityWeek.map((d) => `${d.day} ${d.steps.toLocaleString()}`).join(', ')}`}
              >
                {activityWeek.map(({ day, steps }) => {
                  const pct = (steps / maxSteps) * 100;
                  return (
                    <div key={day} className="flex flex-1 flex-col items-center gap-2" aria-hidden="true">
                      <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                        <div
                          className="w-full max-w-[24px] rounded-t-md transition-all duration-500"
                          style={{
                            height: `${Math.max(4, pct * 0.56)}px`,
                            backgroundColor: '#2E7D5A',
                            opacity: 0.65 + (pct / 100) * 0.35,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                        {day.slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step goal stepper */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium text-text">Daily step goal</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {stepSharingEnabled ? 'Shared with your therapist' : 'Private'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStepGoal(Math.max(1000, stepGoal - 500))}
                  aria-label="Decrease step goal by 500"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary hover:bg-surface-2 transition-colors duration-200 text-base font-medium leading-none"
                >
                  −
                </button>
                <span
                  className="min-w-[72px] text-center text-sm font-semibold text-text"
                  aria-live="polite"
                  aria-atomic
                >
                  {stepGoal.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setStepGoal(Math.min(20000, stepGoal + 500))}
                  aria-label="Increase step goal by 500"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary hover:bg-surface-2 transition-colors duration-200 text-base font-medium leading-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Sharing toggle */}
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-text-secondary">Share step data with therapist</span>
              <button
                type="button"
                role="switch"
                aria-checked={stepSharingEnabled}
                onClick={() => setStepSharing(!stepSharingEnabled)}
                className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-300 ${
                  stepSharingEnabled ? 'bg-brand' : 'bg-surface-2 border border-border'
                }`}
              >
                <span
                  className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                    stepSharingEnabled ? 'translate-x-[19px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </label>
          </div>
        </section>

        {/* Medication section */}
        <section aria-label="Medication reminders">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
              Medication
            </p>
            <p className="text-[10px] text-text-muted">Set by your prescriber · read-only</p>
          </div>

          <div className="flex flex-col gap-2" role="list">
            {medications.map((med) => {
              const taken = med.takenDates.includes(today);
              return (
                <article
                  key={med.id}
                  role="listitem"
                  className="rounded-2xl border border-border bg-surface px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleMedicationTaken(med.id)}
                      aria-pressed={taken}
                      aria-label={taken ? `Mark ${med.name} as not taken` : `Mark ${med.name} as taken`}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        taken
                          ? 'border-brand bg-brand text-white'
                          : 'border-border bg-surface text-transparent hover:border-brand/50'
                      }`}
                    >
                      {taken
                        ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        : <Circle className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                      }
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${taken ? 'text-text-muted line-through' : 'text-text'}`}>
                          {med.name}
                        </p>
                        <span className="text-xs text-text-secondary">{med.dose}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">{med.timeLabel} · {med.instructions}</p>
                      <p className="mt-0.5 text-[10px] text-text-muted">Prescribed by {med.prescriber}</p>
                    </div>

                    {taken && (
                      <span className="shrink-0 rounded-full border border-brand/20 bg-brand-muted px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-brand">
                        Taken
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Wellness reminders section */}
        <section aria-label="Wellness reminders">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
              Wellness reminders
            </p>
            <p className="text-[10px] text-text-muted">Patient-controlled</p>
          </div>

          <div className="flex flex-col gap-2">
            {wellnessReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`rounded-2xl border bg-surface transition-colors duration-200 ${
                  reminder.enabled ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{reminder.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {reminder.timeLabel} ·{' '}
                      {reminder.days.length === 7
                        ? 'Every day'
                        : `${reminder.days.length} day${reminder.days.length !== 1 ? 's' : ''} a week`}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={reminder.enabled}
                    aria-label={`${reminder.enabled ? 'Disable' : 'Enable'} ${reminder.title}`}
                    onClick={() => toggleWellnessReminder(reminder.id)}
                    className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-300 ${
                      reminder.enabled ? 'bg-brand' : 'bg-surface-2 border border-border'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                        reminder.enabled ? 'translate-x-[19px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeWellnessReminder(reminder.id)}
                    aria-label={`Remove ${reminder.title}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-2 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>

                {/* Day picker inline */}
                <div className="border-t border-border/60 px-5 py-3 flex gap-1.5" role="group" aria-label={`Days for ${reminder.title}`}>
                  {DAY_LABELS.map((label, i) => {
                    const d = i + 1;
                    const on = reminder.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const next = on
                            ? reminder.days.filter((x) => x !== d)
                            : [...reminder.days, d].sort((a, b) => a - b);
                          if (next.length > 0) updateWellnessDays(reminder.id, next);
                        }}
                        aria-pressed={on}
                        aria-label={label}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 ${
                          on ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted hover:bg-surface-2'
                        }`}
                      >
                        {label.slice(0, 1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Add reminder */}
            {addingReminder ? (
              <AddReminderForm
                onAdd={handleAdd}
                onCancel={() => setAddingReminder(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingReminder(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-medium text-text-secondary hover:border-brand/30 hover:text-brand transition-colors duration-300"
              >
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Add reminder
              </button>
            )}
          </div>
        </section>

        <p className="pb-4 text-xs text-text-muted leading-relaxed">
          All data is stored locally on your device. Step data will sync from your phone's health app in the final product.
        </p>

      </div>
    </main>
  );
};

export default RemindersView;
