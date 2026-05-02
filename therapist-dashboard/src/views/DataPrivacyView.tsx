import { ShieldCheck, ExternalLink, Info } from 'lucide-react'

const DataPrivacyView = () => {
  const complianceRows = [
    { label: 'Jurisdiction',      value: 'UK GDPR · NHS DSPT' },
    { label: 'Encryption',        value: 'AES-256 at rest · TLS 1.3' },
    { label: 'Data residency',    value: 'EU / UK servers only' },
    { label: 'Retention policy',  value: '7 years (UK clinical default)' },
  ]

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="px-8 py-8 page-enter">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Data & Privacy</p>
          <h1 className="font-display font-light italic tracking-tighter text-text" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)' }}>
            Compliance & data handling
          </h1>
        </div>

        {/* Warning banner — full width */}
        <div className="rounded-2xl border border-[#CA9B0E]/25 bg-[#CA9B0E]/5 px-5 py-4 flex gap-3 mb-6">
          <ShieldCheck className="h-5 w-5 text-mood-3 mt-0.5 shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-1">You are the data controller for your patients</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              All patient data is encrypted with AES-256 at rest and TLS 1.3 in transit. As the treating therapist, you are a GDPR data controller. Willow acts as the data processor under Article 28. Per-patient data is managed from <span className="font-medium text-text">Patients → [patient] → Data access</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Practice compliance */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Practice compliance</p>
              </div>
              {complianceRows.map((row, i) => (
                <div key={row.label} className={`flex items-center justify-between px-6 py-3.5 ${i < complianceRows.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className="text-sm font-medium text-text">{row.value}</span>
                </div>
              ))}
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Documents */}
            <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Documents</p>
              </div>
              <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-2 transition-colors border-b border-border group">
                <div className="text-left">
                  <p className="text-sm font-medium text-text">Data Processing Agreement</p>
                  <p className="text-xs text-text-muted mt-0.5">GDPR Art. 28 · Willow as processor</p>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" strokeWidth={1.75} />
              </button>
              <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-2 transition-colors group">
                <div className="text-left">
                  <p className="text-sm font-medium text-text">Audit log</p>
                  <p className="text-xs text-text-muted mt-0.5">All data access events, exports, and consent changes</p>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" strokeWidth={1.75} />
              </button>
            </section>

            {/* Per-patient note */}
            <div className="rounded-xl border border-border bg-surface-2 px-5 py-4 flex gap-3">
              <Info className="h-4 w-4 text-text-muted mt-0.5 shrink-0" strokeWidth={2} />
              <p className="text-sm text-text-secondary leading-relaxed">
                Individual patient data access, consent records, and export are managed from{' '}
                <span className="font-medium text-text">Patients → [patient name] → Data access</span> and{' '}
                <span className="font-medium text-text">Export records</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataPrivacyView
