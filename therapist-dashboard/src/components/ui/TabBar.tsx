interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

const TabBar = ({ tabs, activeId, onChange, className = '' }: Props) => (
  <div className={`flex border-b border-border ${className}`} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={activeId === tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-expo border-b-2 -mb-px ${
          activeId === tab.id
            ? 'border-brand text-brand'
            : 'border-transparent text-text-muted hover:text-text-secondary'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

export default TabBar
