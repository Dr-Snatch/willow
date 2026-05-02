import { useCheckInStore } from '../store/useCheckIn';
import { useStreakStore } from '../store/useStreak';
import { TimeOfDay } from '../types';
import WillowTree from '../components/WillowTree';

const MOOD_COLORS = ['', '#DC4444', '#E8721A', '#CA9B0E', '#2E9E56', '#1F7A40'];
const MOOD_LABELS = ['', 'Awful', 'Low', 'Okay', 'Good', 'Great'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};
const TIME_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

const TrendsView = () => {
  const { history } = useCheckInStore();
  const { health, streak, longestStreak } = useStreakStore();

  // ── Last 28 days grid ────────────────────────────
  const today = new Date();
  const grid: ({ mood: number; date: Date } | null)[] = Array(28).fill(null);
  history.forEach((e) => {
    const d = new Date(e.timestamp);
    const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diffDays < 28) grid[27 - diffDays] = { mood: e.mood, date: d };
  });

  // ── Day-of-week averages ─────────────────────────
  const dowSums = Array(7).fill(0);
  const dowCounts = Array(7).fill(0);
  history.forEach((e) => {
    const dow = e.dayOfWeek ?? new Date(e.timestamp).getDay();
    dowSums[dow] += e.mood;
    dowCounts[dow]++;
  });
  const dowAvg = dowSums.map((s, i) => (dowCounts[i] > 0 ? s / dowCounts[i] : null));

  // ── Time-of-day averages ─────────────────────────
  const timeSums: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const timeCounts: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  history.forEach((e) => {
    const t: TimeOfDay = e.timeOfDay ?? 'morning';
    timeSums[t] += e.mood;
    timeCounts[t]++;
  });
  const timeAvg: Record<TimeOfDay, number | null> = TIME_ORDER.reduce((acc, t) => {
    acc[t] = timeCounts[t] > 0 ? timeSums[t] / timeCounts[t] : null;
    return acc;
  }, {} as Record<TimeOfDay, number | null>);

  const healthLabel =
    health < 20 ? 'Withered' :
    health < 40 ? 'Struggling' :
    health < 60 ? 'Growing' :
    health < 80 ? 'Healthy' : 'Thriving';

  const hasEnoughData = history.length >= 3;

  // Helper: readable date for grid cell aria-label
  const gridDateLabel = (cell: { mood: number; date: Date } | null, index: number) => {
    if (!cell) {
      const d = new Date(today);
      d.setDate(d.getDate() - (27 - index));
      return `${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}: no check-in`;
    }
    return `${cell.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}: ${MOOD_LABELS[cell.mood]}`;
  };

  return (
    <main className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Your journey
          </p>
          <h1
            className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
            style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}
          >
            Growth over time.
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Small patterns, quietly noticed.
          </p>
        </div>

        {/* Tree + streak */}
        <section aria-label="Willow tree and streak">
          <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col items-center gap-5">
            <WillowTree health={health} size={140} />

            <div className="flex w-full justify-around pt-2 border-t border-border">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-semibold tracking-tight text-text" aria-label={`${streak} day streak`}>
                  {streak}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted" aria-hidden="true">
                  Day streak
                </span>
              </div>
              <div className="w-px bg-border" aria-hidden="true" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-semibold tracking-tight text-text" aria-label={`Best streak: ${longestStreak} days`}>
                  {longestStreak}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted" aria-hidden="true">
                  Best streak
                </span>
              </div>
              <div className="w-px bg-border" aria-hidden="true" />
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-sm font-semibold tracking-tight"
                  aria-label={`Tree health: ${healthLabel}`}
                  style={{ color: health < 30 ? '#DC4444' : health < 60 ? '#CA9B0E' : '#2E7D5A' }}
                >
                  {healthLabel}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted" aria-hidden="true">
                  Tree health
                </span>
              </div>
            </div>

            {/* Health bar */}
            <div
              className="w-full"
              role="meter"
              aria-valuenow={health}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Tree health: ${health}%`}
            >
              <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-expo"
                  style={{
                    width: `${health}%`,
                    backgroundColor:
                      health < 30 ? '#DC4444' :
                      health < 60 ? '#CA9B0E' : '#2E7D5A',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 28-day grid */}
        <section aria-label="Mood history for the last 28 days">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Last 28 days
          </p>
          <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label="28-day mood grid">
            {DAYS.map((d) => (
              <span
                key={d}
                className="text-center text-[9px] font-semibold uppercase tracking-widest text-text-muted"
                aria-hidden="true"
              >
                {d}
              </span>
            ))}
            {grid.map((cell, i) => (
              <div
                key={i}
                role="gridcell"
                aria-label={gridDateLabel(cell, i)}
                className="aspect-square rounded-lg transition-opacity duration-300"
                style={{
                  backgroundColor: cell ? MOOD_COLORS[cell.mood] : '#E2DBD1',
                  opacity: cell ? 0.85 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap mt-3" role="list" aria-label="Mood colour legend">
            {[1, 2, 3, 4, 5].map((v) => (
              <div key={v} className="flex items-center gap-1.5" role="listitem">
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: MOOD_COLORS[v], opacity: 0.85 }}
                  aria-hidden="true"
                />
                <span className="text-[10px] text-text-muted">{MOOD_LABELS[v]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Patterns — only if enough data */}
        {hasEnoughData && (
          <>
            {/* Day of week */}
            <section aria-label="Average mood by day of week">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
                Day of week
              </p>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div
                  className="flex items-end gap-2 h-20"
                  role="img"
                  aria-label={`Average mood by day of week. ${DAYS.map((d, i) => dowAvg[i] !== null ? `${d}: ${dowAvg[i]!.toFixed(1)}` : `${d}: no data`).join(', ')}`}
                >
                  {DAYS.map((day, i) => {
                    const avgVal = dowAvg[i];
                    const pct = avgVal !== null ? ((avgVal - 1) / 4) * 100 : 0;
                    return (
                      <div key={day} className="flex flex-1 flex-col items-center gap-2" aria-hidden="true">
                        <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                          <div
                            className="w-full max-w-[20px] rounded-t-md transition-all duration-500"
                            style={{
                              height: avgVal !== null ? `${Math.max(4, pct * 0.56)}px` : 4,
                              backgroundColor: avgVal !== null ? `#2E7D5A` : '#E2DBD1',
                              opacity: avgVal !== null ? 0.7 + (pct / 100) * 0.3 : 0.3,
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
                {dowAvg.some((v) => v !== null) && (
                  <p className="mt-3 text-xs text-text-muted">Average mood by day of the week</p>
                )}
              </div>
            </section>

            {/* Time of day */}
            {Object.values(timeCounts).some((c) => c > 0) && (
              <section aria-label="Average mood by time of day">
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
                  Time of day
                </p>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div
                    className="flex items-end gap-2 h-20"
                    role="img"
                    aria-label={`Average mood by time of day. ${TIME_ORDER.map((t) => timeAvg[t] !== null ? `${TIME_LABELS[t]}: ${timeAvg[t]!.toFixed(1)}` : `${TIME_LABELS[t]}: no data`).join(', ')}`}
                  >
                    {TIME_ORDER.map((t) => {
                      const avgVal = timeAvg[t];
                      const pct = avgVal !== null ? ((avgVal - 1) / 4) * 100 : 0;
                      return (
                        <div key={t} className="flex flex-1 flex-col items-center gap-2" aria-hidden="true">
                          <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                            <div
                              className="w-full max-w-[28px] rounded-t-md transition-all duration-500"
                              style={{
                                height: avgVal !== null ? `${Math.max(4, pct * 0.56)}px` : 4,
                                backgroundColor: avgVal !== null ? '#2E7D5A' : '#E2DBD1',
                                opacity: avgVal !== null ? 0.7 + (pct / 100) * 0.3 : 0.3,
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                            {TIME_LABELS[t].slice(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-text-muted">Average mood by time of day</p>
                </div>
              </section>
            )}
          </>
        )}

        {!hasEnoughData && (
          <div className="rounded-2xl border border-border bg-surface px-5 py-5">
            <p className="text-sm text-text-secondary leading-relaxed">
              Complete a few more check-ins to unlock mood patterns.
            </p>
          </div>
        )}

        <p className="pb-4 text-xs text-text-muted leading-relaxed">
          All data is stored locally on your device.
        </p>
      </div>
    </main>
  );
};

export default TrendsView;
