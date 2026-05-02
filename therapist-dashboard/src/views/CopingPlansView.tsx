import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PATIENTS } from '../data/mock'

const CopingPlansView = () => {
  const { templates, selectedTemplateId, selectTemplate, updateTemplate, createTemplate } = useStore()
  const [showPatientPicker, setShowPatientPicker] = useState(false)

  const selected = templates.find(t => t.id === selectedTemplateId)

  return (
    <div className="flex h-full bg-background page-enter">
      {/* Left: template list */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-surface/60 h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Templates</p>
          <button
            onClick={createTemplate}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand bg-brand-faint hover:bg-brand-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Create
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {templates.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => selectTemplate(tmpl.id)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                selectedTemplateId === tmpl.id ? 'bg-brand-faint' : 'hover:bg-surface-2'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-text truncate">{tmpl.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    tmpl.status === 'Active' ? 'bg-brand-muted text-brand' : 'bg-surface-2 text-text-muted'
                  }`}>
                    {tmpl.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Users className="h-3 w-3" strokeWidth={1.75} />
                  <span>{tmpl.appliedToCount} patient{tmpl.appliedToCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: editor */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="max-w-2xl mx-auto px-8 py-8 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                Template editor
              </p>
              <input
                value={selected.name}
                onChange={e => updateTemplate(selected.id, { name: e.target.value })}
                className="text-xl font-semibold text-text bg-transparent border-none outline-none w-full focus:ring-0 placeholder:text-text-muted"
                placeholder="Template name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                Trigger text
              </label>
              <textarea
                value={selected.trigger}
                onChange={e => updateTemplate(selected.id, { trigger: e.target.value })}
                rows={3}
                placeholder="Describe the thought pattern or situation…"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                AI response
              </label>
              <textarea
                value={selected.response}
                onChange={e => updateTemplate(selected.id, { response: e.target.value })}
                rows={5}
                placeholder="The response Willow will surface when this trigger is detected…"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text">Status</span>
              <button
                onClick={() => updateTemplate(selected.id, { status: selected.status === 'Active' ? 'Draft' : 'Active' })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selected.status === 'Active'
                    ? 'bg-brand-muted text-brand'
                    : 'bg-surface-2 text-text-muted hover:bg-surface border border-border'
                }`}
              >
                {selected.status}
              </button>
            </div>

            {/* Apply to patient */}
            <div className="relative">
              <button
                onClick={() => setShowPatientPicker(!showPatientPicker)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand/30 bg-brand-faint text-sm font-medium text-brand hover:bg-brand-muted transition-colors"
              >
                <Users className="h-4 w-4" strokeWidth={1.75} />
                Apply to patient
              </button>
              {showPatientPicker && (
                <div className="absolute top-full mt-2 left-0 z-10 w-56 rounded-2xl border border-border bg-surface shadow-elevated scale-enter">
                  {PATIENTS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setShowPatientPicker(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <div className="h-7 w-7 rounded-full bg-brand-muted flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-brand">{p.initials}</span>
                      </div>
                      <span className="text-sm text-text">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button className="px-5 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors">
                Save template
              </button>
              <button
                onClick={() => {
                  if (templates.length > 1) {
                    const remaining = templates.filter(t => t.id !== selected.id)
                    selectTemplate(remaining[0]?.id ?? null)
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-muted hover:border-mood-1/30 hover:text-mood-1 hover:bg-mood-1/5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-muted">Select a template or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CopingPlansView
