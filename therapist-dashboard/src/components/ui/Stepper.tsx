interface Props {
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  label?: string
}

const Stepper = ({ value, min, max, step = 1, unit = '', onChange, label }: Props) => (
  <div className="flex items-center gap-2">
    <button
      aria-label={`Decrease ${label ?? ''}`}
      onClick={() => onChange(Math.max(min, value - step))}
      disabled={value <= min}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-30 text-sm font-medium"
    >
      −
    </button>
    <span className="min-w-[3.5rem] text-center text-sm font-semibold text-text tabular-nums">
      {value}{unit ? ` ${unit}` : ''}
    </span>
    <button
      aria-label={`Increase ${label ?? ''}`}
      onClick={() => onChange(Math.min(max, value + step))}
      disabled={value >= max}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-30 text-sm font-medium"
    >
      +
    </button>
  </div>
)

export default Stepper
