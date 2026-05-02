import { KeyRound, Monitor, Info } from 'lucide-react'
import { useStore } from '../store/useStore'
import Toggle from '../components/ui/Toggle'
import Stepper from '../components/ui/Stepper'

const ACTIVE_SESSIONS = [
  { device: 'MacBook Pro — Chrome', location: 'London, UK', current: true },
  { device: 'iPhone 16 Pro — Safari', location: 'London, UK', current: false },
]

const SecurityView = () => {
  const { security, updateSecurity } = useStore()

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="px-8 py-8 page-enter">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Security</p>
          <h1 className="font-display font-light italic tracking-tighter text-text" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)' }}>
            Account security
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Authentication */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Authentication</p>
              </div>

              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-surface-2 flex items-center justify-center">
                    <KeyRound className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">Password</p>
                    <p className="text-xs text-text-muted mt-0.5">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors">
                  Change
                </button>
              </div>

              <div className="px-6 divide-y divide-border">
                <div className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-text">Two-factor authentication</p>
                    <p className="text-xs text-text-muted mt-0.5 leading-snug">Legally required as a clinical data controller</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 mt-0.5 rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />On
                  </span>
                </div>
              </div>

              <div className="px-6 pb-4">
                <div className="rounded-xl bg-surface-2 px-3.5 py-2.5 flex gap-2">
                  <Info className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" strokeWidth={2} />
                  <p className="text-xs text-text-muted leading-snug">2FA cannot be disabled — it is a legal requirement for clinical data controllers handling sensitive health data.</p>
                </div>
              </div>

              <div className="px-6 divide-y divide-border border-t border-border">
                <Toggle checked={security.biometricEnabled} onChange={(v) => updateSecurity({ biometricEnabled: v })} label="Biometric unlock" sublabel="Use Face ID or fingerprint to unlock the dashboard" />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Session management */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Session management</p>
              </div>

              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm text-text">Auto-lock after inactivity</p>
                  <p className="text-xs text-text-muted mt-0.5">Min 1 min, max 30 min</p>
                </div>
                <Stepper value={security.autoLockMinutes} min={1} max={30} step={5} unit="min" label="auto-lock" onChange={(v) => updateSecurity({ autoLockMinutes: v })} />
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Active sessions</p>
                <div className="flex flex-col gap-2">
                  {ACTIVE_SESSIONS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-text-muted shrink-0" strokeWidth={1.75} />
                        <div>
                          <p className="text-sm font-medium text-text">{s.device}</p>
                          <p className="text-xs text-text-muted mt-0.5">{s.location}</p>
                        </div>
                      </div>
                      {s.current ? (
                        <span className="text-xs font-medium text-brand">This device</span>
                      ) : (
                        <button className="text-xs font-medium text-text-muted hover:text-mood-1 transition-colors">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityView
