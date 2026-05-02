import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Bell,
  ShieldCheck,
  Lock,
  User,
} from 'lucide-react'
import WillowLogo from './WillowLogo'
import { useStore } from '../store/useStore'
import { THERAPIST } from '../data/mock'
import type { Section } from '../types'

const NAV_ITEMS: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'overview',      label: 'Overview',          Icon: LayoutDashboard },
  { id: 'patients',      label: 'Patients',           Icon: Users },
  { id: 'coping-plans',  label: 'Coping Plans',       Icon: BookOpen },
  { id: 'availability',  label: 'Availability',       Icon: Calendar },
  { id: 'notifications', label: 'Notifications',      Icon: Bell },
  { id: 'data-privacy',  label: 'Data & Privacy',     Icon: ShieldCheck },
  { id: 'security',      label: 'Security',           Icon: Lock },
  { id: 'account',       label: 'Account',            Icon: User },
]

const Sidebar = () => {
  const { activeSection, setActiveSection } = useStore()

  return (
    <nav
      aria-label="Main navigation"
      className="flex w-56 shrink-0 flex-col border-r border-border bg-surface/80 backdrop-blur-sm"
    >
      {/* Logo + brand */}
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand shadow-brand shrink-0">
            <WillowLogo className="h-4 w-4 text-white" strokeWidth={1.75} />
          </div>
          <span className="font-display font-light italic text-text text-base tracking-tight">Willow</span>
        </div>

        {/* Therapist info */}
        <div>
          <p className="text-sm font-semibold text-text leading-snug">{THERAPIST.name}</p>
          <p className="text-xs text-text-muted mt-0.5">{THERAPIST.title}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-muted px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-[11px] font-medium text-brand">{THERAPIST.patientCount} patients</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-expo mb-0.5 ${
                isActive
                  ? 'bg-brand-muted text-brand'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text-secondary'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Sidebar
