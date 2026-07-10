import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';

const STATUS_FILTERS = ['all', 'enrolled', 'in_progress', 'completed'];

const STATUS_META = {
  enrolled:    { label: 'Enrolled',     icon: '📋', badge: 'badge-yellow' },
  in_progress: { label: 'In Progress',  icon: '🔄', badge: 'badge-teal'   },
  completed:   { label: 'Completed',    icon: '✅', badge: 'badge-green'  },
};

const CATEGORY_COLORS = {
  Technical:    '#1d2d4e',
  Management:   '#0891b2',
  Design:       '#7c3aed',
  Marketing:    '#db2777',
  Finance:      '#059669',
  'Soft Skills':'#d97706',
  Other:        '#6b7280',
};

export default function MemberProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/progress/me')
      .then(({ data }) => setProgress(data.progress))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? progress
    : progress.filter((p) => p.status === filter);

  const counts = STATUS_FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? progress.length : progress.filter((p) => p.status === f).length;
    return acc;
  }, {});

  const totalHours = progress
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.training?.duration || 0), 0);

  return (
    <DashboardLayout requiredRole="member">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-navy-900">My Progress</h2>
        <p className="text-slate-500 text-sm mt-0.5">Track all your enrolled trainings</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Enrolled', value: counts.all,         icon: '📚', color: 'bg-navy-900/8 text-navy-900' },
          { label: 'Completed',      value: counts.completed,   icon: '🎓', color: 'bg-green-50 text-green-700' },
          { label: 'In Progress',    value: counts.in_progress, icon: '🔄', color: 'bg-teal-je/10 text-teal-dark' },
          { label: 'Hours Earned',   value: `${totalHours}h`,   icon: '⏱', color: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card flex items-center gap-3 py-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <span className="text-lg">{icon}</span>
            </div>
            <div>
              <p className="font-display font-bold text-xl text-navy-900 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-navy-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.replace('_', ' ')}
            {counts[f] > 0 && (
              <span className="ml-1.5 opacity-60">({counts[f]})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-slate-400 mb-4">
            {filter === 'all' ? "You haven't enrolled in any trainings yet." : `No ${filter.replace('_', ' ')} trainings.`}
          </p>
          {filter === 'all' && (
            <Link href="/member/trainings" className="btn-teal inline-block">
              Browse Trainings
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.enrolled;
            const catColor = CATEGORY_COLORS[p.training?.category] || '#6b7280';
            const pct = p.percentageComplete;

            return (
              <div key={p._id} className="card flex flex-col sm:flex-row sm:items-center gap-5 group hover:shadow-card-hover transition-shadow">
                {/* Color stripe */}
                <div
                  className="hidden sm:block w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ background: catColor }}
                />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-display font-semibold text-navy-900 text-base">
                      {p.training?.title}
                    </h3>
                    <span className={`badge ${meta.badge}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                    <span
                      className="font-medium px-2 py-0.5 rounded-md text-white"
                      style={{ background: catColor, opacity: 0.85 }}
                    >
                      {p.training?.category}
                    </span>
                    <span>⏱ {p.training?.duration}h</span>
                    <span>🎯 {p.training?.level}</span>
                    <span>Enrolled {new Date(p.enrolledAt).toLocaleDateString()}</span>
                    {p.completedAt && (
                      <span className="text-green-600">
                        ✅ Completed {new Date(p.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">
                        {p.completedModules?.length || 0} / {p.training?.modules?.length || '?'} modules
                      </span>
                      <span className="font-semibold text-navy-900">{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/member/trainings/${p.training?._id}`}
                    className={`block text-center text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors ${
                      p.status === 'completed'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-navy-900 text-white hover:bg-navy-700'
                    }`}
                  >
                    {p.status === 'completed' ? 'Review' : 'Continue →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
