import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Trash2, ArrowLeft, Check } from 'lucide-react';
import { populateSampleData, wipeAllData } from '../utils/seedData';
import { useCheckInStore } from '../store/useCheckIn';
import { useStreakStore } from '../store/useStreak';
import { useProfileStore } from '../store/useProfile';
import { useUserStore } from '../store/useUser';
import { useRemindersStore } from '../store/useReminders';

const DevView = () => {
  const navigate = useNavigate();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [populating, setPopulating] = useState(false);

  const { name, hasOnboarded } = useUserStore();
  const { history } = useCheckInStore();
  const { streak, health } = useStreakStore();
  const { sessionInsights, patternCounts } = useProfileStore();
  const { todaySteps, medications } = useRemindersStore();

  const takenCount = medications.filter((m) =>
    m.takenDates.includes(new Date().toISOString().slice(0, 10))
  ).length;

  const handlePopulate = () => {
    setPopulating(true);
    setTimeout(() => populateSampleData(), 200);
  };

  const handleWipe = () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      return;
    }
    wipeAllData();
  };

  return (
    <main className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Back
          </button>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Developer
          </p>
          <h1
            className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
            style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}
          >
            Dev tools.
          </h1>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4" role="note">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-sm leading-relaxed text-amber-800">
            For testing purposes only. These actions modify or destroy all locally stored app data.
          </p>
        </div>

        {/* Current state */}
        <section aria-label="Current app state">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Current state
          </p>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {[
              { label: 'Onboarded', value: hasOnboarded ? `Yes · ${name || 'no name'}` : 'No' },
              { label: 'Check-ins', value: String(history.length) },
              { label: 'Streak', value: `${streak} days · ${health}% health` },
              { label: 'Sessions', value: String(sessionInsights.length) },
              { label: 'Patterns tracked', value: String(Object.keys(patternCounts).length) },
              { label: 'Steps today', value: todaySteps.toLocaleString() },
              { label: 'Medications taken', value: `${takenCount} / ${medications.length}` },
            ].map(({ label, value }, i, arr) => (
              <div
                key={label}
                className={`flex items-center justify-between px-5 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-xs text-text-secondary">{label}</span>
                <span className="text-xs font-semibold text-text">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section aria-label="Developer actions" className="flex flex-col gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
            Actions
          </p>

          {/* Populate */}
          <div className="rounded-2xl border border-border bg-surface px-5 py-5 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-text">Populate sample data</p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                Fills the app with 25 days of check-ins, 6 session insights, realistic pattern data, and a 5-day streak. Any existing data is overwritten.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePopulate}
              disabled={populating}
              aria-busy={populating}
              className="btn-dark flex items-center justify-center gap-2 w-full rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {populating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                  Populating…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                  Populate sample data
                </>
              )}
            </button>
          </div>

          {/* Wipe */}
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-red-700">Wipe all data & reset</p>
              <p className="mt-1 text-xs leading-relaxed text-red-600">
                Clears all locally stored data — check-ins, profile, streak, reminders — and returns to the onboarding screen. Cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={handleWipe}
              className={`flex items-center justify-center gap-2 w-full rounded-xl border py-3 text-sm font-semibold transition-all duration-300 ${
                confirmWipe
                  ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                  : 'border-red-300 bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {confirmWipe ? 'Tap again to confirm wipe' : 'Wipe all data & reset'}
            </button>
            {confirmWipe && (
              <button
                type="button"
                onClick={() => setConfirmWipe(false)}
                className="text-center text-xs text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <p className="pb-4 text-xs text-text-muted">
          Access this page any time at <code className="font-mono">/dev</code>
        </p>

      </div>
    </main>
  );
};

export default DevView;
