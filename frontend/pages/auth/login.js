import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1d2d4e 0%, #152038 60%, #0f1c38 100%)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="flex items-center gap-3 relative z-10">
          <img src="/logo/Primary logo - White.png" alt="ENIT JE Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-white font-display font-bold text-lg leading-none">ENIT</p>
            <p className="text-teal-je text-xs font-medium">Junior Entreprise</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white font-display font-bold text-4xl leading-tight mb-4">
            Grow your skills.<br />
            <span style={{ color: '#3cbfbf' }}>Shape your future.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Access structured training programs, track your progress, and unlock your full potential with ENIT JE's learning platform.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[['20+', 'Courses'], ['150+', 'Members'], ['95%', 'Completion']].map(([num, label]) => (
              <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p className="font-display font-bold text-2xl text-white">{num}</p>
                <p className="text-slate-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10">© {new Date().getFullYear()} ENIT Junior Entreprise. All rights reserved.</p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="/logo/Primary logo - Colored.png" alt="ENIT JE Logo" className="w-9 h-9 object-contain" />
            <span className="font-display font-bold text-navy-900 text-lg">ENIT Junior Entreprise</span>
          </div>

          <h1 className="font-display font-bold text-3xl text-navy-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to continue to your dashboard</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@enit-je.tn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New member?{' '}
            <Link href="/auth/register" className="text-teal-dark font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">Demo credentials</p>
            <p className="text-xs text-slate-400">Admin: <span className="font-mono text-navy-900">admin@enitje.tn</span> / <span className="font-mono text-navy-900">admin123</span></p>
            <p className="text-xs text-slate-400 mt-1">Member: <span className="font-mono text-navy-900">amine@enitje.tn</span> / <span className="font-mono text-navy-900">member123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
