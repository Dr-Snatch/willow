import { useState } from 'react';
import { useCrisisStore } from '../store/crisis';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, Bell, CheckCircle2 } from 'lucide-react';
import WillowLogo from '../components/WillowLogo';

const resources = [
  {
    label: 'Samaritans',
    sublabel: '116 123 — UK, free, 24/7',
    icon: Phone,
    href: 'tel:116123',
    accent: '#2E7D5A',
  },
  {
    label: 'Shout',
    sublabel: 'Text SHOUT to 85258 — UK, free, 24/7',
    icon: MessageSquare,
    href: 'sms:85258&body=SHOUT',
    accent: '#2E7D5A',
  },
  {
    label: '988 Suicide & Crisis Lifeline',
    sublabel: 'Call or text 988 — US, 24/7',
    icon: Phone,
    href: 'tel:988',
    accent: '#57534E',
  },
  {
    label: 'Crisis Text Line',
    sublabel: 'Text HOME to 741741 — US, 24/7',
    icon: MessageSquare,
    href: 'sms:741741&body=HOME',
    accent: '#57534E',
  },
];

const CrisisView = () => {
  const { setNotCrisis } = useCrisisStore();
  const navigate = useNavigate();
  const [safeChecked, setSafeChecked] = useState(false);
  const [therapistNotified, setTherapistNotified] = useState(false);

  const handleReturn = () => {
    if (!safeChecked) return;
    setNotCrisis();
    navigate('/chat');
  };

  return (
    <main className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-12 flex flex-col gap-7">

        {/* Header */}
        <div className="flex flex-col gap-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/20 bg-brand-muted" aria-hidden="true">
            <WillowLogo className="h-5 w-5 text-brand" strokeWidth={1.75} />
          </div>
          <div>
            <h1
              className="font-display font-light italic tracking-tighter text-text leading-[1.04]"
              style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3rem)' }}
            >
              You're not alone.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Whatever is happening right now, support is available.
              These services are free, confidential, and available any time.
            </p>
          </div>
        </div>

        {/* Crisis resources */}
        <ul role="list" aria-label="Crisis support resources" className="flex flex-col gap-2 list-none p-0">
          {resources.map(({ label, sublabel, icon: Icon, href, accent }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={`${label} — ${sublabel}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-all duration-300 ease-expo hover:border-border-strong"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300"
                  style={{ borderColor: `${accent}25`, backgroundColor: `${accent}10` }}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4 transition-colors" strokeWidth={1.75} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-tight text-text">{label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{sublabel}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted transition-colors duration-300 group-hover:text-brand" aria-hidden="true">
                  Contact
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Emergency services */}
        <div className="rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            In immediate danger, call emergency services —
            <strong className="font-semibold text-text"> 999</strong> (UK) or
            <strong className="font-semibold text-text"> 911</strong> (US).
          </p>
        </div>

        {/* Notify therapist */}
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand-muted mt-0.5" aria-hidden="true">
              {therapistNotified
                ? <CheckCircle2 className="h-4 w-4 text-brand" strokeWidth={1.75} />
                : <Bell className="h-4 w-4 text-brand" strokeWidth={1.75} />
              }
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold tracking-tight text-text">
                {therapistNotified ? 'Therapist alerted' : 'Notify your therapist'}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary leading-relaxed" aria-live="polite">
                {therapistNotified
                  ? 'A note has been added to your profile. Share your handoff document with your therapist from the Profile tab.'
                  : 'Flag this moment so your therapist can follow up with you.'}
              </p>
            </div>
          </div>
          {!therapistNotified && (
            <button
              onClick={() => setTherapistNotified(true)}
              aria-label="Send alert to my therapist"
              className="w-full rounded-xl border border-brand/25 bg-brand-muted py-2.5 text-sm font-semibold text-brand transition-all duration-300 ease-expo hover:bg-brand/10"
            >
              Alert my therapist
            </button>
          )}
        </div>

        {/* Safe confirmation */}
        <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-300 hover:border-border-strong">
          <input
            id="safe-check"
            type="checkbox"
            checked={safeChecked}
            onChange={(e) => setSafeChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand cursor-pointer"
          />
          <span className="text-sm leading-relaxed text-text-secondary">
            I am safe right now.
          </span>
        </label>

        {/* Return */}
        <button
          onClick={handleReturn}
          disabled={!safeChecked}
          aria-disabled={!safeChecked}
          className="btn-dark w-full rounded-xl border border-text/20 bg-text py-3.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Return to Willow
        </button>

      </div>
    </main>
  );
};

export default CrisisView;
