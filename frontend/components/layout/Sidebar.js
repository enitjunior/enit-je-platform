import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import clsx from 'clsx';

// ── Icons (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ path, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  trainings: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  progress: 'M18 20V10 M12 20V4 M6 20v-6',
  proposals: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  reports: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/trainings', label: 'Trainings', icon: 'trainings' },
  { href: '/admin/proposals', label: 'Proposals', icon: 'proposals' },
  { href: '/admin/users', label: 'Members', icon: 'users' },
  { href: '/admin/progress', label: 'Progress', icon: 'progress' },
];

const memberLinks = [
  { href: '/member/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { href: '/member/trainings', label: 'Formations', icon: 'trainings' },
  { href: '/member/progress', label: 'Ma Progression', icon: 'progress' },
  { href: '/member/proposals', label: 'Propositions', icon: 'proposals' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const links = user?.role === 'admin' ? adminLinks : memberLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30"
      style={{ background: 'linear-gradient(180deg, #1d2d4e 0%, #152038 100%)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo/Primary logo - White.png" alt="ENIT JE Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-white font-display font-bold text-sm leading-tight">ENIT</p>
            <p className="text-teal-je text-xs font-medium">Junior Entreprise</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-3 py-3 border-b border-white/10">
        {user?.role !== 'admin' ? (() => {
          const isProfileActive = router.pathname === '/member/profile';
          return (
            <Link href="/member/profile"
              className={clsx(
                'sidebar-link',
                isProfileActive && 'active'
              )}>
              <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-teal-je/20">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-teal-je font-semibold text-xs">
                    {(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="text-xs font-medium capitalize text-slate-400">
                  {user?.role}
                </span>
              </div>
              {isProfileActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-teal-je" />
              )}
            </Link>
          );
        })() : (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-teal-je/20">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-teal-je font-semibold text-sm">
                  {(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-xs font-medium capitalize text-teal-je">
                {user?.role}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon }) => {
          const isActive = router.pathname === href || router.pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={clsx('sidebar-link', isActive && 'active')}>
              <Icon path={ICONS[icon]} size={16} />
              <span>{label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-teal-je" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <Icon path={ICONS.logout} size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
