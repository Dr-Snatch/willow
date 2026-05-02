import type { PatientStatus } from '../../types'

const CONFIG: Record<PatientStatus, { label: string; className: string }> = {
  crisis:           { label: 'Crisis',        className: 'bg-[#DC4444]/10 text-[#DC4444]' },
  elevated:         { label: 'Elevated',      className: 'bg-[#E8721A]/10 text-[#E8721A]' },
  'low-engagement': { label: 'Low engagement', className: 'bg-[#CA9B0E]/10 text-[#CA9B0E]' },
  stable:           { label: 'Stable',        className: 'bg-brand-muted text-brand' },
  new:              { label: 'New',           className: 'bg-surface-2 text-text-secondary' },
}

interface Props {
  status: PatientStatus
  size?: 'sm' | 'md'
}

const Badge = ({ status, size = 'md' }: Props) => {
  const { label, className } = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${className} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {label}
    </span>
  )
}

export const StatusDot = ({ status }: { status: PatientStatus }) => {
  const colours: Record<PatientStatus, string> = {
    crisis: 'bg-mood-1',
    elevated: 'bg-mood-2',
    'low-engagement': 'bg-mood-3',
    stable: 'bg-brand',
    new: 'bg-text-muted',
  }
  return <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${colours[status]}`} />
}

export default Badge
