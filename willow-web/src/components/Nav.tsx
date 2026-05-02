import { NavLink, useLocation } from 'react-router-dom';
import { MessageCircle, BarChart2, BookOpen, User } from 'lucide-react';
import WillowLogo from './WillowLogo';

const navItems = [
  { to: '/chat',    icon: MessageCircle, label: 'Chat' },
  { to: '/trends',  icon: BarChart2,     label: 'Trends' },
  { to: '/toolkit', icon: BookOpen,      label: 'Toolkit' },
  { to: '/profile', icon: User,          label: 'Profile' },
];

const Nav = () => {
  const { pathname } = useLocation();
  if (pathname === '/crisis') return null;

  return (
    <nav
      aria-label="Main navigation"
      className="flex w-[58px] shrink-0 flex-col items-center border-r border-border bg-surface/70 py-5 gap-1 backdrop-blur-sm"
    >
      {/* Logo */}
      <div className="mb-8 breathe" aria-hidden="true">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand shadow-brand">
          <WillowLogo className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />
        </div>
      </div>

      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={label}
          className={({ isActive }) =>
            `flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ease-expo ${
              isActive
                ? 'bg-brand-muted text-brand'
                : 'text-text-muted hover:bg-surface-2 hover:text-text-secondary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
              {isActive && <span className="sr-only">(current page)</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Nav;
