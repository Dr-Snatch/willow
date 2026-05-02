import { useState, useEffect } from 'react'
import { Search, UserPlus, Archive, AlertTriangle, Info, Activity } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PATIENTS, PATIENT_SESSION_INSIGHTS, PATIENT_PERSONAL_CONTEXT, PATIENT_ACTIVITY } from '../data/mock'
import Badge, { StatusDot } from '../components/ui/Badge'
import Toggle from '../components/ui/Toggle'
import TabBar from '../components/ui/TabBar'
import BriefTab from './BriefTab'
import type { PatientTab, InsightType } from '../types'

const PATIENT_TABS: { id: PatientTab; label: string }[] = [
  { id: 'brief',         label: 'Pre-session brief' },
  { id: 'insights',      label: 'Insights' },
  { id: 'activity',      label: 'Activity' },
  { id: 'engagement',    label: 'Engagement' },
  { id: 'clinical',      label: 'Clinical' },
  { id: 'data',          label: 'Data access' },
  { id: 'export',        label: 'Export records' },
  { id: 'connection',    label: 'Connection' },
]

const QUICK_RANGE_OPTIONS = ['Last week', 'Last month', '3 months', 'All time']

const INSIGHT_TYPE_CONFIG: Record<InsightType, { label: string; className: string }> = {
  emotion:  { label: 'Emotion',  className: 'bg-[#DC4444]/10 text-[#DC4444]' },
  trigger:  { label: 'Trigger',  className: 'bg-[#E8721A]/10 text-[#E8721A]' },
  pattern:  { label: 'Pattern',  className: 'bg-brand-muted text-brand' },
  theme:    { label: 'Theme',    className: 'bg-surface-2 text-text-secondary' },
}

const MOOD_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Terrible', bg: 'bg-[#DC4444]',  text: 'text-white' },
  2: { label: 'Bad',      bg: 'bg-[#E8721A]',  text: 'text-white' },
  3: { label: 'Okay',     bg: 'bg-[#CA9B0E]',  text: 'text-white' },
  4: { label: 'Good',     bg: 'bg-[#2E9E56]',  text: 'text-white' },
  5: { label: 'Great',    bg: 'bg-[#1F7A40]',  text: 'text-white' },
}

