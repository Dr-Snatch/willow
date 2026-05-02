import { useState } from 'react';
import { useProfileStore } from '../store/useProfile';
import { useCheckInStore } from '../store/useCheckIn';
import { useStreakStore } from '../store/useStreak';
import { useUserStore } from '../store/useUser';
import { generateHandoff } from '../services/anthropic';
import { Copy, Check, RefreshCw } from 'lucide-react';

const PATTERN_LABELS: Record<string, string> = {
  anxiety:          'Anxiety',
  rumination:       'Rumination',
  catastrophising:  'Catastrophising',
  'low mood':       'Low mood',
  withdrawal:       'Withdrawal',
  'self-criticism': 'Self-criticism',
};

function formatRelativeDate(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const ProfileView = () => {
  const { sessionInsights, patternCounts, recentNotes, handoff, handoffUpdatedAt, setHandoff } =
    useProfileStore();
  const { history } = useCheckInStore();
  const { streak } = useStreakStore();
  const { name } = useUserStore();

  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Stats from check-in history (last 28 days)
  const now = Date.now();
  const recent = history.filter((e) => now - e.timestamp < 28 * 86400000);
  const avgMood  = avg(recent.map((e) => e.mood));
  const avgSleep = avg(recent.map((e) => e.sleep));
  const daysUsing = history.length > 0
    ? Math.max(1, Math.round((now - history[history.length - 1].timestamp) / 86400000))
    : 0;

  const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
  const maxPatternCount = sortedPatterns[0]?.[1] ?? 1;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError('');
    try {
      const text = await generateHandoff({
        name: name || 'Anonymous',
        daysUsing,
        totalCheckIns: history.length,
        totalSessions: sessionInsights.length,
        avgMood,
        avgSleep,
        patternCounts,
        sessionInsights,
        recentNotes,
      });
      if (text) setHandoff(text);
      else setGenerateError('Generation failed — check your API connection.');
    } catch {
      setGenerateError('Generation failed — check your API connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(handoff).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasData = history.length > 0 || sessionInsights.length > 0;

  return (
    <div className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted">
            Mental profile
          </p>
          <h1
            className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
            style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}
          >
            {name ? `${name}'s profile.` : 'Your profile.'}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Built quietly across your check-ins and conversations.
          </p>
        </div>

        {!hasData && (
          <div className="rounded-2xl border border-border bg-surface px-5 py-5">
            <p className="text-sm text-text-secondary leading-relaxed">
              Complete your first check-in and have a conversation with Willow to start building your profile.
            </p>
          </div>
        )}

        {/* Summary stats */}
        {hasData && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Reflections', value: String(sessionInsights.length) },
              { label: 'Check-ins', value: String(history.length) },
              {
                label: 'Avg mood',
                value: avgMood > 0 ? `${avgMood.toFixed(1)}/5` : '—',
              },
              { label: 'Day streak', value: String(streak) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-surface px-5 py-4 flex flex-col gap-1"
              >
                <span className="text-xl font-semibold tracking-tight text-text">{value}</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Patterns */}
        {sortedPatterns.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
              Observed patterns
            </p>
            <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
              {sortedPatterns.map(([pattern, count]) => (
                <div key={pattern} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text">
                      {PATTERN_LABELS[pattern] ?? pattern}
                    </span>
                    <span className="text-xs text-text-muted">
                      {count} session{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${(count / maxPatternCount) * 100}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session insights timeline */}
        {sessionInsights.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
              Session notes
            </p>
            <div className="flex flex-col gap-2">
              {sessionInsights.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-border bg-surface px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                      {formatRelativeDate(s.timestamp)}
                    </span>
                    {s.patterns.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {s.patterns.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="rounded-full border border-brand/20 bg-brand-muted px-2 py-0.5 text-[9px] font-medium text-brand"
                          >
                            {PATTERN_LABELS[p] ?? p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {s.summary ? (
                    <p className="text-sm text-text-secondary leading-relaxed">{s.summary}</p>
                  ) : (
                    <p className="text-sm text-text-muted italic">Summary unavailable for this session.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent notes */}
        {recentNotes.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
              Journal notes
            </p>
            <div className="flex flex-col gap-2">
              {recentNotes.slice(0, 4).map((note, i) => (
                <div key={i} className="rounded-2xl border border-border bg-surface px-5 py-4">
                  <p className="text-sm text-text-secondary leading-relaxed">"{note.text}"</p>
                  <p className="mt-2 text-[10px] text-text-muted">
                    {formatRelativeDate(note.timestamp)} · Mood {note.mood}/5
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Therapist handoff */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
              Therapist handoff
            </p>
            {handoffUpdatedAt && (
              <span className="text-[10px] text-text-muted">
                Updated {formatRelativeDate(handoffUpdatedAt)}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              A clinical summary you can share with a therapist before your first session. Generated
              from your check-ins, patterns, and session notes.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating || !hasData}
              className="btn-dark flex items-center justify-center gap-2 w-full rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                  Generating…
                </>
              ) : handoff ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Regenerate handoff
                </>
              ) : (
                'Generate handoff'
              )}
            </button>

            {generateError && (
              <p className="text-xs text-red-500">{generateError}</p>
            )}
          </div>

          {handoff && (
            <div className="rounded-2xl border border-border-strong bg-surface flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Handoff document
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors duration-200 hover:bg-surface-2 hover:text-text"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-brand" strokeWidth={2.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" strokeWidth={2} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="px-5 py-5">
                <pre className="whitespace-pre-wrap font-sans text-sm text-text leading-relaxed">
                  {handoff}
                </pre>
              </div>
            </div>
          )}
        </div>

        <p className="pb-4 text-xs text-text-muted leading-relaxed">
          All data is stored locally on your device. Nothing is shared without your action.
        </p>

      </div>
    </div>
  );
};

export default ProfileView;
