import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../lib/auth';

export default function DashboardLayout({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
    }
  }, [user, loading, requiredRole, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main className="ml-24 min-h-screen transition-all duration-300" style={{ paddingTop: 104 }}>
        <div className="p-8 pt-0">{children}</div>
      </main>
    </div>
  );
}