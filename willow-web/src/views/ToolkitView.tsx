import { useId, useState } from 'react';
import { ChevronDown, Wind, ScanEye, Droplets, Brain, Sunset, Footprints, LucideIcon } from 'lucide-react';

interface Strategy {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  steps: string[];
  tag: string;
  accent: string;
}

const STRATEGIES: Strategy[] = [
  {
    id: '1', icon: Wind, title: 'Box Breathing', tag: 'Breathing', accent: '#2E7D5A',
    summary: 'Slow the nervous system in under a minute.',
    steps: [
      'Find a comfortable position and close your eyes.',
      'Breathe in slowly for 4 counts.',
      'Hold for 4 counts.',
      'Breathe out for 4 counts.',
      'Hold for 4 counts.',
      'Repeat 4 times, or as long as feels helpful.',
    ],
  },
  {
    id: '2', icon: ScanEye, title: '5-4-3-2-1 Grounding', tag: 'Grounding', accent: '#3D8C6E',
    summary: 'Return to the present moment through your senses.',
    steps: [
      'Name 5 things you can see.',
      'Name 4 things you can hear.',
      'Name 3 things you can physically feel.',
      'Name 2 things you can smell.',
      'Name 1 thing you can taste.',
    ],
  },
  {
    id: '3', icon: Brain, title: 'Thought Record', tag: 'Thought work', accent: '#6B58B8',
    summary: 'Create a little distance from difficult thoughts.',
    steps: [
      'When a difficult thought arrives, notice it without trying to push it away.',
      "Try saying: \"I notice I'm having the thought that…\"",
      "You don't have to believe every thought. Thoughts are just thoughts.",
      'Let it pass like a cloud moving across the sky.',
    ],
  },
  {
    id: '4', icon: Droplets, title: 'Cold Water Reset', tag: 'Physical', accent: '#2E7DA0',
    summary: "Activate your body's calming reflex.",
    steps: [
      'Fill a bowl with cold water, or run the cold tap.',
      'Submerge your face, or hold your wrists under cold water for 30 seconds.',
      'This activates the dive reflex — your heart rate slows.',
      'Take a slow breath and notice how you feel.',
    ],
  },
  {
    id: '5', icon: Sunset, title: 'Safe Place Visualisation', tag: 'Grounding', accent: '#3D8C6E',
    summary: 'Build an inner refuge you can return to.',
    steps: [
      'Close your eyes and take a few slow breaths.',
      'Imagine a place where you feel completely safe and calm.',
      'It can be real or imagined — a forest, a beach, a room you love.',
      'Notice the colours, sounds, and temperature.',
      'Spend a few minutes there.',
    ],
  },
  {
    id: '6', icon: Footprints, title: 'Movement Break', tag: 'Physical', accent: '#2E7DA0',
    summary: 'Shift your state by moving your body.',
    steps: [
      'Stand up and shake out your hands and arms.',
      'Take a short walk — even to another room or outside for 5 minutes.',
      'Notice what you see and hear as you move.',
      'Return when you feel a little lighter.',
    ],
  },
];

const StrategyCard = ({ strategy }: { strategy: Strategy }) => {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const Icon = strategy.icon;

  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ease-expo ${
      open ? 'border-border-strong bg-surface-2' : 'border-border bg-surface'
    }`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300"
          style={{
            borderColor: `${strategy.accent}25`,
            backgroundColor: `${strategy.accent}10`,
          }}
          aria-hidden="true"
        >
          <Icon
            className="h-4 w-4"
            strokeWidth={1.75}
            style={{ color: strategy.accent, opacity: open ? 1 : 0.75 }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-sm font-semibold tracking-tight text-text">{strategy.title}</p>
            <span
              className="rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
              style={{
                borderColor: `${strategy.accent}28`,
                color: strategy.accent,
                backgroundColor: `${strategy.accent}08`,
              }}
            >
              {strategy.tag}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{strategy.summary}</p>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-300 ease-expo ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={contentId} className="border-t border-border/60 px-5 py-5 slide-down">
          <ol className="flex flex-col gap-4">
            {strategy.steps.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: `${strategy.accent}15`, color: strategy.accent }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-text-secondary">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

const ToolkitView = () => (
  <main className="flex h-full w-full overflow-y-auto bg-background page-enter">
    <div className="mx-auto w-full max-w-lg px-6 py-10 flex flex-col gap-8">

      <div>
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
          Resources
        </p>
        <h1
          className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
          style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}
        >
          Your toolkit.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Evidence-based strategies for difficult moments.
        </p>
      </div>

      <div className="flex flex-col gap-2" role="list" aria-label="Coping strategies">
        {STRATEGIES.map((s) => (
          <div key={s.id} role="listitem">
            <StrategyCard strategy={s} />
          </div>
        ))}
      </div>

      <p className="pb-4 text-xs text-text-muted leading-relaxed">
        These strategies draw on evidence-based approaches including CBT and DBT.
        They are not a substitute for professional support.
      </p>

    </div>
  </main>
);

export default ToolkitView;
