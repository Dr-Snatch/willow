import { useStore } from '../store/useStore'
import Toggle from '../components/ui/Toggle'

const NotificationsView = () => {
  const { notifications, updateNotification, engagementDefaults, updateEngagementDefault } = useStore()

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="px-8 py-8 page-enter">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Notifications</p>
          <h1 className="font-display font-light italic tracking-tighter text-text" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)' }}>
            Alerts & preferences
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Patient alerts */}
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Patient alerts</p>
              </div>
              <div className="px-6 divide-y divide-border">
                <Toggle checked={notifications.crisisFlags} onChange={() => {}} disabled label="Crisis flags" sublabel="Immediate alert when a patient triggers crisis detection" disabledNote="Cannot be disabled — required for patient safety" />
                <Toggle checked={notifications.episodeSignals} onChange={(v) => updateNotification('episodeSignals', v)} label="Mood episode signals" sublabel="When AI detects a significant mood dip or elevated pattern" />
                <Toggle checked={notifications.urgentPatterns} onChange={(v) => updateNotification('urgentPatterns', v)} label="Urgent pattern flags" sublabel="Severe mood dip, low PHQ-9 equivalent score" />
                <Toggle checked={notifications.weeklyDigest} onChange={(v) => updateNotification('weeklyDigest', v)} label="Weekly summary digest" sublabel="Monday morning overview per patient" />
                <Toggle checked={notifications.weekCompletions} onChange={(v) => updateNotification('weekCompletions', v)} label="Patient week completions" sublabel="When a patient unlocks a Willow gift reward" />
              </div>
            </section>

            {/* Session */}
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Session</p>
              </div>
              <div className="px-6 divide-y divide-border">
                <Toggle checked={notifications.sessionReminders} onChange={(v) => updateNotification('sessionReminders', v)} label="Session reminders" sublabel="24 hours before each scheduled session" />
                <Toggle checked={notifications.preBriefReady} onChange={(v) => updateNotification('preBriefReady', v)} label="Pre-session brief ready" sublabel="When AI summary is prepared for the next session" />
              </div>
            </section>

            {/* Quiet hours */}
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Quiet hours</p>
              </div>
              <div className="px-6 divide-y divide-border">
                <Toggle checked={notifications.quietEnabled} onChange={(v) => updateNotification('quietEnabled', v)} label="Do not disturb" sublabel="Silence non-crisis notifications during quiet window" />
                {notifications.quietEnabled && (
                  <div className="flex items-center justify-between py-3.5">
                    <p className="text-sm text-text-secondary">Quiet window</p>
                    <div className="flex items-center gap-3">
                      <input type="time" value={notifications.quietStart} onChange={e => updateNotification('quietStart', e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
                      <span className="text-text-muted text-sm">to</span>
                      <input type="time" value={notifications.quietEnd} onChange={e => updateNotification('quietEnd', e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
                    </div>
                  </div>
                )}
                <div className="py-3">
                  <p className="text-xs text-text-muted">Crisis alerts always come through, even during quiet hours.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Engagement defaults */}
            <section className="rounded-2xl border border-border bg-surface shadow-card">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">Engagement defaults</p>
                <p className="text-xs text-text-muted mt-0.5">Apply to all new patients — override per-patient from Patients section</p>
              </div>
              <div className="px-6 divide-y divide-border">
                <Toggle checked={engagementDefaults.companionEnabled} onChange={(v) => updateEngagementDefault('companionEnabled', v)} label="Willow companion" />
                <Toggle checked={engagementDefaults.giftsEnabled} onChange={(v) => updateEngagementDefault('giftsEnabled', v)} label="Weekly gift rewards" />
                <Toggle checked={engagementDefaults.streakEnabled} onChange={(v) => updateEngagementDefault('streakEnabled', v)} label="Streak display" sublabel="Avoid for patients with anxiety, perfectionism, or OCD" />
                <Toggle checked={engagementDefaults.growthPhraseEnabled} onChange={(v) => updateEngagementDefault('growthPhraseEnabled', v)} label="Growth philosophy phrase" />
              </div>

              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-faint border border-brand/15 px-4 py-3.5">
                  <p className="text-xs font-semibold text-brand mb-2">Enable when patient is…</p>
                  <ul className="text-xs text-text-secondary space-y-1 leading-snug">
                    <li>· Stable or in maintenance phase</li>
                    <li>· Responds well to encouragement</li>
                    <li>· Can handle a missed week</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-surface-2 border border-border px-4 py-3.5">
                  <p className="text-xs font-semibold text-text-secondary mb-2">Keep off when patient has…</p>
                  <ul className="text-xs text-text-muted space-y-1 leading-snug">
                    <li>· Perfectionism or OCD</li>
                    <li>· Active crisis or episode</li>
                    <li>· Eating disorder history</li>
                    <li>· Anxiety around performance</li>
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-5">
                <button className="px-5 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors">Save defaults</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsView
