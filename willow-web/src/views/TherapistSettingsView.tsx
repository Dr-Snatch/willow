import { useState } from 'react';
import {
  ChevronRight, ChevronLeft, User, Calendar, FileText, Users, Leaf,
  Bell, Lock, Shield, Settings, Check, X, AlertTriangle, Zap,
  MessageSquare, BarChart2, Activity, Pill, Download, Plus, Minus,
  RefreshCw, Copy, LogOut,
} from 'lucide-react';
import {
  useTherapistStore, PatientStatus, CopingTemplate,
} from '../store/useTherapist';

// ── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'root'
  | 'profile'
  | 'patients'
  | 'patient-detail'
  | 'patient-engagement'
  | 'patient-coping'
  | 'patient-clinical'
  | 'patient-data'
  | 'patient-export'
  | 'engagement-defaults'
  | 'templates'
  | 'availability'
  | 'notifications'
  | 'data-privacy'
  | 'security'
  | 'account';

// ── Small shared components ──────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
    {children}
  </p>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-border bg-surface overflow-hidden ${className}`}>
    {children}
  </div>
);

const Row = ({
  children, onClick, last = false, className = '',
}: {
  children: React.ReactNode; onClick?: () => void; last?: boolean; className?: string;
}) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    className={`flex items-center gap-3 px-5 py-3.5 ${!last ? 'border-b border-border' : ''} ${onClick ? 'cursor-pointer hover:bg-surface-2 transition-colors duration-200' : ''} ${className}`}
  >
    {children}
  </div>
);

const Toggle = ({
  checked, onChange, disabled = false, id,
}: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; id?: string;
}) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-300 ${
      checked ? 'bg-brand' : 'bg-surface-2 border border-border'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
        checked ? 'translate-x-[19px]' : 'translate-x-[3px]'
      }`}
    />
  </button>
);

const ToggleRow = ({
  label, sublabel, checked, onChange, disabled = false, last = false, warning = '',
}: {
  label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void;
  disabled?: boolean; last?: boolean; warning?: string;
}) => {
  const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <Row last={last} className="cursor-default">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-text cursor-pointer">{label}</label>
        {sublabel && !warning && <p className="text-xs text-text-secondary mt-0.5">{sublabel}</p>}
        {warning && <p className="text-xs text-amber-600 mt-0.5">{warning}</p>}
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
    </Row>
  );
};

const StatusDot = ({ status }: { status: PatientStatus }) => {
  const colors: Record<PatientStatus, string> = {
    crisis: 'bg-red-500',
    elevated: 'bg-purple-400',
    stable: 'bg-brand',
    'low-engagement': 'bg-amber-400',
    new: 'bg-sky-400',
  };
  return <span className={`h-2 w-2 shrink-0 rounded-full ${colors[status]}`} aria-hidden="true" />;
};

const PatientAvatar = ({ initials, status }: { initials: string; status: PatientStatus }) => {
  const colors: Record<PatientStatus, string> = {
    crisis: 'bg-red-100 text-red-700',
    elevated: 'bg-purple-100 text-purple-700',
    stable: 'bg-brand-muted text-brand',
    'low-engagement': 'bg-amber-100 text-amber-700',
    new: 'bg-sky-100 text-sky-700',
  };
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colors[status]}`}>
      {initials}
    </div>
  );
};

const BackButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Back to ${label}`}
    className="flex items-center gap-1 text-sm text-brand hover:text-brand/80 transition-colors duration-200"
  >
    <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
    {label}
  </button>
);

const InfoBanner = ({
  children, variant = 'warning',
}: {
  children: React.ReactNode; variant?: 'warning' | 'danger' | 'info' | 'purple';
}) => {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-surface border-border text-text-secondary',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3.5 text-sm leading-relaxed mb-4 ${styles[variant]}`}>
      {children}
    </div>
  );
};

const PageHeader = ({
  title, subtitle, back,
}: {
  title: string; subtitle?: string; back?: { label: string; onClick: () => void };
}) => (
  <div className="mb-6">
    {back && <div className="mb-3"><BackButton label={back.label} onClick={back.onClick} /></div>}
    <h2
      className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
      style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)' }}
    >
      {title}
    </h2>
    {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
  </div>
);

// ── Stepper (for duration / buffer / auto-lock) ──────────────────────────────

const Stepper = ({
  value, onDecrement, onIncrement, format,
}: {
  value: number; onDecrement: () => void; onIncrement: () => void; format: (v: number) => string;
}) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={onDecrement}
      aria-label="Decrease"
      className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
    >
      <Minus className="h-3 w-3" strokeWidth={2} />
    </button>
    <span className="min-w-[56px] text-center text-sm font-semibold text-text">{format(value)}</span>
    <button
      type="button"
      onClick={onIncrement}
      aria-label="Increase"
      className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
    >
      <Plus className="h-3 w-3" strokeWidth={2} />
    </button>
  </div>
);

// ── Screen: Root ─────────────────────────────────────────────────────────────

