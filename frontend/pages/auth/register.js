import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

const DEPARTMENTS = ['IT', 'Engineering', 'Design', 'Marketing', 'Finance', 'Management', 'Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form);
      router.replace('/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1d2d4e, #3cbfbf)' }}>
            <span className="text-white font-display font-bold">JE</span>
          </div>
          <span className="font-display font-bold text-navy-900 text-xl">ENIT Junior Entreprise</span>
        </div>

        <div className="card">
          <h1 className="font-display font-bold text-2xl text-navy-900 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">Join the platform to start your learning journey</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <input name="firstName" className="input" placeholder="Anis" value={form.firstName}
                  onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Last name</label>
                <input name="lastName" className="input" placeholder="Ben Ali" value={form.lastName}
                  onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" className="input" placeholder="you@enit-je.tn"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" placeholder="Minimum 6 characters"
                value={form.password} onChange={handleChange} required />
            </div>

            <div>
              <label className="label">Department</label>
              <select name="department" className="input" value={form.department} onChange={handleChange}>
                <option value="">Select your department</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-teal-dark font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
