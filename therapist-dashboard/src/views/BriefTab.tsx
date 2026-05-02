import { useState } from 'react'
import { Printer, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { PATIENTS, PATIENT_SESSION_INSIGHTS, PATIENT_PERSONAL_CONTEXT, PATIENT_ACTIVITY } from '../data/mock'
import { useStore } from '../store/useStore'

// ── Helpers ──────────────────────────────────────────────────

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const MOOD_LABELS: Record<number, string> = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' }
const MOOD_BG: Record<number, string> = {
  1: 'bg-[#DC4444]', 2: 'bg-[#E8721A]', 3: 'bg-[#CA9B0E]', 4: 'bg-[#2E9E56]', 5: 'bg-[#1F7A40]',
}
const MOOD_TEXT: Record<number, string> = {
  1: 'text-[#DC4444]', 2: 'text-[#E8721A]', 3: 'text-[#CA9B0E]', 4: 'text-[#2E9E56]', 5: 'text-[#1F7A40]',
}
const INSIGHT_TYPE_STYLE: Record<string, string> = {
  emotion: 'bg-[#DC4444]/10 text-[#DC4444]',
  trigger: 'bg-[#E8721A]/10 text-[#E8721A]',
  pattern: 'bg-brand-muted text-brand',
  theme:   'bg-surface-2 text-text-secondary',
}

// ── Brief compiler ───────────────────────────────────────────

function compileBrief(patientId: string, patientState: Record<string, { copingPlans: { name: string; usageCount: number; active: boolean }[]; clinicalNotes: string; highRisk: boolean; monitorEpisodes: boolean }>) {
  const patient  = PATIENTS.find(p => p.id === patientId)!
  const sessions = PATIENT_SESSION_INSIGHTS[patientId] ?? []
  const context  = PATIENT_PERSONAL_CONTEXT[patientId]
  const activity = PATIENT_ACTIVITY[patientId]
  const state    = patientState[patientId]

  const lastSession = sessions[0] ?? null
  const lastSessionDate = lastSession?.date ?? null
  const daysSince = lastSessionDate ? daysBetween(lastSessionDate, today()) : null

  // Activity since last session
  const recentDays = (activity?.days ?? [])
    .filter(d => !lastSessionDate || d.date >= lastSessionDate)
    .sort((a, b) => b.date.localeCompare(a.date))

  const moodDays = recentDays.filter(d => d.mood !== null)
  const avgMood = moodDays.length
    ? moodDays.reduce((s, d) => s + (d.mood ?? 0), 0) / moodDays.length
    : null

  const lowestMood = moodDays.length ? Math.min(...moodDays.map(d => d.mood ?? 5)) : null
  const highestMood = moodDays.length ? Math.max(...moodDays.map(d => d.mood ?? 1)) : null

  // Mood trend (compare first half vs second half of period)
  let moodTrend: 'improving' | 'declining' | 'stable' = 'stable'
  if (moodDays.length >= 4) {
    const half = Math.floor(moodDays.length / 2)
    const recent = moodDays.slice(0, half).reduce((s, d) => s + (d.mood ?? 0), 0) / half
    const older  = moodDays.slice(half).reduce((s, d) => s + (d.mood ?? 0), 0) / half
    if (recent - older > 0.4) moodTrend = 'improving'
    else if (older - recent > 0.4) moodTrend = 'declining'
  }

  const medDays = recentDays.filter(d => d.medicationTaken !== null)
  const medAdherence = medDays.length
    ? Math.round(medDays.filter(d => d.medicationTaken).length / medDays.length * 100)
    : null

  const avgSteps = recentDays.filter(d => d.steps !== null).length
    ? Math.round(recentDays.filter(d => d.steps !== null).reduce((s, d) => s + (d.steps ?? 0), 0) / recentDays.filter(d => d.steps !== null).length)
    : null

  // Latest session insights
  const latestInsights = lastSession?.insights ?? []

  // Suggested focus areas
  const focusAreas: string[] = []

  if (patient.hasEpisodeSignal) {
    focusAreas.push('Review mood trajectory — AI signal detected a sustained low-mood period in the past 72 hours')
  }
  if (patient.status === 'crisis') {
    focusAreas.push('Safety assessment — patient triggered crisis detection since last session')
  }
  if (medAdherence !== null && medAdherence < 75) {
    focusAreas.push(`Medication adherence — ${medAdherence}% this period, below the 80% threshold`)
  }
  if (recentDays.length < 3 && daysSince !== null && daysSince > 5) {
    focusAreas.push('Engagement — fewer than 3 check-ins recorded since last session')
  }
  if (moodTrend === 'declining') {
    focusAreas.push('Mood has trended downward this period — explore contributing factors')
  }
  if (context?.behaviouralCycles.length) {
    focusAreas.push(`Continue work on: ${context.behaviouralCycles[0]}`)
  }
  if (latestInsights.length && !focusAreas.find(f => f.includes(latestInsights[0].label))) {
    focusAreas.push(`Explore: "${latestInsights[0].label}" — ${latestInsights[0].observation}`)
  }
  if (focusAreas.length === 0) {
    focusAreas.push('No urgent flags — continue current therapeutic direction')
  }

  return {
    patient,
    lastSession,
    lastSessionDate,
    daysSince,
    recentDays,
    moodDays,
    avgMood,
    lowestMood,
    highestMood,
    moodTrend,
    medAdherence,
    avgSteps,
    latestInsights,
    context,
    activity,
    state,
    focusAreas,
    checkInCount: recentDays.length,
    generatedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

// ── Brief Rendering ──────────────────────────────────────────

const StatBox = ({ value, label, sub, colour }: { value: string; label: string; sub?: string; colour?: string }) => (
  <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-1">
    <span className={`text-2xl font-semibold tracking-tight leading-none ${colour ?? 'text-text'}`}>{value}</span>
    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</span>
    {sub && <span className="text-[10px] text-text-muted">{sub}</span>}
  </div>
)

const SectionHead = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted mb-3 pt-1">{children}</p>
)

// ── Main component ───────────────────────────────────────────

const BriefTab = ({ patientId }: { patientId: string }) => {
  const { patientState } = useStore()
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const brief = compileBrief(patientId, patientState)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 1200)
  }

  const handlePrint = () => window.print()

  const showBrief = generated || brief.lastSessionDate !== null || brief.recentDays.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-border bg-surface/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {brief.lastSessionDate && (
            <span className="text-xs text-text-muted">
              Last session: <span className="font-medium text-text-secondary">{fmtDateShort(brief.lastSessionDate)}</span>
              {brief.daysSince !== null && (
                <span className="ml-1.5 text-text-muted">({brief.daysSince} day{brief.daysSince !== 1 ? 's' : ''} ago)</span>
              )}
            </span>
          )}
          {generated && (
            <span className="text-[10px] text-text-muted">· Compiled {brief.generatedAt}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${generating ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary hover:bg-surface-2'}`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} strokeWidth={2} />
            {generating ? 'Compiling…' : generated ? 'Refresh' : 'Compile brief'}
          </button>
          {showBrief && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={2} />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!showBrief ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-center">
            <p className="text-sm font-medium text-text mb-1">Pre-session brief</p>
            <p className="text-xs text-text-muted max-w-xs leading-relaxed">
              Compiles mood data, check-ins, session insights, and coping plan usage into a single brief for review before your appointment.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} strokeWidth={2} />
            {generating ? 'Compiling…' : 'Compile brief'}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" id="brief-print-area">
          <div className="max-w-3xl mx-auto px-8 py-6 flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between pb-5 border-b-2 border-text/10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold text-text">{brief.patient.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    brief.patient.status === 'crisis' ? 'bg-[#DC4444]/10 text-[#DC4444]' :
                    brief.patient.status === 'elevated' ? 'bg-[#E8721A]/10 text-[#E8721A]' :
                    brief.patient.status === 'low-engagement' ? 'bg-[#CA9B0E]/10 text-[#CA9B0E]' :
                    'bg-brand-muted text-brand'
                  }`}>
                    {brief.patient.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  {brief.patient.therapyType} · In therapy since {brief.patient.startDate}
                  {brief.context && brief.context.conversationCount > 0 && (
                    <span className="text-text-muted"> · {brief.context.conversationCount} recorded sessions</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-text-secondary">Pre-session brief</p>
                <p className="text-xs text-text-muted mt-0.5">{fmtDate(today())}</p>
              </div>
            </div>

            {/* Clinical flags — shown prominently if any */}
            {(brief.patient.hasEpisodeSignal || brief.patient.status === 'crisis' || brief.state?.highRisk) && (
              <div className={`rounded-2xl border px-5 py-4 flex gap-3 ${
                brief.patient.status === 'crisis' || brief.state?.highRisk
                  ? 'border-[#DC4444]/20 bg-[#DC4444]/5'
                  : 'border-[#E8721A]/20 bg-[#E8721A]/5'
              }`}>
                <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${brief.patient.status === 'crisis' || brief.state?.highRisk ? 'text-[#DC4444]' : 'text-[#E8721A]'}`} strokeWidth={2} />
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${brief.patient.status === 'crisis' || brief.state?.highRisk ? 'text-[#DC4444]' : 'text-[#E8721A]'}`}>
                    {brief.patient.status === 'crisis' ? 'Crisis flag active' : brief.state?.highRisk ? 'Patient marked high risk' : 'Elevated mood signal'}
                  </p>
                  <p className="text-xs text-text-secondary leading-snug">
                    {brief.patient.episodeDescription ?? 'Review clinical notes and consider safety assessment at the start of this session.'}
                  </p>
                </div>
              </div>
            )}

            {/* Since last session — stats */}
            <section>
              <SectionHead>
                Since last session
                {brief.lastSessionDate && <span className="ml-1 normal-case font-normal tracking-normal text-text-muted"> — {fmtDateShort(brief.lastSessionDate)}{brief.daysSince !== null ? `, ${brief.daysSince} days ago` : ''}</span>}
              </SectionHead>

              <div className="grid grid-cols-4 gap-3">
                <StatBox
                  value={String(brief.checkInCount)}
                  label="Check-ins"
                  sub={brief.daysSince ? `of ${brief.daysSince} days` : undefined}
                  colour={brief.checkInCount < 2 ? 'text-[#E8721A]' : 'text-text'}
                />
                <StatBox
                  value={brief.avgMood !== null ? brief.avgMood.toFixed(1) : '—'}
                  label="Avg mood"
                  sub={brief.avgMood !== null ? MOOD_LABELS[Math.round(brief.avgMood)] : 'No data'}
                  colour={brief.avgMood !== null ? MOOD_TEXT[Math.round(brief.avgMood) as 1|2|3|4|5] : undefined}
                />
                <StatBox
                  value={brief.avgSteps !== null ? brief.avgSteps.toLocaleString() : '—'}
                  label="Avg steps/day"
                  sub={brief.activity?.stepGoal ? `Goal: ${brief.activity.stepGoal.toLocaleString()}` : undefined}
                />
                <StatBox
                  value={brief.medAdherence !== null ? `${brief.medAdherence}%` : '—'}
                  label="Med. adherence"
                  sub={brief.medAdherence === null ? 'Not tracked' : brief.medAdherence >= 80 ? 'On track' : 'Below threshold'}
                  colour={brief.medAdherence !== null ? (brief.medAdherence >= 80 ? 'text-brand' : 'text-[#E8721A]') : undefined}
                />
              </div>
            </section>

            {/* Mood strip */}
            {brief.moodDays.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <SectionHead>Mood trajectory</SectionHead>
                  <div className="flex items-center gap-1.5 -mt-1">
                    {brief.moodTrend === 'improving' && <><TrendingUp className="h-3.5 w-3.5 text-brand" strokeWidth={2}/><span className="text-[10px] font-medium text-brand">Improving</span></>}
                    {brief.moodTrend === 'declining' && <><TrendingDown className="h-3.5 w-3.5 text-[#DC4444]" strokeWidth={2}/><span className="text-[10px] font-medium text-[#DC4444]">Declining</span></>}
                    {brief.moodTrend === 'stable'    && <><Minus className="h-3.5 w-3.5 text-text-muted" strokeWidth={2}/><span className="text-[10px] font-medium text-text-muted">Stable</span></>}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                  <div className="flex items-end gap-1.5 h-16 mb-2">
                    {brief.moodDays.slice().reverse().map((day, i) => {
                      const mood = day.mood as 1|2|3|4|5
                      const h = (mood / 5) * 100
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${fmtDateShort(day.date)} — ${MOOD_LABELS[mood]}`}>
                          <div className="w-full flex items-end" style={{ height: '52px' }}>
                            <div className={`w-full rounded-sm ${MOOD_BG[mood]}`} style={{ height: `${Math.max(h, 12)}%` }} />
                          </div>
                          <span className="text-[8px] text-text-muted leading-none hidden sm:block">
                            {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    {brief.lowestMood !== null && (
                      <span className="text-[10px] text-text-muted">Low: <span className={`font-medium ${MOOD_TEXT[brief.lowestMood as 1|2|3|4|5]}`}>{MOOD_LABELS[brief.lowestMood]}</span></span>
                    )}
                    {brief.highestMood !== null && (
                      <span className="text-[10px] text-text-muted">High: <span className={`font-medium ${MOOD_TEXT[brief.highestMood as 1|2|3|4|5]}`}>{MOOD_LABELS[brief.highestMood]}</span></span>
                    )}
                    {[1,2,3,4,5].map(m => (
                      <div key={m} className="flex items-center gap-1 ml-auto first:ml-0">
                        <div className={`h-2.5 w-2.5 rounded-sm ${MOOD_BG[m]}`} />
                        <span className="text-[9px] text-text-muted">{MOOD_LABELS[m]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Latest session insights */}
            {brief.latestInsights.length > 0 && (
              <section>
                <SectionHead>
                  Key observations from last session
                  {brief.lastSession && <span className="ml-1 normal-case font-normal tracking-normal text-text-muted">— {fmtDateShort(brief.lastSession.date)}</span>}
                </SectionHead>
                <div className="flex flex-col gap-2.5">
                  {brief.latestInsights.map(insight => (
                    <div key={insight.id} className="rounded-xl border border-border bg-surface px-4 py-3.5 flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${INSIGHT_TYPE_STYLE[insight.type]}`}>
                          {insight.type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text mb-0.5">{insight.label}</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{insight.observation}</p>
                        {insight.evidence[0] && (
                          <p className="mt-1.5 text-[11px] text-text-muted italic pl-2.5 border-l-2 border-border leading-snug">
                            {insight.evidence[0]}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-1 mt-0.5">
                        <div className={`h-1.5 w-10 rounded-full overflow-hidden bg-surface-2`}>
                          <div className={`h-full rounded-full ${insight.confidence >= 0.8 ? 'bg-brand' : insight.confidence >= 0.6 ? 'bg-[#CA9B0E]' : 'bg-[#E8721A]'}`} style={{ width: `${Math.round(insight.confidence * 100)}%` }} />
                        </div>
                        <span className="text-[9px] text-text-muted w-6 tabular-nums">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Established patterns */}
              {brief.context && (brief.context.recurringEmotions.length > 0 || brief.context.knownTriggers.length > 0 || brief.context.behaviouralCycles.length > 0) && (
                <section>
                  <SectionHead>Established patterns</SectionHead>
                  <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
                    {brief.context.recurringEmotions.length > 0 && (
                      <div className="px-4 py-3.5 border-b border-border">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted mb-2.5">Recurring emotions</p>
                        <div className="flex flex-col gap-2">
                          {brief.context.recurringEmotions.slice(0, 3).map(e => (
                            <div key={e.label}>
                              <div className="flex justify-between mb-0.5">
                                <span className="text-xs font-medium text-text">{e.label}</span>
                                <span className="text-[10px] text-text-muted">{e.count}/{e.total}</span>
                              </div>
                              <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden">
                                <div className="h-full rounded-full bg-brand/70" style={{ width: `${(e.count / e.total) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {brief.context.knownTriggers.length > 0 && (
                      <div className="px-4 py-3.5 border-b border-border">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted mb-2.5">Known triggers</p>
                        <div className="flex flex-col gap-1.5">
                          {brief.context.knownTriggers.slice(0, 2).map((t, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] bg-surface-2 rounded px-1.5 py-0.5 font-medium text-text-secondary shrink-0">{t.context}</span>
                              <ChevronRight className="h-3 w-3 text-text-muted mt-0.5 shrink-0" strokeWidth={2} />
                              <span className="text-[10px] text-text-secondary leading-snug">{t.response}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {brief.context.behaviouralCycles.length > 0 && (
                      <div className="px-4 py-3.5">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted mb-2">Behavioural cycles</p>
                        {brief.context.behaviouralCycles.slice(0, 2).map((c, i) => (
                          <p key={i} className="text-[10px] text-text-secondary leading-relaxed">· {c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Coping plan usage */}
              {brief.state?.copingPlans && brief.state.copingPlans.filter(p => p.active).length > 0 && (
                <section>
                  <SectionHead>Coping plans in use</SectionHead>
                  <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
                    {brief.state.copingPlans.filter(p => p.active).map((plan, i, arr) => (
                      <div key={plan.name} className={`px-4 py-3.5 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                        <span className="text-sm font-medium text-text">{plan.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-brand bg-brand-muted rounded-full px-2 py-0.5">{plan.usageCount} uses</span>
                          {plan.usageCount > 5 ? (
                            <CheckCircle className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Suggested focus areas */}
            <section>
              <SectionHead>Suggested focus for this session</SectionHead>
              <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
                {brief.focusAreas.map((area, i) => (
                  <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${i < brief.focusAreas.length - 1 ? 'border-b border-border' : ''}`}>
                    <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      i === 0 && brief.focusAreas.length > 1 ? 'bg-brand' : 'bg-border-strong'
                    }`} />
                    <p className="text-sm text-text-secondary leading-snug">{area}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Protective factors */}
            {brief.context && brief.context.protectiveFactors.length > 0 && (
              <section>
                <SectionHead>Protective factors</SectionHead>
                <div className="flex flex-wrap gap-2">
                  {brief.context.protectiveFactors.map((f, i) => (
                    <span key={i} className="rounded-full border border-brand/20 bg-brand-faint px-3 py-1 text-xs font-medium text-brand">
                      {f}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <p className="text-[9px] text-text-muted leading-snug">
                Compiled from patient check-ins, AI session insights, and coping plan data. AI signals are observational only — not diagnostic.
              </p>
              <p className="text-[9px] text-text-muted shrink-0 ml-4">Willow · {fmtDate(today())}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default BriefTab