// ── Insights Tab ────────────────────────────────────────────
const InsightsTab = ({ patientId }: { patientId: string }) => {
  const sessions = PATIENT_SESSION_INSIGHTS[patientId] ?? []
  const context  = PATIENT_PERSONAL_CONTEXT[patientId]

  const hasContext = context && (
    context.recurringEmotions.length > 0 ||
    context.knownTriggers.length > 0 ||
    context.behaviouralCycles.length > 0 ||
    context.protectiveFactors.length > 0
  )

  if (!hasContext && sessions.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">No insights yet — complete sessions will appear here.</p>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* PersonalContext */}
      {hasContext && (
        <section>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Personal context
            </p>
            <span className="text-[10px] text-text-muted">
              — built across {context.conversationCount} session{context.conversationCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
            {context.recurringEmotions.length > 0 && (
              <div className="px-5 py-4 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
                  Recurring emotions
                </p>
                <div className="flex flex-col gap-2.5">
                  {context.recurringEmotions.map((e) => (
                    <div key={e.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text">{e.label}</span>
                        <span className="text-xs text-text-muted tabular-nums">
                          {e.count} of {e.total} sessions
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand transition-all duration-500"
                          style={{ width: `${(e.count / e.total) * 100}%`, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {context.knownTriggers.length > 0 && (
              <div className="px-5 py-4 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
                  Known triggers
                </p>
                <div className="flex flex-col gap-2">
                  {context.knownTriggers.map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs font-medium text-text-secondary bg-surface-2 rounded-lg px-2 py-1 shrink-0 mt-0.5">
                        {t.context}
                      </span>
                      <span className="text-text-muted text-xs mt-1">→</span>
                      <span className="text-xs text-text-secondary leading-snug">{t.response}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {context.behaviouralCycles.length > 0 && (
              <div className="px-5 py-4 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
                  Behavioural cycles
                </p>
                <div className="flex flex-col gap-1.5">
                  {context.behaviouralCycles.map((c, i) => (
                    <p key={i} className="text-xs text-text-secondary leading-snug">· {c}</p>
                  ))}
                </div>
              </div>
            )}

            {context.protectiveFactors.length > 0 && (
              <div className="px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
                  Protective factors
                </p>
                <div className="flex flex-wrap gap-2">
                  {context.protectiveFactors.map((f, i) => (
                    <span key={i} className="rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex gap-2 items-start">
            <Info className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" strokeWidth={2} />
            <p className="text-[10px] text-text-muted leading-snug">
              Context is built from confirmed insights only. Treat as established tendency, not fixed conclusion — current sessions may show genuine change.
            </p>
          </div>
        </section>
      )}

      {/* Session insights timeline */}
      {sessions.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
            Session insights
          </p>
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <div key={session.sessionId} className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
                <div className="px-5 py-3 border-b border-border bg-surface-2/50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary">{session.dateLabel}</span>
                  <span className="text-[10px] text-text-muted">{session.insights.length} insight{session.insights.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-border">
                  {session.insights.map((insight) => {
                    const { label: typeLabel, className: typeCls } = INSIGHT_TYPE_CONFIG[insight.type]
                    const pct = Math.round(insight.confidence * 100)
                    return (
                      <div key={insight.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeCls}`}>
                              {typeLabel}
                            </span>
                            <span className="text-sm font-semibold text-text">{insight.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="h-1.5 w-14 rounded-full bg-surface-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-brand' : pct >= 60 ? 'bg-[#CA9B0E]' : 'bg-[#E8721A]'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-text-muted tabular-nums w-7">{pct}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed mb-2">{insight.observation}</p>
                        {insight.evidence.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {insight.evidence.map((e, i) => (
                              <p key={i} className="text-[11px] text-text-muted italic leading-snug pl-3 border-l-2 border-border">
                                {e}
                              </p>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2.5">
                          {insight.provenance.models.map(m => (
                            <span key={m} className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-surface-2 text-text-muted">
                              {m}
                            </span>
                          ))}
                          {insight.provenance.roundsNeeded > 1 && (
                            <span className="text-[9px] text-text-muted">· round 2</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Activity Tab ────────────────────────────────────────────
const ActivityTab = ({ patientId }: { patientId: string }) => {
  const activity = PATIENT_ACTIVITY[patientId]
  if (!activity || activity.days.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">No activity data shared yet.</p>
      </div>
    )
  }

  const recentDays = [...activity.days].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14)
  const maxSteps = Math.max(...recentDays.map(d => d.steps ?? 0), 1)
  const avgMood = recentDays.filter(d => d.mood).reduce((s, d) => s + (d.mood ?? 0), 0) / recentDays.filter(d => d.mood).length
  const medDays = recentDays.filter(d => d.medicationTaken !== null)
  const medAdherence = medDays.length ? Math.round(medDays.filter(d => d.medicationTaken).length / medDays.length * 100) : null

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-surface px-4 py-4">
          <p className="text-xl font-semibold text-text tracking-tight">{avgMood > 0 ? avgMood.toFixed(1) : '—'}<span className="text-sm font-normal text-text-muted">/5</span></p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mt-1">Avg mood (14d)</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-4 py-4">
          <p className="text-xl font-semibold text-text tracking-tight">
            {recentDays[0]?.steps != null ? recentDays[0].steps.toLocaleString() : '—'}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mt-1">Steps today</p>
        </div>
        {medAdherence !== null ? (
          <div className="rounded-2xl border border-border bg-surface px-4 py-4">
            <p className={`text-xl font-semibold tracking-tight ${medAdherence >= 80 ? 'text-brand' : medAdherence >= 60 ? 'text-[#CA9B0E]' : 'text-[#E8721A]'}`}>{medAdherence}%</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mt-1">Medication adherence</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface px-4 py-4">
            <p className="text-xl font-semibold text-text-muted tracking-tight">—</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mt-1">Medication</p>
          </div>
        )}
      </div>

      {/* Mood grid */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
          Mood history
        </p>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex gap-1.5 flex-wrap">
            {recentDays.map((day) => {
              const cfg = day.mood ? MOOD_CONFIG[day.mood] : null
              const dateLabel = new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              return (
                <div key={day.date} title={`${dateLabel}${cfg ? ` — ${cfg.label}` : ' — No data'}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${cfg ? cfg.bg : 'bg-surface-2'}`}>
                    <span className={`text-[10px] font-semibold ${cfg ? cfg.text : 'text-text-muted'}`}>
                      {day.mood ?? '·'}
                    </span>
                  </div>
                  <p className="text-[8px] text-text-muted text-center mt-0.5 leading-none">
                    {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
            {[1,2,3,4,5].map(m => (
              <div key={m} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded ${MOOD_CONFIG[m].bg}`} />
                <span className="text-[10px] text-text-muted">{MOOD_CONFIG[m].label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps chart */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Activity (steps)
          </p>
          <p className="text-[10px] text-text-muted">Goal: {activity.stepGoal.toLocaleString()}/day</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-end gap-1.5 h-20">
            {recentDays.slice(0, 7).reverse().map((day) => {
              const pct = day.steps != null ? Math.min((day.steps / Math.max(maxSteps, activity.stepGoal)) * 100, 100) : 0
              const metGoal = (day.steps ?? 0) >= activity.stepGoal
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}: ${day.steps?.toLocaleString() ?? 'No data'}`}
                >
                  <div className="w-full flex items-end justify-center" style={{ height: '64px' }}>
                    <div
                      className={`w-full rounded-md transition-all ${day.steps != null ? (metGoal ? 'bg-brand' : 'bg-[#E8721A]/60') : 'bg-surface-2'}`}
                      style={{ height: `${Math.max(pct, day.steps != null ? 5 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-text-muted">
                    {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'narrow' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Medication */}
      {activity.medications.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
            Medication adherence
          </p>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
            {activity.medications.map((med, i) => (
              <div key={i} className={`px-5 py-3.5 ${i < activity.medications.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-text">{med.name}</span>
                    <span className="ml-2 text-xs text-text-muted">{med.dosage} · {med.timing}</span>
                  </div>
                  {medAdherence !== null && (
                    <span className={`text-xs font-semibold ${medAdherence >= 80 ? 'text-brand' : 'text-[#E8721A]'}`}>
                      {medAdherence}% adherence
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {recentDays.slice(0, 10).reverse().map((day) => (
                    <div
                      key={day.date}
                      title={new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      className={`h-6 w-6 rounded flex items-center justify-center text-[9px] font-medium ${
                        day.medicationTaken === true ? 'bg-brand text-white' :
                        day.medicationTaken === false ? 'bg-[#DC4444]/10 text-[#DC4444]' :
                        'bg-surface-2 text-text-muted'
                      }`}
                    >
                      {new Date(day.date).getDate()}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Engagement Tab ──────────────────────────────────────────
const EngagementTab = ({ patientId }: { patientId: string }) => {
  const { patientState, updatePatient } = useStore()
  const state = patientState[patientId]
  const patient = PATIENTS.find(p => p.id === patientId)!
  const charCount = state.rewardMessage.length
  const isHighRisk = state.highRisk

  return (
    <div className="p-6 flex flex-col gap-5">
      {patient.hasEpisodeSignal && (
        <div className="rounded-xl border border-[#E8721A]/25 bg-[#E8721A]/5 px-4 py-3.5 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-mood-2 mt-0.5 shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-text-secondary">Mood episode signal active</p>
            <p className="text-xs text-text-muted mt-0.5 leading-snug">
              Consider pausing engagement features until this episode resolves. Streaks and reward pressure can be counterproductive during low-mood periods.
            </p>
          </div>
        </div>
      )}

      {isHighRisk && (
        <div className="rounded-xl border border-mood-1/20 bg-mood-1/5 px-4 py-3 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-mood-1 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-text-secondary leading-snug">
            Patient is marked high risk. All engagement features are suppressed.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col divide-y divide-border">
        <Toggle checked={state.companionEnabled && !isHighRisk} onChange={(v) => updatePatient(patientId, { companionEnabled: v })} disabled={isHighRisk} label="Willow companion" sublabel="Weekly pet growth system visible in patient app" />
        <Toggle checked={state.giftsEnabled && !isHighRisk} onChange={(v) => updatePatient(patientId, { giftsEnabled: v })} disabled={isHighRisk} label="Weekly gift rewards" sublabel="Accessories unlocked on week completion" />
        <Toggle checked={state.streakEnabled && !isHighRisk} onChange={(v) => updatePatient(patientId, { streakEnabled: v })} disabled={isHighRisk} label="Streak display" sublabel="Consider turning off for patients with anxiety or perfectionism" />
        <Toggle checked={state.growthPhraseEnabled && !isHighRisk} onChange={(v) => updatePatient(patientId, { growthPhraseEnabled: v })} disabled={isHighRisk} label="Growth philosophy phrase" sublabel='"Growth is not linear…" shown across key screens' />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Reward message <span className="ml-1 text-xs font-normal text-text-muted">(optional)</span>
        </label>
        <p className="text-xs text-text-muted mb-2">Delivered on patient's next completed week</p>
        <div className="relative">
          <textarea
            value={state.rewardMessage}
            onChange={(e) => { if (e.target.value.length <= 120) updatePatient(patientId, { rewardMessage: e.target.value }) }}
            disabled={isHighRisk}
            rows={3}
            placeholder="Add a personal note for your patient…"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-brand transition-colors duration-150 disabled:opacity-40"
          />
          <span className={`absolute bottom-2.5 right-3 text-xs tabular-nums ${charCount > 100 ? 'text-mood-2' : 'text-text-muted'}`}>{charCount}/120</span>
        </div>
      </div>

      <button className="self-start px-5 py-2 rounded-xl bg-brand text-white text-sm font-semibold transition-colors duration-150 hover:bg-brand-light">Save engagement settings</button>
    </div>
  )
}

// ── Clinical Tab ────────────────────────────────────────────
const ClinicalTab = ({ patientId }: { patientId: string }) => {
  const { patientState, updatePatient } = useStore()
  const state = patientState[patientId]
  const patient = PATIENTS.find(p => p.id === patientId)!

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col divide-y divide-border">
        <Toggle checked={state.highRisk} onChange={(v) => updatePatient(patientId, { highRisk: v })} label="Mark as high risk" sublabel="Suppresses all engagement features immediately" />
        <Toggle checked={state.monitorEpisodes} onChange={(v) => updatePatient(patientId, { monitorEpisodes: v })} label="Monitor for mood episodes" sublabel="AI flags significant mood dips and pattern changes" />
      </div>

      {patient.hasEpisodeSignal && (
        <div className="rounded-2xl border border-mood-2/20 bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-mood-2" strokeWidth={2} />
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Active AI signal</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-text-secondary leading-relaxed mb-3">{patient.episodeDescription}</p>
            <div className="rounded-xl bg-surface-2 px-3.5 py-2.5 flex gap-2">
              <Info className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" strokeWidth={2} />
              <p className="text-xs text-text-muted leading-snug">AI signal only — not a diagnosis. Differential requires clinical assessment.</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-text">Private clinical notes</label>
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">Not visible to patient</span>
        </div>
        <textarea value={state.clinicalNotes} onChange={(e) => updatePatient(patientId, { clinicalNotes: e.target.value })} rows={6} placeholder="Add clinical observations, risk assessments, or session notes…" className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-brand transition-colors" />
      </div>

      <button className="self-start px-5 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors">Save</button>
    </div>
  )
}

// ── Data Access Tab ─────────────────────────────────────────
const DataTab = ({ patientId }: { patientId: string }) => {
  const patient = PATIENTS.find(p => p.id === patientId)!
  const rows = [
    { label: 'AI conversations',   value: patient.sharesConversations },
    { label: 'Mood & check-in data', value: patient.sharesMood },
    { label: 'Step & activity data', value: patient.sharesSteps },
    { label: 'Medication adherence', value: true, alwaysOn: true },
  ]

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="rounded-xl border border-brand/20 bg-brand-faint px-4 py-3 flex gap-3">
        <Info className="h-4 w-4 text-brand mt-0.5 shrink-0" strokeWidth={2} />
        <p className="text-sm text-text-secondary leading-snug">Only the patient can change these settings from their own app.</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">Shared data</p>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {rows.map((row, i) => (
            <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}>
              <div>
                <span className="text-sm text-text">{row.label}</span>
                {row.alwaysOn && <span className="ml-2 text-[10px] font-medium text-text-muted">(always on)</span>}
              </div>
              <div className={`h-5 w-9 rounded-full flex items-center ${row.value ? 'bg-brand' : 'bg-border-strong'}`}>
                <span className={`h-3.5 w-3.5 rounded-full bg-white shadow mx-0.5 transition-all ${row.value ? 'ml-3.5' : 'ml-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">Consent record</p>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {[{ label: 'Initial consent', value: patient.consentDate }, { label: 'Last updated', value: patient.lastConsentUpdate }, { label: 'Version', value: patient.consentVersion }].map((row, i) => (
            <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${i < 2 ? 'border-b border-border' : ''}`}>
              <span className="text-sm text-text-secondary">{row.label}</span>
              <span className="text-sm font-medium text-text">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Export Records Tab ──────────────────────────────────────
const ExportTab = ({ patientId }: { patientId: string }) => {
  const { patientState, updatePatient, updatePatientNested } = useStore()
  const state = patientState[patientId]

  const includeRows = [
    { key: 'mood',           label: 'Mood & check-in history' },
    { key: 'conversations',  label: 'AI conversation logs' },
    { key: 'medication',     label: 'Medication adherence' },
    { key: 'activity',       label: 'Activity & steps' },
    { key: 'episodeSignals', label: 'Mood episode signals' },
    { key: 'copingUsage',    label: 'Coping plan usage' },
  ] as const

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 flex gap-3">
        <Info className="h-4 w-4 text-text-muted mt-0.5 shrink-0" strokeWidth={2} />
        <p className="text-xs text-text-secondary leading-snug">Exports are encrypted, access-logged, available for 24 hours, and the patient is notified on every export.</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">Date range</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_RANGE_OPTIONS.map(r => (
            <button key={r} onClick={() => updatePatient(patientId, { exportQuickRange: r })} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${state.exportQuickRange === r ? 'bg-brand text-white' : 'border border-border bg-surface text-text-secondary hover:bg-surface-2'}`}>{r}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={state.exportDateFrom} onChange={e => updatePatient(patientId, { exportDateFrom: e.target.value, exportQuickRange: 'Custom' })} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
          <span className="text-text-muted text-sm">to</span>
          <input type="date" value={state.exportDateTo} onChange={e => updatePatient(patientId, { exportDateTo: e.target.value, exportQuickRange: 'Custom' })} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">Include</p>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {includeRows.map((row, i) => (
            <div key={row.key} className={`flex items-center justify-between px-5 py-3 ${i < includeRows.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-sm text-text">{row.label}</span>
              <button role="switch" aria-checked={state.exportIncludes[row.key]} onClick={() => updatePatientNested(patientId, 'exportIncludes', row.key, !state.exportIncludes[row.key])} className={`relative h-5 w-9 rounded-full transition-colors ${state.exportIncludes[row.key] ? 'bg-brand' : 'bg-border-strong'}`}>
                <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${state.exportIncludes[row.key] ? 'left-3.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">Format</p>
        <div className="flex gap-3">
          {(['PDF', 'CSV'] as const).map(fmt => (
            <button key={fmt} onClick={() => updatePatient(patientId, { exportFormat: fmt })} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${state.exportFormat === fmt ? 'border-brand bg-brand-muted text-brand' : 'border-border bg-surface text-text-secondary hover:bg-surface-2'}`}>
              {state.exportFormat === fmt && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
              {fmt} {fmt === 'PDF' ? 'report' : 'data'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors">Generate export</button>
        <p className="text-[10px] text-text-muted">Logged for GDPR audit · patient will be notified</p>
      </div>
    </div>
  )
}

// ── Connection Tab ──────────────────────────────────────────
const ConnectionTab = ({ patientId }: { patientId: string }) => {
  const patient = PATIENTS.find(p => p.id === patientId)!
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-sm text-text-secondary">Connected since</span>
          <span className="text-sm font-medium text-text">{patient.connectedSince}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-sm text-text-secondary">Status</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" />Active
          </span>
        </div>
      </div>

      {!confirming ? (
        <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Remove patient</p>
            <p className="text-xs text-text-muted mt-0.5">Disconnects link · data retained · patient will be notified</p>
          </div>
          <button onClick={() => setConfirming(true)} className="self-start px-4 py-2 rounded-xl border border-mood-1/30 text-mood-1 text-sm font-medium hover:bg-mood-1/5 transition-colors">Remove patient</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-mood-1/25 bg-mood-1/5 p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-text">Are you sure?</p>
          <p className="text-xs text-text-secondary leading-snug">This will disconnect {patient.name} from your account. Their data is retained and they can reconnect with a new invite code. This action cannot be undone.</p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-mood-1 text-white text-sm font-semibold hover:bg-[#c53c3c] transition-colors">Confirm removal</button>
            <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Patient Detail ──────────────────────────────────────────
const PatientDetail = ({ patientId }: { patientId: string }) => {
  const { selectedPatientTab, selectPatient } = useStore()
  const patient = PATIENTS.find(p => p.id === patientId)!
  const setTab = (tab: string) => selectPatient(patientId, tab as PatientTab)

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-surface/50 shrink-0">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-2xl bg-brand-muted flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-brand">{patient.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-semibold text-text">{patient.name}</h2>
              <Badge status={patient.status} />
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-text-muted">{patient.therapyType}</span>
              <span className="text-text-muted text-xs">·</span>
              <span className="text-xs text-text-muted">Since {patient.startDate}</span>
            </div>
          </div>
        </div>
      </div>

      <TabBar tabs={PATIENT_TABS} activeId={selectedPatientTab} onChange={setTab} className="px-6 bg-surface/30 shrink-0" />

      <div className="flex-1 overflow-y-auto">
        {selectedPatientTab === 'brief'         && <BriefTab patientId={patientId} />}
        {selectedPatientTab === 'insights'      && <InsightsTab patientId={patientId} />}
        {selectedPatientTab === 'activity'      && <ActivityTab patientId={patientId} />}
        {selectedPatientTab === 'engagement'    && <EngagementTab patientId={patientId} />}
        {selectedPatientTab === 'clinical'      && <ClinicalTab patientId={patientId} />}
        {selectedPatientTab === 'data'          && <DataTab patientId={patientId} />}
        {selectedPatientTab === 'export'        && <ExportTab patientId={patientId} />}
        {selectedPatientTab === 'connection'    && <ConnectionTab patientId={patientId} />}
      </div>
    </div>
  )
}

// ── Main View ───────────────────────────────────────────────
const PatientsView = () => {
  const { selectedPatientId, selectPatient } = useStore()
  const [search, setSearch] = useState('')

  const filtered = PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (!selectedPatientId && PATIENTS.length > 0) {
      selectPatient(PATIENTS[0].id, 'brief')
    }
  }, [])

  return (
    <div className="flex h-full bg-background page-enter">
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-surface/60 h-full">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map(patient => (
            <button key={patient.id} onClick={() => selectPatient(patient.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${selectedPatientId === patient.id ? 'bg-brand-faint' : 'hover:bg-surface-2'}`}>
              <div className="h-9 w-9 rounded-full bg-brand-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-brand">{patient.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text truncate">{patient.name}</span>
                  <StatusDot status={patient.status} />
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate leading-snug">{patient.statusNote}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 w-full rounded-xl border border-brand/30 bg-brand-faint px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand-muted transition-colors">
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />Invite new patient
          </button>
          <button className="flex items-center justify-center gap-1.5 w-full text-xs text-text-muted hover:text-text-secondary transition-colors py-1">
            <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />Archived patients (3)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedPatientId ? (
          <PatientDetail patientId={selectedPatientId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-muted">Select a patient to view their details.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientsView
