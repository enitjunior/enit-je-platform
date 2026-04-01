import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
    } else if (user.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/member/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
        <p className="text-navy-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
