import { useStore } from '../store/useStore'
import Stepper from '../components/ui/Stepper'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const SESSION_TYPES = ['Video', 'Phone', 'In-person'] as const

const AvailabilityView = () => {
  const { availability, updateAvailability } = useStore()

  const toggleDay = (day: string) => {
    updateAvailability({ workingDays: { ...availability.workingDays, [day]: !availability.workingDays[day] } })
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="px-8 py-8 page-enter">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Availability</p>
          <h1 className="font-display font-light italic tracking-tighter text-text" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)' }}>
            Session defaults
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Session settings */}
            <section className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4 shadow-card">
              <p className="text-sm font-semibold text-text">Session settings</p>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm text-text">Session duration</p>
                  <p className="text-xs text-text-muted mt-0.5">Min 25 min, max 120 min</p>
                </div>
                <Stepper value={availability.sessionDuration} min={25} max={120} step={5} unit="min" label="session duration" onChange={(v) => updateAvailability({ sessionDuration: v })} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm text-text">Buffer between sessions</p>
                  <p className="text-xs text-text-muted mt-0.5">Min 0, max 60 min</p>
                </div>
                <Stepper value={availability.bufferMinutes} min={0} max={60} step={5} unit="min" label="buffer" onChange={(v) => updateAvailability({ bufferMinutes: v })} />
              </div>

              <div className="flex items-start justify-between py-3">
                <div>
                  <p className="text-sm text-text">Default session type</p>
                  <p className="text-xs text-text-muted mt-0.5">Applied to new bookings</p>
                </div>
                <div className="flex gap-2">
                  {SESSION_TYPES.map(type => (
                    <button key={type} onClick={() => updateAvailability({ sessionType: type })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${availability.sessionType === type ? 'bg-brand text-white' : 'border border-border bg-surface text-text-secondary hover:bg-surface-2'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Booking window */}
            <section className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4 shadow-card">
              <p className="text-sm font-semibold text-text">Booking window</p>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm text-text">Minimum notice</p>
                  <p className="text-xs text-text-muted mt-0.5">Before appointment</p>
                </div>
                <Stepper value={availability.minNoticeHours} min={1} max={72} step={1} unit="hours" label="minimum notice" onChange={(v) => updateAvailability({ minNoticeHours: v })} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-text">Book up to</p>
                  <p className="text-xs text-text-muted mt-0.5">How far ahead patients can book</p>
                </div>
                <Stepper value={availability.bookAheadWeeks} min={1} max={26} step={1} unit="weeks ahead" label="book-ahead window" onChange={(v) => updateAvailability({ bookAheadWeeks: v })} />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Working days & hours */}
            <section className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-5 shadow-card">
              <p className="text-sm font-semibold text-text">Working days & hours</p>

              <div>
                <p className="text-xs text-text-muted mb-3">Working days</p>
                <div className="flex gap-2">
                  {DAYS.map(day => (
                    <button key={day} onClick={() => toggleDay(day)} aria-pressed={availability.workingDays[day]} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${availability.workingDays[day] ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted hover:bg-border'}`}>
                      {day.slice(0, 1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-text-muted mb-3">Working hours</p>
                <div className="flex items-center gap-3">
                  <input type="time" value={availability.startTime} onChange={e => updateAvailability({ startTime: e.target.value })} className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
                  <span className="text-text-muted text-sm shrink-0">to</span>
                  <input type="time" value={availability.endTime} onChange={e => updateAvailability({ endTime: e.target.value })} className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:border-brand transition-colors" />
                </div>
              </div>

              <div className="pt-2">
                <div className="rounded-xl bg-surface-2 p-4">
                  <p className="text-xs font-semibold text-text-secondary mb-2">Availability summary</p>
                  <p className="text-sm text-text">
                    {DAYS.filter(d => availability.workingDays[d]).join(', ')}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {availability.startTime} – {availability.endTime} · {availability.sessionDuration} min sessions · {availability.bufferMinutes} min buffer
                  </p>
                </div>
              </div>
            </section>

            <button className="self-start px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors shadow-brand">
              Save availability
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityView
