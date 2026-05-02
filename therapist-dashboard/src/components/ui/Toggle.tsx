interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
  sublabel?: string
  disabledNote?: string
  id?: string
}

const Toggle = ({ checked, onChange, disabled, label, sublabel, disabledNote, id }: Props) => {
  const toggleId = id ?? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <label htmlFor={toggleId} className={`block text-sm font-medium ${disabled ? 'text-text-muted' : 'text-text'} leading-snug cursor-pointer`}>
          {label}
        </label>
        {sublabel && (
          <p className="mt-0.5 text-xs text-text-muted leading-snug">{sublabel}</p>
        )}
        {disabled && disabledNote && (
          <p className="mt-0.5 text-xs text-text-muted leading-snug italic">{disabledNote}</p>
        )}
      </div>
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 mt-0.5 inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
        } ${checked ? 'bg-brand' : 'bg-border-strong'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ease-expo ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export default Toggle
