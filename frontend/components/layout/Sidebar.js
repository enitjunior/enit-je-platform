import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import clsx from 'clsx';

const Icon = ({ path, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  trainings: 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5',
  progress:  'M18 20V10 M12 20V4 M6 20v-6',
  proposals: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  agenda:    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  users:     'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

const adminLinks = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { href: '/admin/trainings', label: 'Formations',       icon: 'trainings' },
  { href: '/admin/agenda',    label: 'Agenda',           icon: 'agenda' },
  { href: '/admin/proposals', label: 'Propositions',     icon: 'proposals' },
  { href: '/admin/users',     label: 'Membres',          icon: 'users' },
  { href: '/admin/progress',  label: 'Progression',      icon: 'progress' },
];

const memberLinks = [
  { href: '/member/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { href: '/member/trainings', label: 'Formations',       icon: 'trainings' },
  { href: '/member/progress',  label: 'Ma progression',   icon: 'progress' },
  { href: '/member/proposals', label: 'Propositions',     icon: 'proposals' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const links = user?.role === 'admin' ? adminLinks : memberLinks;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        .je-sidebar {
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          position: fixed;
          left: 16px; top: 16px;
          height: calc(100vh - 32px);
          width: 64px;
          display: flex;
          flex-direction: column;
          z-index: 30;
          overflow: hidden;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(40, 55, 77, 0.15), inset 0 1px 0 rgba(255,255,255,0.4);
        }

        .je-sidebar:hover {
          width: 220px;
        }

        .je-sidebar .sb-logo-text,
        .je-sidebar .sb-user-info,
        .je-sidebar .sb-link-label,
        .je-sidebar .sb-menu-label,
        .je-sidebar .sb-tagline,
        .je-sidebar .sb-logout-label {
          opacity: 0;
          white-space: nowrap;
          transition: opacity 0.2s ease 0s;
          pointer-events: none;
        }

        .je-sidebar:hover .sb-logo-text,
        .je-sidebar:hover .sb-user-info,
        .je-sidebar:hover .sb-link-label,
        .je-sidebar:hover .sb-menu-label,
        .je-sidebar:hover .sb-tagline,
        .je-sidebar:hover .sb-logout-label {
          opacity: 1;
          transition: opacity 0.25s ease 0.15s;
        }

        .je-sidebar .sb-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          color: rgba(40, 55, 77, 0.7);
          font-size: 15px;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          border-left: 2px solid transparent;
          transition: color 0.15s, background 0.15s, border-color 0.15s;
          text-decoration: none;
          min-width: 220px;
        }

        .je-sidebar .sb-link:hover {
          color: #28374d;
          background: rgba(40, 55, 77, 0.06);
        }

        .je-sidebar .sb-link.active {
          color: #28374d;
          font-weight: 700;
          border-left: 2px solid #3cbfbf;
          background: rgba(40, 55, 77, 0.08);
        }

        .je-sidebar .sb-icon {
          flex-shrink: 0;
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .je-sidebar .sb-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          width: 100%;
          min-width: 220px;
          color: rgba(40, 55, 77, 0.7);
          font-size: 15px;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          text-align: left;
        }

        .je-sidebar .sb-logout-btn:hover {
          color: #28374d;
          background: rgba(40, 55, 77, 0.08);
        }

        .je-sidebar .sb-divider {
          border-top: 1px solid rgba(40, 55, 77, 0.12);
          margin: 0;
        }
      `}</style>

      <aside className="je-sidebar">

        {/* Logo */}
        <div style={{ padding: '20px 14px 16px', borderBottom: '1px solid rgba(40, 55, 77, 0.12)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/logo-enit.png" alt="ENIT Junior Entreprise" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="sb-logo-text">
            <p style={{ color: '#28374d', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>ENIT</p>
            <p style={{ color: '#28374d', fontSize: 12, fontWeight: 600 }}>Junior Entreprise</p>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(40, 55, 77, 0.12)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(60,191,191,0.15)',
            border: '1px solid rgba(60,191,191,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#28374d', fontWeight: 400, fontSize: 12,
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="sb-user-info" style={{ minWidth: 0 }}>
            <p style={{ color: '#28374d', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ color: '#28374d', fontSize: 12, fontWeight: 600 }}>
              {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </p>
          </div>
        </div>

        {/* Menu label */}
        <div style={{ padding: '14px 0 6px 22px', overflow: 'hidden' }}>
          <p className="sb-menu-label" style={{ color: 'rgba(40, 55, 77, 0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' }}>
            Menu
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {links.map(({ href, label, icon }) => {
            const isActive = router.pathname === href || router.pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={clsx('sb-link', isActive && 'active')}
              >
                <span className="sb-icon">
                  <Icon path={ICONS[icon]} size={18} />
                </span>
                <span className="sb-link-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tagline */}
        <div className="sb-tagline" style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <img src="/proficiency_is_our_currency.png" alt="Proficiency is our currency" style={{ maxWidth: '70%', height: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Logout */}
        <div className="sb-divider">
          <button className="sb-logout-btn" onClick={logout}>
            <span className="sb-icon">
              <Icon path={ICONS.logout} size={18} />
            </span>
            <span className="sb-logout-label">Se déconnecter</span>
          </button>
        </div>

      </aside>
    </>
  );
}