import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';

const PAGE_TITLES = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/trainings': 'Gestion des formations',
  '/admin/proposals': 'Propositions de formations',
  '/admin/users': 'Membres',
  '/admin/progress': 'Vue d\'ensemble',
  '/member/dashboard': 'Mon tableau de bord',
  '/member/trainings': 'Formations disponibles',
  '/member/progress': 'Ma progression',
  '/member/proposals': 'Mes propositions',
  '/member/profile': 'Mon profil',
};

export default function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const title = PAGE_TITLES[router.pathname] || 'Platform';

  const now = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const isMember = user?.role !== 'admin';

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-sm
                       border-b border-slate-100 z-20 flex items-center px-8 justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo/Primary logo - Colored.png" alt="ENIT JE Logo"
          className="w-9 h-9 object-contain"
        />
        <div>
          <p className="font-display font-bold text-navy-900 text-base leading-tight">ENIT</p>
          <p className="text-teal-dark text-xs font-semibold leading-tight">Junior Entreprise</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-navy-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-400">{user?.department || user?.role}</p>
        </div>
        {isMember ? (
          <Link href="/member/profile"
            title="View profile"
            className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0 overflow-hidden
                       hover:ring-2 hover:ring-teal-400 hover:ring-offset-2 transition-all duration-200 cursor-pointer">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-sm">
                {(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}
              </span>
            )}
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
