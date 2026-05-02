import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUser';
import WillowLogo from '../components/WillowLogo';

const OnboardingView = () => {
  const [name, setName] = useState('');
  const [consented, setConsented] = useState(false);
  const { completeOnboarding } = useUserStore();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!consented) return;
    completeOnboarding(name.trim());
    navigate('/check-in');
  };

  return (
    <div className="flex h-screen w-full">

      {/* ── Left: editorial panel ────────────────────── */}
      <div
        className="hidden lg:flex w-[44%] shrink-0 flex-col justify-between overflow-hidden border-r border-border/30 p-14"
        style={{ backgroundColor: '#0F1A14' }}
      >
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(46,125,90,0.18) 0%, transparent 50%)' }}
        />

        {/* Top: wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/20 border border-brand/20">
            <WillowLogo className="h-4 w-4 text-brand" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'rgba(212,198,185,0.5)' }}>
            Willow
          </span>
        </div>

        {/* Bottom: display copy */}
        <div className="relative z-10">
          <h1
            className="font-display font-light italic leading-[1.04] tracking-tighter"
            style={{ fontSize: 'clamp(2.6rem, 3.5vw, 3.8rem)', color: '#D4C6B9' }}
          >
            A quiet space<br />to think things<br />through.
          </h1>
          <p
            className="mt-8 text-sm leading-relaxed"
            style={{ color: 'rgba(212,198,185,0.28)', maxWidth: '28ch' }}
          >
            Not a therapist. A thoughtful companion for people already doing the real work.
          </p>
        </div>
      </div>

      {/* ── Right: form panel ───────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-8 page-enter">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand shadow-brand breathe">
            <WillowLogo className="h-6 w-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-2xl italic font-light tracking-tighter text-text">
            Willow
          </span>
        </div>

        <div className="w-full max-w-[360px] flex flex-col gap-6">

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text">Get started</h2>
            <p className="mt-1 text-sm text-text-secondary">Takes about 30 seconds.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-text">
              What should I call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && consented && handleStart()}
              placeholder="Your name or a nickname"
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted transition-all duration-300 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
            <p className="text-xs text-text-muted">You can skip this — it's just for the greeting.</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-4 transition-colors duration-300 hover:border-border-strong">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand cursor-pointer"
            />
            <span className="text-xs leading-relaxed text-text-secondary">
              I understand that Willow is an AI companion — not a therapist. My journal content
              will be processed by AI (Anthropic Claude). If a crisis is detected, emergency
              resources will be shown. Structured insights may be shared with my linked therapist
              in a future version.
            </span>
          </label>

          <button
            onClick={handleStart}
            disabled={!consented}
            className="btn-dark w-full rounded-xl border border-text/20 bg-text px-5 py-3.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Get started
          </button>

        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