const RootScreen = ({ navigate }: { navigate: (s: Screen) => void }) => {
  const { profile, patients } = useTherapistStore();
  const activePx = patients.filter((p) => p.status !== 'new').length;

  return (
    <>
      {/* Therapist strip */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-brand/5 px-5 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white text-base font-semibold">
          {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-text">{profile.name}</p>
          <p className="text-xs text-text-secondary">{profile.title} · {activePx} patients</p>
        </div>
      </div>

      <SectionLabel>Practice</SectionLabel>
      <Card className="mb-5">
        <Row onClick={() => navigate('profile')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><User className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">My profile</p><p className="text-xs text-text-secondary">Name, bio, credentials, specialisation</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row onClick={() => navigate('availability')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Calendar className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Availability & sessions</p><p className="text-xs text-text-secondary">Hours, duration, session type</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row last onClick={() => navigate('templates')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><FileText className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Coping plan templates</p><p className="text-xs text-text-secondary">Reusable trigger–strategy pairs</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <SectionLabel>Patients</SectionLabel>
      <Card className="mb-5">
        <Row onClick={() => navigate('patients')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Users className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Patient management</p><p className="text-xs text-text-secondary">Invite, settings, data, export per patient</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row last onClick={() => navigate('engagement-defaults')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Leaf className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Engagement defaults</p><p className="text-xs text-text-secondary">Willow settings applied to new patients</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <SectionLabel>System</SectionLabel>
      <Card>
        <Row onClick={() => navigate('notifications')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Bell className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Notifications</p><p className="text-xs text-text-secondary">Alerts, flags, quiet hours</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row onClick={() => navigate('data-privacy')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Lock className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Data & privacy</p><p className="text-xs text-text-secondary">GDPR, compliance, practice-level settings</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row onClick={() => navigate('security')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Shield className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Security</p><p className="text-xs text-text-secondary">Password, 2FA, auto-lock</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row last onClick={() => navigate('account')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Settings className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Account & subscription</p><p className="text-xs text-text-secondary">Plan, billing, support, sign out</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <p className="mt-4 text-center text-[10px] text-text-muted">Willow Clinical v1.0</p>
    </>
  );
};

// ── Screen: Profile ──────────────────────────────────────────────────────────

const ProfileScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, updateProfile } = useTherapistStore();
  const [local, setLocal] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateProfile(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHeader title="My profile." subtitle="Visible to your patients" back={{ label: 'Settings', onClick: onBack }} />

      {/* Avatar placeholder */}
      <div className="mb-5 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white text-xl font-semibold">
          {local.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </div>
        <button type="button" className="rounded-xl border border-border px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors duration-200">
          Change photo
        </button>
      </div>

      <Card className="mb-4 px-5 py-4 flex flex-col gap-4">
        {[
          { label: 'Full name', field: 'name' as const, type: 'text' },
          { label: 'Title', field: 'title' as const, type: 'text' },
          { label: 'Specialisation', field: 'specialisation' as const, type: 'text' },
        ].map(({ label, field, type }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label htmlFor={`profile-${field}`} className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</label>
            <input
              id={`profile-${field}`}
              type={type}
              value={local[field]}
              onChange={(e) => setLocal((v) => ({ ...v, [field]: e.target.value }))}
              className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-bio" className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Bio (patients see this)</label>
          <textarea
            id="profile-bio"
            rows={3}
            value={local.bio}
            onChange={(e) => setLocal((v) => ({ ...v, bio: e.target.value }))}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
          />
        </div>
      </Card>

      <Card className="mb-5">
        <Row className="cursor-default">
          <span className="flex-1 text-xs text-text-secondary">Registration</span>
          <span className="text-xs font-medium text-text">{profile.registration}</span>
        </Row>
        <Row last className="cursor-default">
          <span className="flex-1 text-xs text-text-secondary">Practice email</span>
          <span className="text-xs font-medium text-text">{profile.practiceEmail}</span>
        </Row>
      </Card>

      <button
        type="button"
        onClick={save}
        className="btn-dark flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
      >
        {saved && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {saved ? 'Saved' : 'Save profile'}
      </button>
    </>
  );
};

// ── Screen: Patients List ────────────────────────────────────────────────────

const PatientsScreen = ({
  onBack, onSelect,
}: {
  onBack: () => void; onSelect: (id: string) => void;
}) => {
  const { patients } = useTherapistStore();
  const [search, setSearch] = useState('');

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Patients." subtitle="Tap a patient to manage their settings" back={{ label: 'Settings', onClick: onBack }} />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
        <Users className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.75} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search patients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search patients"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
        />
      </div>

      <SectionLabel>Active — tap any patient to manage</SectionLabel>
      <Card className="mb-5">
        {filtered.map((p, i) => (
          <Row key={p.id} onClick={() => onSelect(p.id)} last={i === filtered.length - 1}>
            <PatientAvatar initials={p.initials} status={p.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{p.name}</p>
              <p className="text-xs text-text-secondary">{p.statusNote}</p>
            </div>
            {p.status === 'new' ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700">New</span>
            ) : (
              <StatusDot status={p.status} />
            )}
          </Row>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-4 text-sm text-text-secondary">No patients match your search.</div>
        )}
      </Card>

      <button
        type="button"
        className="btn-dark mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Invite new patient
      </button>

      <Card>
        <Row last>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-2"><Download className="h-4 w-4 text-text-muted" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Archived patients</p><p className="text-xs text-text-secondary">1 patient · records retained 7 yrs</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>
    </>
  );
};

// ── Screen: Patient Detail ───────────────────────────────────────────────────

const PatientDetailScreen = ({
  patientId, onBack, navigate,
}: {
  patientId: string; onBack: () => void; navigate: (s: Screen) => void;
}) => {
  const { patients } = useTherapistStore();
  const patient = patients.find((p) => p.id === patientId)!;
  if (!patient) return null;

  const statusColors: Record<PatientStatus, string> = {
    crisis: 'border-red-200 bg-red-50 text-red-700',
    elevated: 'border-purple-200 bg-purple-50 text-purple-700',
    stable: 'border-brand/20 bg-brand-muted text-brand',
    'low-engagement': 'border-amber-200 bg-amber-50 text-amber-700',
    new: 'border-sky-200 bg-sky-50 text-sky-700',
  };

  const statusLabels: Record<PatientStatus, string> = {
    crisis: 'Crisis active',
    elevated: 'Elevated',
    stable: 'Stable',
    'low-engagement': 'Low engagement',
    new: 'New',
  };

  return (
    <>
      <PageHeader title={patient.name} subtitle="Per-patient settings & records" back={{ label: 'Patients', onClick: onBack }} />

      {/* Summary strip */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
        <PatientAvatar initials={patient.initials} status={patient.status} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text">{patient.name}</p>
          <p className="text-xs text-text-secondary">{patient.treatment} · Since {patient.connectedSince}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[patient.status]}`}>
          {statusLabels[patient.status]}
        </span>
      </div>

      <SectionLabel>Engagement</SectionLabel>
      <Card className="mb-5">
        <Row last onClick={() => navigate('patient-engagement')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Leaf className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Willow & engagement</p><p className="text-xs text-text-secondary">Companion, streak, growth phrase, reward</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <SectionLabel>Clinical</SectionLabel>
      <Card className="mb-5">
        <Row onClick={() => navigate('patient-coping')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><FileText className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text">Coping plans</p>
            <p className="text-xs text-text-secondary">{patient.copingPlans.filter((c) => c.active).length} active · specific to {patient.name.split(' ')[0]}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row last onClick={() => navigate('patient-clinical')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Activity className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Clinical flags & notes</p><p className="text-xs text-text-secondary">Risk level, episode monitoring, private notes</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <SectionLabel>Data</SectionLabel>
      <Card className="mb-5">
        <Row onClick={() => navigate('patient-data')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Lock className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Data access</p><p className="text-xs text-text-secondary">What {patient.name.split(' ')[0]} shares with you</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row last onClick={() => navigate('patient-export')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Download className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Export records</p><p className="text-xs text-text-secondary">Download {patient.name.split(' ')[0]}'s clinical data</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <SectionLabel>Connection</SectionLabel>
      <Card>
        <Row className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Users className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Connected since</p><p className="text-xs text-text-secondary">{patient.connectedSince}</p></div>
          <span className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-0.5 text-[10px] font-semibold text-brand">Active</span>
        </Row>
        <Row last className="hover:bg-red-50 transition-colors duration-200 cursor-pointer" onClick={() => {}}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50"><X className="h-4 w-4 text-red-500" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-red-600">Remove patient</p><p className="text-xs text-text-secondary">Disconnects link · data retained</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>
    </>
  );
};

// ── Screen: Patient Engagement ───────────────────────────────────────────────

const PatientEngagementScreen = ({
  patientId, onBack,
}: {
  patientId: string; onBack: () => void;
}) => {
  const { patients, updatePatientEngagement } = useTherapistStore();
  const patient = patients.find((p) => p.id === patientId)!;
  if (!patient) return null;

  const [message, setMessage] = useState(patient.engagement.rewardMessage);
  const [saved, setSaved] = useState(false);
  const firstName = patient.name.split(' ')[0];

  const toggle = (key: keyof typeof patient.engagement) => {
    if (key === 'rewardMessage') return;
    updatePatientEngagement(patientId, { [key]: !patient.engagement[key] });
  };

  const saveMessage = () => {
    updatePatientEngagement(patientId, { rewardMessage: message });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHeader title={`Engagement · ${firstName}.`} subtitle="All off by default · you decide what fits" back={{ label: patient.name, onClick: onBack }} />

      <InfoBanner variant="warning">
        Changes apply immediately on {firstName}'s next app open. They are not notified of changes.
      </InfoBanner>

      <SectionLabel>Willow companion</SectionLabel>
      <Card className="mb-5">
        <ToggleRow label="Willow companion" sublabel="Weekly pet growth system" checked={patient.engagement.willowCompanion} onChange={() => toggle('willowCompanion')} />
        <ToggleRow label="Weekly gift rewards" sublabel="Accessories unlocked on completion" checked={patient.engagement.weeklyGifts} onChange={() => toggle('weeklyGifts')} />
        <ToggleRow
          label="Streak display"
          warning={patient.engagement.streakDisplay ? undefined : 'Off — check for anxiety / perfectionism'}
          checked={patient.engagement.streakDisplay}
          onChange={() => toggle('streakDisplay')}
        />
        <ToggleRow
          label="Growth philosophy phrase"
          sublabel={patient.engagement.growthPhrase ? '"Growth is not linear…" across key screens' : undefined}
          checked={patient.engagement.growthPhrase}
          onChange={() => toggle('growthPhrase')}
          last
        />
      </Card>

      <SectionLabel>Reward message this week</SectionLabel>
      <Card className="mb-5 px-5 py-4">
        <p className="mb-3 text-xs leading-relaxed text-text-secondary">
          Optional — {firstName} won't know if you don't write one. Delivered on their next completed week.
        </p>
        <textarea
          rows={3}
          maxLength={120}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Write a personal message for ${firstName} if they complete this week…`}
          aria-label="Weekly reward message"
          className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] text-text-muted">{message.length} / 120</span>
          {saved && <span className="text-[10px] text-brand font-medium">Saved</span>}
        </div>
        <button
          type="button"
          onClick={saveMessage}
          className="mt-3 w-full rounded-xl border border-brand/25 bg-brand-muted py-2.5 text-sm font-semibold text-brand transition-all duration-300 ease-expo hover:bg-brand/10"
        >
          Save message
        </button>
      </Card>

      {patient.episodeSignal && (
        <>
          <SectionLabel>Clinical guidance</SectionLabel>
          <InfoBanner variant="purple">
            <p className="font-semibold mb-1.5">Elevated mood signal active</p>
            <p className="leading-relaxed">Consider pausing Willow engagement features while the mood episode is under review. Reward mechanics may amplify elevated state.</p>
          </InfoBanner>
        </>
      )}
    </>
  );
};

// ── Screen: Patient Coping Plans ─────────────────────────────────────────────

const PatientCopingScreen = ({
  patientId, onBack,
}: {
  patientId: string; onBack: () => void;
}) => {
  const { patients, templates, addCopingPlan, deactivateCopingPlan } = useTherapistStore();
  const patient = patients.find((p) => p.id === patientId)!;
  if (!patient) return null;

  const [customTrigger, setCustomTrigger] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [customName, setCustomName] = useState('');

  const active = patient.copingPlans.filter((c) => c.active);
  const firstName = patient.name.split(' ')[0];

  const addFromTemplate = (t: CopingTemplate) => {
    addCopingPlan(patientId, {
      name: t.name,
      trigger: t.trigger,
      aiResponse: t.aiResponse,
      usageCount: 0,
      active: true,
    });
  };

  const addCustom = () => {
    if (!customName.trim() || !customTrigger.trim() || !customResponse.trim()) return;
    addCopingPlan(patientId, {
      name: customName.trim(),
      trigger: customTrigger.trim(),
      aiResponse: customResponse.trim(),
      usageCount: 0,
      active: true,
    });
    setCustomName('');
    setCustomTrigger('');
    setCustomResponse('');
  };

  return (
    <>
      <PageHeader title={`Coping plans · ${firstName}.`} subtitle="Specific to this patient · surfaced in their AI chat" back={{ label: patient.name, onClick: onBack }} />

      <SectionLabel>Active plans</SectionLabel>
      {active.length === 0 && (
        <div className="mb-4 rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="text-sm text-text-secondary">No active coping plans yet. Add one below.</p>
        </div>
      )}
      {active.map((plan) => (
        <div key={plan.id} className="mb-3 rounded-2xl border border-border bg-surface px-5 py-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text">{plan.name}</p>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
              plan.usageCount > 0 ? 'border-brand/20 bg-brand-muted text-brand' : 'border-border bg-surface-2 text-text-muted'
            }`}>
              {plan.usageCount > 0 ? `Used ${plan.usageCount}×` : 'Unused'}
            </span>
          </div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Trigger</p>
          <p className="mb-3 text-sm text-text-secondary leading-relaxed">{plan.trigger}</p>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">AI response</p>
          <p className="mb-4 text-sm text-text leading-relaxed">{plan.aiResponse}</p>
          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-xl border border-border py-2 text-xs font-semibold text-text-secondary hover:bg-surface-2 transition-colors duration-200">Edit</button>
            <button
              type="button"
              onClick={() => deactivateCopingPlan(patientId, plan.id)}
              className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              Deactivate
            </button>
          </div>
        </div>
      ))}

      <SectionLabel>Add plan for {firstName}</SectionLabel>
      <Card className="mb-4 px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">From templates</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {templates.filter((t) => t.status === 'active').map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => addFromTemplate(t)}
              className="rounded-xl border border-brand/20 bg-brand-muted px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10 transition-colors duration-200"
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="custom-name" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">Plan name</label>
            <input
              id="custom-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Rejection sensitivity"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="custom-trigger" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">Custom trigger</label>
            <textarea
              id="custom-trigger"
              rows={2}
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              placeholder={`Describe what triggers this for ${firstName} specifically…`}
              className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="custom-response" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">AI response</label>
            <textarea
              id="custom-response"
              rows={2}
              value={customResponse}
              onChange={(e) => setCustomResponse(e.target.value)}
              placeholder="What should the AI say when this is detected?"
              className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </Card>

      <button
        type="button"
        onClick={addCustom}
        disabled={!customName.trim() || !customTrigger.trim() || !customResponse.trim()}
        className="btn-dark w-full rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Add coping plan for {firstName}
      </button>
      <p className="mt-2 text-center text-xs text-text-muted">
        {firstName}'s consent to receive coping plans is on file.
      </p>
    </>
  );
};

// ── Screen: Patient Clinical ─────────────────────────────────────────────────

const PatientClinicalScreen = ({
  patientId, onBack,
}: {
  patientId: string; onBack: () => void;
}) => {
  const { patients, updatePatientClinical } = useTherapistStore();
  const patient = patients.find((p) => p.id === patientId)!;
  if (!patient) return null;

  const [notes, setNotes] = useState(patient.clinical.privateNotes);
  const [saved, setSaved] = useState(false);
  const firstName = patient.name.split(' ')[0];

  const save = () => {
    updatePatientClinical(patientId, { privateNotes: notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHeader title={`Clinical · ${firstName}.`} subtitle="Flags, episode monitoring, private notes" back={{ label: patient.name, onClick: onBack }} />

      <SectionLabel>Risk & monitoring</SectionLabel>
      <Card className="mb-5">
        <ToggleRow
          label="Mark as high risk"
          sublabel="Suppresses all engagement features immediately"
          checked={patient.clinical.highRisk}
          onChange={(v) => updatePatientClinical(patientId, { highRisk: v })}
        />
        <ToggleRow
          label="Monitor for mood episodes"
          sublabel="AI flags elevated or depressive patterns"
          checked={patient.clinical.monitorEpisodes}
          onChange={(v) => updatePatientClinical(patientId, { monitorEpisodes: v })}
          last
        />
      </Card>

      {patient.clinical.aiSignal && (
        <>
          <SectionLabel>Current AI signals</SectionLabel>
          <InfoBanner variant="purple">
            <p className="font-semibold mb-1.5">Possible elevated episode — active</p>
            <p className="leading-relaxed text-sm mb-2">{patient.clinical.aiSignal}</p>
            <p className="text-xs opacity-75 italic">AI signal only — not a diagnosis. Differential requires clinical assessment.</p>
          </InfoBanner>
        </>
      )}

      <SectionLabel>Private clinical notes</SectionLabel>
      <Card className="mb-5 px-5 py-4">
        <p className="mb-3 text-xs text-text-secondary">Not visible to {firstName} — therapist use only</p>
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Clinical observations, differential notes, supervision reminders…"
          aria-label="Private clinical notes"
          className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Card>

      <button
        type="button"
        onClick={save}
        className="btn-dark flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
      >
        {saved && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {saved ? 'Saved' : 'Save'}
      </button>
    </>
  );
};

// ── Screen: Patient Data ─────────────────────────────────────────────────────

const PatientDataScreen = ({
  patientId, onBack,
}: {
  patientId: string; onBack: () => void;
}) => {
  const { patients } = useTherapistStore();
  const patient = patients.find((p) => p.id === patientId)!;
  if (!patient) return null;
  const firstName = patient.name.split(' ')[0];

  const sharingItems = [
    { icon: MessageSquare, label: 'AI conversations', sub: 'Full chat logs', key: 'aiConversations' as const },
    { icon: BarChart2, label: 'Mood & check-in data', sub: 'Daily scores and notes', key: 'moodData' as const },
    { icon: Activity, label: 'Step & activity data', sub: 'Daily steps from phone', key: 'activityData' as const },
    { icon: Pill, label: 'Medication adherence', sub: 'Always shared — clinical protocol', key: 'medicationAdherence' as const },
  ];

  return (
    <>
      <PageHeader title={`Data access · ${firstName}.`} subtitle={`What ${firstName} has consented to share`} back={{ label: patient.name, onClick: onBack }} />

      <InfoBanner variant="warning">
        You can see what {firstName} shares below. Only {firstName} can change their sharing settings from their app. To request additional access, message them through session booking.
      </InfoBanner>

      <SectionLabel>{firstName}'s sharing (read-only)</SectionLabel>
      <Card className="mb-5">
        {sharingItems.map(({ icon: Icon, label, sub, key }, i) => (
          <Row key={key} last={i === sharingItems.length - 1} className="cursor-default">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
              <Icon className="h-4 w-4 text-brand" strokeWidth={1.75} />
            </div>
            <div className="flex-1"><p className="text-sm font-medium text-text">{label}</p><p className="text-xs text-text-secondary">{sub}</p></div>
            {key === 'medicationAdherence' ? (
              <span className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-0.5 text-[10px] font-semibold text-brand">Always on</span>
            ) : patient.sharing[key] ? (
              <span className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-0.5 text-[10px] font-semibold text-brand">Shared</span>
            ) : (
              <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[10px] font-semibold text-text-muted">Not shared</span>
            )}
          </Row>
        ))}
      </Card>

      <SectionLabel>Consent record</SectionLabel>
      <Card className="px-5 py-4 flex flex-col gap-3">
        {[
          { label: 'Initial consent', value: patient.consentDate },
          { label: 'Last updated', value: patient.consentUpdated },
          { label: 'Version', value: patient.consentVersion },
        ].map(({ label, value }, i, arr) => (
          <div key={label}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">{label}</span>
              <span className="text-xs font-medium text-text">{value}</span>
            </div>
            {i < arr.length - 1 && <div className="mt-3 h-px bg-border" />}
          </div>
        ))}
      </Card>
    </>
  );
};

// ── Screen: Patient Export ───────────────────────────────────────────────────

const PatientExportScreen = ({
  patientId, onBack,
}: {
  patientId: string; onBack: () => void;
}) => {
  const { patients } = useTherapistStore();
  const patient = patients.find((p) => p.id === patientId)!;
  if (!patient) return null;

  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [range, setRange] = useState<'week' | 'month' | '3months' | 'all'>('all');
  const [include, setInclude] = useState({
    mood: true, conversations: true, medication: true, activity: true, episodes: true, copingPlans: true,
  });
  const [generating, setGenerating] = useState(false);
  const firstName = patient.name.split(' ')[0];

  const generate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  const includeItems = [
    { key: 'mood' as const, icon: BarChart2, label: 'Mood & check-in history' },
    { key: 'conversations' as const, icon: MessageSquare, label: 'AI conversation logs' },
    { key: 'medication' as const, icon: Pill, label: 'Medication adherence' },
    { key: 'activity' as const, icon: Activity, label: 'Activity & steps' },
    { key: 'episodes' as const, icon: Zap, label: 'Mood episode signals' },
    { key: 'copingPlans' as const, icon: FileText, label: 'Coping plan usage' },
  ];

  const rangeLabels = { week: 'Last week', month: 'Last month', '3months': '3 months', all: 'All time' };

  return (
    <>
      <PageHeader title={`Export · ${firstName}.`} subtitle={`Download ${firstName}'s clinical records`} back={{ label: patient.name, onClick: onBack }} />

      <p className="mb-5 text-sm leading-relaxed text-text-secondary">
        Exports are encrypted, access-logged, and available for 24 hours. {firstName} is notified of every export.
      </p>

      <SectionLabel>Date range</SectionLabel>
      <Card className="mb-5 px-5 py-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.entries(rangeLabels) as [typeof range, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                range === key
                  ? 'border-brand/30 bg-brand-muted text-brand'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-2'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">From</span>
          <span className="font-medium text-brand cursor-pointer">{patient.connectedSince}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-text-secondary">To</span>
          <span className="font-medium text-brand cursor-pointer">Today · 2 May 2026</span>
        </div>
      </Card>

      <SectionLabel>Include in export</SectionLabel>
      <Card className="mb-5">
        {includeItems.map(({ key, icon: Icon, label }, i) => (
          <Row key={key} last={i === includeItems.length - 1} className="cursor-default">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
              <Icon className="h-4 w-4 text-brand" strokeWidth={1.75} />
            </div>
            <div className="flex-1"><p className="text-sm font-medium text-text">{label}</p></div>
            <Toggle
              checked={include[key]}
              onChange={(v) => setInclude((s) => ({ ...s, [key]: v }))}
            />
          </Row>
        ))}
      </Card>

      <SectionLabel>Format</SectionLabel>
      <div className="mb-5 grid grid-cols-2 gap-3">
        {(['pdf', 'csv'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
              format === f ? 'border-brand/30 bg-brand-muted' : 'border-border bg-surface hover:bg-surface-2'
            }`}
          >
            <p className={`text-sm font-semibold ${format === f ? 'text-brand' : 'text-text'}`}>
              {f === 'pdf' ? 'PDF report' : 'CSV data'}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {f === 'pdf' ? 'Formatted summary' : 'Raw data'}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={generating}
        aria-busy={generating}
        className="btn-dark flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:opacity-50"
      >
        {generating && <RefreshCw className="h-3.5 w-3.5" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />}
        {generating ? 'Generating…' : 'Generate export'}
      </button>
      <p className="mt-2 text-center text-xs text-text-muted">
        Logged for GDPR audit · {firstName} will be notified
      </p>
    </>
  );
};

// ── Screen: Engagement Defaults ──────────────────────────────────────────────

const EngagementDefaultsScreen = ({ onBack }: { onBack: () => void }) => {
  const { engagementDefaults, updateEngagementDefaults } = useTherapistStore();
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <PageHeader title="Engagement defaults." subtitle="Applied to all new patients you invite" back={{ label: 'Settings', onClick: onBack }} />

      <InfoBanner variant="warning">
        These defaults apply to new patients only. Override any setting individually from Patient management › [patient] › Engagement.
      </InfoBanner>

      <Card className="mb-5">
        <ToggleRow label="Willow companion" sublabel="Pet grows with weekly check-ins" checked={engagementDefaults.willowCompanion} onChange={(v) => updateEngagementDefaults({ willowCompanion: v })} />
        <ToggleRow label="Weekly gift rewards" sublabel="Accessories unlocked on completion" checked={engagementDefaults.weeklyGifts} onChange={(v) => updateEngagementDefaults({ weeklyGifts: v })} />
        <ToggleRow
          label="Streak display"
          warning="Avoid for patients with anxiety or perfectionism"
          checked={engagementDefaults.streakDisplay}
          onChange={(v) => updateEngagementDefaults({ streakDisplay: v })}
        />
        <ToggleRow label="Growth philosophy phrase" sublabel='"Growth is not linear…"' checked={engagementDefaults.growthPhrase} onChange={(v) => updateEngagementDefaults({ growthPhrase: v })} last />
      </Card>

      <div className="mb-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
        <p className="mb-2 text-xs font-semibold text-brand">Enable when patient is…</p>
        <ul className="space-y-1 text-xs text-text-secondary leading-relaxed">
          <li>· Stable or in maintenance phase</li>
          <li>· Responds well to encouragement</li>
          <li>· Can handle a missed week without distress</li>
        </ul>
      </div>

      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <p className="mb-2 text-xs font-semibold text-amber-700">Keep off when patient has…</p>
        <ul className="space-y-1 text-xs text-amber-800 leading-relaxed">
          <li>· Perfectionism or OCD</li>
          <li>· Active crisis or mood episode signal</li>
          <li>· Eating disorder history</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={save}
        className="btn-dark flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
      >
        {saved && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {saved ? 'Saved' : 'Save defaults'}
      </button>
    </>
  );
};

// ── Screen: Templates ────────────────────────────────────────────────────────

const TemplatesScreen = ({ onBack }: { onBack: () => void }) => {
  const { templates, addTemplate } = useTherapistStore();
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<string | null>(templates[0]?.id ?? null);

  const previewTemplate = templates.find((t) => t.id === preview);

  const create = () => {
    if (!newName.trim() || !newTrigger.trim() || !newResponse.trim()) return;
    addTemplate({ name: newName.trim(), trigger: newTrigger.trim(), aiResponse: newResponse.trim(), appliedToCount: 0, status: 'active' });
    setNewName(''); setNewTrigger(''); setNewResponse('');
    setCreating(false);
  };

  return (
    <>
      <PageHeader title="Templates." subtitle="Reusable — apply to any patient" back={{ label: 'Settings', onClick: onBack }} />

      <p className="mb-4 text-sm leading-relaxed text-text-secondary">
        Templates are saved here. Apply them to a specific patient from Patient management › [patient] › Coping plans.
      </p>

      <Card className="mb-5">
        {templates.map((t, i) => (
          <Row
            key={t.id}
            last={i === templates.length - 1}
            onClick={() => setPreview(preview === t.id ? null : t.id)}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-text">{t.name}</p>
              <p className="text-xs text-text-secondary">Applied to {t.appliedToCount} patient{t.appliedToCount !== 1 ? 's' : ''}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
              t.status === 'active' ? 'border-brand/20 bg-brand-muted text-brand' : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              {t.status === 'active' ? 'Active' : 'Draft'}
            </span>
          </Row>
        ))}
      </Card>

      {previewTemplate && (
        <>
          <SectionLabel>Template preview — {previewTemplate.name.toLowerCase()}</SectionLabel>
          <div className="mb-5 rounded-2xl border border-border bg-surface px-5 py-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Trigger</p>
            <p className="mb-4 text-sm text-text-secondary leading-relaxed">{previewTemplate.trigger}</p>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">AI response</p>
            <p className="text-sm text-brand leading-relaxed">{previewTemplate.aiResponse}</p>
          </div>
        </>
      )}

      {creating ? (
        <>
          <SectionLabel>New template</SectionLabel>
          <Card className="mb-4 px-5 py-4 flex flex-col gap-3">
            {[
              { id: 'tpl-name', label: 'Name', value: newName, onChange: setNewName, placeholder: 'e.g. Sleep anxiety wind-down' },
              { id: 'tpl-trigger', label: 'Trigger', value: newTrigger, onChange: setNewTrigger, placeholder: 'Describe the trigger pattern…' },
              { id: 'tpl-response', label: 'AI response', value: newResponse, onChange: setNewResponse, placeholder: 'What should the AI say?' },
            ].map(({ id, label, value, onChange, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</label>
                <textarea
                  id={id}
                  rows={2}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            ))}
          </Card>
          <div className="mb-4 flex gap-2">
            <button type="button" onClick={() => setCreating(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors duration-200">Cancel</button>
            <button
              type="button"
              onClick={create}
              disabled={!newName.trim() || !newTrigger.trim() || !newResponse.trim()}
              className="flex-1 btn-dark rounded-xl border border-text/20 bg-text py-2.5 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90 disabled:opacity-30"
            >
              Save template
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-dark flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Create new template
        </button>
      )}
    </>
  );
};

// ── Screen: Availability ─────────────────────────────────────────────────────

const AvailabilityScreen = ({ onBack }: { onBack: () => void }) => {
  const { availability, updateAvailability } = useTherapistStore();
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <>
      <PageHeader title="Availability." subtitle="Bookable hours and session settings" back={{ label: 'Settings', onClick: onBack }} />

      <SectionLabel>Session defaults</SectionLabel>
      <Card className="mb-5">
        <Row className="cursor-default">
          <span className="flex-1 text-sm text-text-secondary">Duration</span>
          <Stepper
            value={availability.sessionDuration}
            onDecrement={() => updateAvailability({ sessionDuration: Math.max(25, availability.sessionDuration - 5) })}
            onIncrement={() => updateAvailability({ sessionDuration: Math.min(120, availability.sessionDuration + 5) })}
            format={(v) => `${v} min`}
          />
        </Row>
        <Row className="cursor-default">
          <span className="flex-1 text-sm text-text-secondary">Buffer between</span>
          <Stepper
            value={availability.bufferMinutes}
            onDecrement={() => updateAvailability({ bufferMinutes: Math.max(0, availability.bufferMinutes - 5) })}
            onIncrement={() => updateAvailability({ bufferMinutes: Math.min(60, availability.bufferMinutes + 5) })}
            format={(v) => `${v} min`}
          />
        </Row>
        <Row last className="cursor-default flex-wrap gap-2">
          <span className="text-sm text-text-secondary mr-2">Session type</span>
          {(['video', 'phone', 'inPerson'] as const).map((type) => {
            const labels = { video: 'Video', phone: 'Phone', inPerson: 'In-person' };
            const on = availability.sessionTypes[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateAvailability({ sessionTypes: { ...availability.sessionTypes, [type]: !on } })}
                className={`rounded-xl border px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                  on ? 'border-brand/30 bg-brand-muted text-brand' : 'border-border bg-surface text-text-secondary hover:bg-surface-2'
                }`}
              >
                {labels[type]}{on ? ' ✓' : ''}
              </button>
            );
          })}
        </Row>
      </Card>

      <SectionLabel>Working days</SectionLabel>
      <Card className="mb-5 px-5 py-4">
        <div className="mb-4 flex gap-2 justify-between" role="group" aria-label="Working days">
          {DAY_LABELS.map((day, i) => {
            const on = availability.workingDays[i];
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const days = [...availability.workingDays];
                  days[i] = !days[i];
                  updateAvailability({ workingDays: days });
                }}
                aria-pressed={on}
                aria-label={day}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
                  on ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted hover:bg-surface-2'
                }`}
              >
                {day.slice(0, 1)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Working hours</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <span>{availability.startHour}:00am</span>
            <span className="text-text-muted text-xs">to</span>
            <span>{availability.endHour - 12}:00pm</span>
          </div>
        </div>
      </Card>

      <SectionLabel>Booking window</SectionLabel>
      <Card className="mb-5">
        <Row className="cursor-default">
          <span className="flex-1 text-sm text-text-secondary">Minimum notice</span>
          <span className="text-sm font-semibold text-text">24 hours</span>
        </Row>
        <Row last className="cursor-default">
          <span className="flex-1 text-sm text-text-secondary">Book up to</span>
          <span className="text-sm font-semibold text-text">8 weeks ahead</span>
        </Row>
      </Card>

      <button
        type="button"
        onClick={save}
        className="btn-dark flex w-full items-center justify-center gap-2 rounded-xl border border-text/20 bg-text py-3 text-sm font-semibold text-background transition-all duration-[500ms] ease-expo hover:bg-text/90"
      >
        {saved && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {saved ? 'Saved' : 'Save availability'}
      </button>
    </>
  );
};

// ── Screen: Notifications ─────────────────────────────────────────────────────

const NotificationsScreen = ({ onBack }: { onBack: () => void }) => {
  const { notifications, updateNotifications } = useTherapistStore();

  return (
    <>
      <PageHeader title="Notifications." subtitle="Alerts across all patients" back={{ label: 'Settings', onClick: onBack }} />

      <SectionLabel>Patient alerts</SectionLabel>
      <Card className="mb-5">
        <Row className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50"><AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Crisis flags</p><p className="text-xs text-text-secondary">Immediate · cannot disable</p></div>
          <Toggle checked={notifications.crisisFlags} onChange={() => {}} disabled />
        </Row>
        <ToggleRow label="Mood episode signals" sublabel="Elevated or depressive pattern detected" checked={notifications.moodEpisodes} onChange={(v) => updateNotifications({ moodEpisodes: v })} />
        <ToggleRow label="Urgent pattern flags" sublabel="Severe mood dip, low PHQ-9" checked={notifications.urgentPatterns} onChange={(v) => updateNotifications({ urgentPatterns: v })} />
        <ToggleRow label="Weekly summary digest" sublabel="Monday morning per patient" checked={notifications.weeklySummary} onChange={(v) => updateNotifications({ weeklySummary: v })} />
        <ToggleRow label="Patient week completions" sublabel="When a Willow gift is unlocked" checked={notifications.weekCompletions} onChange={(v) => updateNotifications({ weekCompletions: v })} last />
      </Card>

      <SectionLabel>Session</SectionLabel>
      <Card className="mb-5">
        <ToggleRow label="Session reminders" sublabel="24h before each session" checked={notifications.sessionReminders} onChange={(v) => updateNotifications({ sessionReminders: v })} />
        <ToggleRow label="Pre-session brief ready" sublabel="AI summary prepared for next session" checked={notifications.preBriefReady} onChange={(v) => updateNotifications({ preBriefReady: v })} last />
      </Card>

      <SectionLabel>Quiet hours</SectionLabel>
      <Card>
        <ToggleRow label="Do not disturb" sublabel="Crisis alerts always come through" checked={notifications.doNotDisturb} onChange={(v) => updateNotifications({ doNotDisturb: v })} />
        <Row last className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Bell className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Quiet window</p></div>
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <span>8pm</span><span className="text-xs text-text-muted">–</span><span>8am</span>
          </div>
        </Row>
      </Card>
    </>
  );
};

// ── Screen: Data & Privacy ────────────────────────────────────────────────────

const DataPrivacyScreen = ({ onBack }: { onBack: () => void }) => (
  <>
    <PageHeader title="Data & privacy." subtitle="Practice-level · per-patient data is in Patients" back={{ label: 'Settings', onClick: onBack }} />

    <InfoBanner variant="danger">
      All patient data encrypted AES-256. You are the GDPR data controller. Per-patient data access and export is managed from Patient management › [patient].
    </InfoBanner>

    <SectionLabel>Practice compliance</SectionLabel>
    <Card className="mb-5">
      {[
        { label: 'Jurisdiction', value: 'UK GDPR · NHS DSPT' },
        { label: 'Encryption', value: 'AES-256 at rest · TLS 1.3' },
        { label: 'Data residency', value: 'EU / UK servers only' },
        { label: 'Retention policy', value: '7 years (UK default)' },
      ].map(({ label, value }, i, arr) => (
        <Row key={label} last={i === arr.length - 1} className="cursor-default">
          <span className="flex-1 text-xs text-text-secondary">{label}</span>
          <span className="text-xs font-medium text-text">{value}</span>
        </Row>
      ))}
    </Card>

    <SectionLabel>Documents</SectionLabel>
    <Card className="mb-5">
      <Row onClick={() => {}}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><FileText className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
        <div className="flex-1"><p className="text-sm font-medium text-text">Data processing agreement</p><p className="text-xs text-text-secondary">GDPR Art. 28 · MindBridge as processor</p></div>
        <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
      </Row>
      <Row last onClick={() => {}}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Copy className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
        <div className="flex-1"><p className="text-sm font-medium text-text">Audit log</p><p className="text-xs text-text-secondary">All data access events</p></div>
        <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
      </Row>
    </Card>

    <SectionLabel>Per-patient</SectionLabel>
    <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
      <p className="text-sm leading-relaxed text-text-secondary">
        Individual patient data access, consent records, and data export are managed per patient.
        Go to Settings › Patients › [patient name] › Data access or Export records.
      </p>
    </div>
  </>
);

// ── Screen: Security ──────────────────────────────────────────────────────────

const SecurityScreen = ({ onBack }: { onBack: () => void }) => {
  const { security, updateSecurity } = useTherapistStore();

  return (
    <>
      <PageHeader title="Security." subtitle="Protect your clinical account" back={{ label: 'Settings', onClick: onBack }} />

      <SectionLabel>Authentication</SectionLabel>
      <Card className="mb-5">
        <Row onClick={() => {}}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Shield className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Change password</p><p className="text-xs text-text-secondary">Last changed 3 months ago</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Lock className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Two-factor authentication</p><p className="text-xs text-text-secondary">Authenticator app · required by law</p></div>
          <span className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-0.5 text-[10px] font-semibold text-brand">On</span>
        </Row>
        <ToggleRow label="Biometric unlock" sublabel="Face ID / fingerprint" checked={security.biometric} onChange={(v) => updateSecurity({ biometric: v })} last />
      </Card>

      <SectionLabel>Session</SectionLabel>
      <Card className="mb-4">
        <Row className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Settings className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Auto-lock after</p></div>
          <Stepper
            value={security.autoLockMinutes}
            onDecrement={() => updateSecurity({ autoLockMinutes: Math.max(1, security.autoLockMinutes - 1) })}
            onIncrement={() => updateSecurity({ autoLockMinutes: Math.min(30, security.autoLockMinutes + 1) })}
            format={(v) => `${v} min`}
          />
        </Row>
        <Row last className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Shield className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Active sessions</p><p className="text-xs text-text-secondary">iPhone 14 · MacBook Pro</p></div>
          <button type="button" className="text-xs font-medium text-brand hover:text-brand/80 transition-colors duration-200">Manage</button>
        </Row>
      </Card>

      <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
        <p className="text-sm leading-relaxed text-text-secondary">
          As a clinical data controller, 2FA is legally required and cannot be disabled.
        </p>
      </div>
    </>
  );
};

// ── Screen: Account ───────────────────────────────────────────────────────────

const AccountScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useTherapistStore();

  return (
    <>
      <PageHeader title="Account." subtitle="Subscription and details" back={{ label: 'Settings', onClick: onBack }} />

      <SectionLabel>Details</SectionLabel>
      <Card className="mb-5">
        {[
          { label: 'Name', value: profile.name },
          { label: 'Email', value: profile.practiceEmail },
          { label: 'Member since', value: 'January 2025' },
        ].map(({ label, value }, i, arr) => (
          <Row key={label} last={i === arr.length - 1} className="cursor-default">
            <span className="flex-1 text-xs text-text-secondary">{label}</span>
            <span className="text-xs font-medium text-text">{value}</span>
          </Row>
        ))}
      </Card>

      <SectionLabel>Subscription</SectionLabel>
      <Card className="mb-5">
        <Row className="cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Settings className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Clinical Plan</p><p className="text-xs text-text-secondary">Up to 10 patients · full dashboard</p></div>
          <span className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-0.5 text-[10px] font-semibold text-brand">Active</span>
        </Row>
        <Row className="cursor-default">
          <span className="flex-1 text-xs text-text-secondary">Renews</span>
          <span className="text-xs font-medium text-text">1 Jan 2026</span>
        </Row>
        <Row last onClick={() => {}}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50"><ChevronRight className="h-4 w-4 text-amber-600" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Upgrade to Practice Plan</p><p className="text-xs text-text-secondary">Unlimited patients · team access</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
      </Card>

      <SectionLabel>Support</SectionLabel>
      <Card>
        <Row onClick={() => {}}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><Bell className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Clinical help centre</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row onClick={() => {}}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-muted"><MessageSquare className="h-4 w-4 text-brand" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-text">Send feedback</p></div>
          <ChevronRight className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
        </Row>
        <Row last className="hover:bg-red-50 cursor-pointer" onClick={() => {}}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50"><LogOut className="h-4 w-4 text-red-500" strokeWidth={1.75} /></div>
          <div className="flex-1"><p className="text-sm font-medium text-red-600">Sign out</p></div>
        </Row>
      </Card>
    </>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────────

const TherapistSettingsView = () => {
  const [screen, setScreen] = useState<Screen>('root');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const navigate = (s: Screen) => setScreen(s);

  const selectPatient = (id: string) => {
    setSelectedPatientId(id);
    setScreen('patient-detail');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'root':
        return <RootScreen navigate={navigate} />;
      case 'profile':
        return <ProfileScreen onBack={() => navigate('root')} />;
      case 'patients':
        return <PatientsScreen onBack={() => navigate('root')} onSelect={selectPatient} />;
      case 'patient-detail':
        return selectedPatientId ? (
          <PatientDetailScreen patientId={selectedPatientId} onBack={() => navigate('patients')} navigate={navigate} />
        ) : null;
      case 'patient-engagement':
        return selectedPatientId ? (
          <PatientEngagementScreen patientId={selectedPatientId} onBack={() => navigate('patient-detail')} />
        ) : null;
      case 'patient-coping':
        return selectedPatientId ? (
          <PatientCopingScreen patientId={selectedPatientId} onBack={() => navigate('patient-detail')} />
        ) : null;
      case 'patient-clinical':
        return selectedPatientId ? (
          <PatientClinicalScreen patientId={selectedPatientId} onBack={() => navigate('patient-detail')} />
        ) : null;
      case 'patient-data':
        return selectedPatientId ? (
          <PatientDataScreen patientId={selectedPatientId} onBack={() => navigate('patient-detail')} />
        ) : null;
      case 'patient-export':
        return selectedPatientId ? (
          <PatientExportScreen patientId={selectedPatientId} onBack={() => navigate('patient-detail')} />
        ) : null;
      case 'engagement-defaults':
        return <EngagementDefaultsScreen onBack={() => navigate('root')} />;
      case 'templates':
        return <TemplatesScreen onBack={() => navigate('root')} />;
      case 'availability':
        return <AvailabilityScreen onBack={() => navigate('root')} />;
      case 'notifications':
        return <NotificationsScreen onBack={() => navigate('root')} />;
      case 'data-privacy':
        return <DataPrivacyScreen onBack={() => navigate('root')} />;
      case 'security':
        return <SecurityScreen onBack={() => navigate('root')} />;
      case 'account':
        return <AccountScreen onBack={() => navigate('root')} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex h-full w-full overflow-y-auto bg-background page-enter">
      <div className="mx-auto w-full max-w-lg px-6 py-10">
        {screen === 'root' && (
          <div className="mb-6">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-text-muted" aria-hidden="true">
              Therapist portal
            </p>
            <h1
              className="font-display font-light italic tracking-tighter text-text leading-[1.05]"
              style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}
            >
              Settings.
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Clinical settings, patient management, and account.
            </p>
          </div>
        )}
        {renderScreen()}
      </div>
    </main>
  );
};

export default TherapistSettingsView;
