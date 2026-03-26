import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/trainings': 'Training Management',
  '/admin/proposals': 'Training Proposals',
  '/admin/users': 'Members',
  '/admin/progress': 'Progress Overview',
  '/member/dashboard': 'My Dashboard',
  '/member/trainings': 'Available Trainings',
  '/member/progress': 'My Progress',
  '/member/proposals': 'My Proposals',
};

export default function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const title = PAGE_TITLES[router.pathname] || 'Platform';

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-sm
                       border-b border-slate-100 z-20 flex items-center px-8 justify-between">
      <div>
        <h1 className="font-display font-bold text-navy-900 text-xl">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{now}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-navy-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-400">{user?.department || user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
