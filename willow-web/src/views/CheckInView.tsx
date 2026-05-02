import { useState } from 'react';
import { useCheckInStore } from '../store/useCheckIn';
import { useConversationStore } from '../store/useConversation';
import { useUserStore } from '../store/useUser';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

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
  const last7: ({ mood: number } | null)[] = Array(7).fill(null);
  const now = Date.now();

  history.slice(0, 7).forEach((entry) => {
    const daysAgo = Math.floor((now - entry.timestamp) / 86400000);
    if (daysAgo < 7) last7[6 - daysAgo] = entry;
  });

  const moodColor = (value: number) => MOODS.find((m) => m.value === value)?.color;

  return (
    <div className="flex justify-between gap-1">
      {last7.map((entry, i) => {
        const dayLabel = days[(new Date().getDay() - (6 - i) + 7) % 7];
        const isToday  = i === 6;
        const color    = entry ? moodColor(entry.mood) : undefined;
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`h-10 w-10 rounded-xl border transition-all duration-300 ${
                isToday ? 'ring-1 ring-brand/25' : ''
              }`}
              style={{
                backgroundColor: color ? `${color}22` : '#E2DBD1',
                borderColor: color ? `${color}40` : '#E2DBD1',
              }}
            >
              {entry && color && (
                <div
                  className="h-full w-full rounded-xl"
                  style={{ backgroundColor: `${color}30` }}
                >
                  <div
                    className="mx-auto mt-[10px] h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              )}
            </div>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider ${
                isToday ? 'text-brand' : 'text-text-muted'
              }`}
            >
              {isToday ? 'Today' : dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CheckInView = () => {
  const { mood, sleep, thoughts, setMood, setSleep, setThoughts, submitCheckIn, history } =
    useCheckInStore();
  const { clearMessages, setPendingCheckIn } = useConversationStore();
  const { name } = useUserStore();
  const navigate  = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const canSubmit    = mood !== null && sleep !== null;
  const selectedMood = MOODS.find((m) => m.value === mood);

  const handleSubmit = () => {
    if (!canSubmit) return;
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
        <div className="check-in-success flex flex-col items-center gap-3 text-center">
          <div
            className="h-12 w-12 rounded-2xl border-2 mx-auto"
            style={{
              backgroundColor: selectedMood ? `${selectedMood.color}18` : undefined,
              borderColor: selectedMood ? `${selectedMood.color}40` : undefined,
            }}
          />
          <CheckCircle2 className="h-10 w-10 text-brand" strokeWidth={1.5} />
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
          <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted mb-3">
            {formatDate()}
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
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-widest text-text-muted">
              This week
            </p>
            <WeekHistory history={history} />
          </div>
        )}

        {/* Mood */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-text">How are you feeling?</label>
            {selectedMood && (
              <span className="text-sm font-medium transition-colors duration-300" style={{ color: selectedMood.color }}>
                {selectedMood.label}
              </span>
            )}
          </div>
          <div className="flex overflow-hidden rounded-2xl border border-border bg-surface">
            {MOODS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setMood(value)}
                title={label}
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
          <label className="text-sm font-medium text-text">How did you sleep?</label>
          <div className="flex justify-between gap-2">
            {SLEEP.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSleep(value)}
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
            <label className="text-sm font-medium text-text">
              What's on your mind?{' '}
              <span className="font-normal text-text-muted">optional</span>
            </label>
            <span className={`text-xs ${thoughts.length > NOTES_MAX - 50 ? 'text-amber-500' : 'text-text-muted'}`}>
              {thoughts.length}/{NOTES_MAX}
            </span>
          </div>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value.slice(0, NOTES_MAX))}
            placeholder="A sentence or two is enough…"
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted transition-all duration-300 focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-brand/10"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-dark mb-4 w-full rounded-xl border border-text/20 bg-text py-3.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Log check-in
        </button>

      </div>
    </div>
  );
};

export default CheckInView;
