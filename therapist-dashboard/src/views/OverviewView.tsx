import { TrendingUp, TrendingDown, Minus, Video, Phone, MapPin, AlertTriangle, Activity, Clock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PATIENTS, TODAY_SESSIONS } from '../data/mock'
import Badge, { StatusDot } from '../components/ui/Badge'
import type { PatientStatus, MoodTrend } from '../types'

const STATUS_ORDER: PatientStatus[] = ['crisis', 'elevated', 'low-engagement', 'stable', 'new']
const STATUS_LABELS: Record<PatientStatus, string> = {
  crisis: 'Crisis',
  elevated: 'Elevated',
  'low-engagement': 'Low engagement',
  stable: 'Stable',
  new: 'New',
}
const STATUS_COLORS: Record<PatientStatus, string> = {
  crisis: 'text-mood-1',
  elevated: 'text-mood-2',
  'low-engagement': 'text-mood-3',
  stable: 'text-brand',
  new: 'text-text-secondary',
}

const TrendIcon = ({ trend }: { trend: MoodTrend }) => {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-mood-1" strokeWidth={2} />
  return <Minus className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
}

const SessionTypeIcon = ({ type }: { type: string }) => {
  if (type === 'Video') return <Video className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
  if (type === 'Phone') return <Phone className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
  return <MapPin className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
}

const OverviewView = () => {
  const { setActiveSection, selectPatient } = useStore()

  const counts = STATUS_ORDER.reduce<Record<PatientStatus, number>>(
    (acc, s) => ({ ...acc, [s]: PATIENTS.filter((p) => p.status === s).length }),
    {} as Record<PatientStatus, number>
  )

  const flaggedPatients = PATIENTS.filter(
    (p) => p.status === 'crisis' || p.status === 'elevated' || p.status === 'low-engagement'
  )

  const handlePatientClick = (patientId: string) => {
    selectPatient(patientId, 'clinical')
    setActiveSection('patients')
  }

  const handleSessionClick = (patientId: string) => {
    selectPatient(patientId, 'engagement')
    setActiveSection('patients')
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-8 page-enter">

        {/* Header */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
            Overview
          </p>
          <h1 className="font-display font-light italic tracking-tighter text-text" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>
            Good morning, Dr Chen.
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Status summary */}
        <section aria-label="Patient status summary">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
            Caseload status
          </p>
          <div className="grid grid-cols-5 gap-3">
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                onClick={() => setActiveSection('patients')}
                className="rounded-2xl border border-border bg-surface px-4 py-4 flex flex-col gap-1 text-left transition-all duration-200 hover:shadow-card-hover hover:border-border-strong group"
              >
                <span className={`text-2xl font-semibold tracking-tight ${STATUS_COLORS[status]}`}>
                  {counts[status]}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted group-hover:text-text-secondary transition-colors">
                  {STATUS_LABELS[status]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-6">
          {/* Flagged patients */}
          <section aria-label="Flagged patients requiring attention">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-3.5 w-3.5 text-mood-1" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Requires attention
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
              {flaggedPatients.length === 0 ? (
                <div className="px-5 py-6 text-sm text-text-muted text-center">
                  No flagged patients today.
                </div>
              ) : (
                flaggedPatients.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => handlePatientClick(p.id)}
                    className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-surface-2 ${
                      i < flaggedPatients.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-full w-0.5 rounded-full self-stretch shrink-0 ${
                        p.status === 'crisis' ? 'bg-mood-1' :
                        p.status === 'elevated' ? 'bg-mood-2' : 'bg-mood-3'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-text">{p.name}</span>
                        <Badge status={p.status} size="sm" />
                      </div>
                      <p className="text-xs text-text-secondary leading-snug line-clamp-2">
                        {p.statusNote}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Today's sessions */}
          <section aria-label="Today's sessions">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Today's sessions
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
              {TODAY_SESSIONS.length === 0 ? (
                <div className="px-5 py-6 text-sm text-text-muted text-center">
                  No sessions scheduled today.
                </div>
              ) : (
                TODAY_SESSIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleSessionClick(s.patientId)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-surface-2 ${
                      i < TODAY_SESSIONS.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text">{s.patientName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <SessionTypeIcon type={s.type} />
                        <span className="text-xs text-text-secondary">{s.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text tabular-nums">{s.time}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Pre-brief ready</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Weekly digest */}
        <section aria-label="Weekly patient digest">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Weekly digest
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 px-5 py-2.5 border-b border-border">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Patient</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted text-center w-24">Check-ins</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted text-center w-16">Mood</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted text-center w-20">Status</span>
            </div>
            {PATIENTS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handlePatientClick(p.id)}
                className={`w-full grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-5 py-3.5 text-left hover:bg-surface-2 transition-colors duration-150 ${
                  i < PATIENTS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-brand-muted flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-brand">{p.initials}</span>
                  </div>
                  <span className="text-sm font-medium text-text">{p.name}</span>
                </div>
                <div className="flex items-center gap-0.5 w-24 justify-center" aria-label={`${p.checkInsThisWeek} of 7 check-ins`}>
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${
                        idx < p.checkInsThisWeek ? 'bg-brand' : 'bg-surface-2'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 text-xs text-text-muted tabular-nums">{p.checkInsThisWeek}/7</span>
                </div>
                <div className="w-16 flex justify-center">
                  <TrendIcon trend={p.moodTrend} />
                </div>
                <div className="w-20 flex justify-center">
                  <StatusDot status={p.status} />
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

export default OverviewView
