import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function NotFound() {
  const { user } = useAuth();
  const homeHref = user?.role === 'admin' ? '/admin/dashboard' : user ? '/member/dashboard' : '/auth/login';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-navy-900 flex items-center justify-center mx-auto mb-6">
          <span className="font-display font-bold text-white text-3xl">JE</span>
        </div>
        <h1 className="font-display font-bold text-6xl text-navy-900 mb-4">404</h1>
        <p className="text-slate-500 text-lg mb-8">Oops — this page doesn't exist.</p>
        <Link href={homeHref} className="btn-primary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
