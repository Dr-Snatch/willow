import { useState } from 'react'
import { ExternalLink, LogOut, Camera } from 'lucide-react'
import { useStore } from '../store/useStore'
import { THERAPIST } from '../data/mock'

const AccountView = () => {
  const { account, updateAccount } = useStore()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="px-8 py-8 page-enter">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Account</p>
          <h1 className="font-display font-light italic tracking-tighter text-text" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)' }}>
            Your account
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Details */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Details</p>
              </div>
              {[
                { label: 'Name',         value: THERAPIST.name },
                { label: 'Email',        value: THERAPIST.email },
                { label: 'Member since', value: THERAPIST.memberSince },
              ].map((row, i) => (
                <div key={row.label} className={`flex items-center justify-between px-6 py-3.5 ${i < 2 ? 'border-b border-border' : ''}`}>
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className="text-sm font-medium text-text">{row.value}</span>
                </div>
              ))}
            </section>

            {/* Subscription */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Subscription</p>
              </div>
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-text">{THERAPIST.plan}</p>
                    <span className="rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-medium text-brand">Active</span>
                  </div>
                  <p className="text-xs text-text-muted">Up to {THERAPIST.patientLimit} patients · AI insights · full export</p>
                </div>
              </div>
              <div className="px-6 py-3.5 border-b border-border flex items-center justify-between">
                <span className="text-sm text-text-secondary">Renewal date</span>
                <span className="text-sm font-medium text-text">{THERAPIST.renewalDate}</span>
              </div>
              <button className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-surface-2 transition-colors group">
                <span className="text-sm font-medium text-brand">Upgrade to Enterprise</span>
                <ExternalLink className="h-4 w-4 text-brand" strokeWidth={1.75} />
              </button>
            </section>

            {/* Support */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Support</p>
              </div>
              <button className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-surface-2 transition-colors border-b border-border group">
                <span className="text-sm text-text-secondary">Help centre</span>
                <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" strokeWidth={1.75} />
              </button>
              <button className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-surface-2 transition-colors border-b border-border group">
                <span className="text-sm text-text-secondary">Send feedback</span>
                <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" strokeWidth={1.75} />
              </button>
              <button className="w-full flex items-center gap-2 px-6 py-3.5 hover:bg-mood-1/5 transition-colors">
                <LogOut className="h-4 w-4 text-mood-1 shrink-0" strokeWidth={1.75} />
                <span className="text-sm font-medium text-mood-1">Sign out</span>
              </button>
            </section>
          </div>

          {/* Right column: profile editor */}
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Profile</p>
                <p className="text-xs text-text-muted mt-0.5">Visible to patients on their app</p>
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                {/* Photo */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-brand-muted flex items-center justify-center shrink-0">
                    <span className="text-xl font-semibold text-brand">SC</span>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors">
                    <Camera className="h-4 w-4" strokeWidth={1.75} />Change photo
                  </button>
                </div>

                {[
                  { label: 'Full name',       key: 'fullName' as const,       value: account.fullName },
                  { label: 'Title',           key: 'title' as const,          value: account.title },
                  { label: 'Specialisation',  key: 'specialisation' as const, value: account.specialisation },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">{field.label}</label>
                    <input value={field.value} onChange={e => updateAccount({ [field.key]: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                    Bio <span className="normal-case text-text-muted font-normal tracking-normal ml-1">— visible to patients</span>
                  </label>
                  <textarea value={account.bio} onChange={e => updateAccount({ bio: e.target.value })} rows={4} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text resize-none focus:outline-none focus:border-brand transition-colors" />
                </div>

                {[
                  { label: 'Registration number', value: THERAPIST.registrationNumber },
                  { label: 'Practice email',      value: THERAPIST.practiceEmail },
                ].map(row => (
                  <div key={row.label}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">
                      {row.label} <span className="normal-case font-normal tracking-normal text-text-muted">(read-only)</span>
                    </label>
                    <div className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-secondary">{row.value}</div>
                  </div>
                ))}

                <button onClick={handleSave} className={`self-start px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${saved ? 'bg-brand-muted text-brand' : 'bg-brand text-white hover:bg-brand-light'}`}>
                  {saved ? 'Saved' : 'Save profile'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountView
