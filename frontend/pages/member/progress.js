import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';

const STATUS_FILTERS = ['all', 'enrolled', 'in_progress', 'completed'];

const STATUS_META = {
  enrolled:    { label: 'Inscrit',     icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, badge: 'badge-yellow' },
  in_progress: { label: 'En cours',    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>, badge: 'badge-teal'   },
  completed:   { label: 'Terminé',     icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><polyline points="20 6 9 17 4 12"/></svg>, badge: 'badge-green'  },
};

const FILTER_LABELS = {
  all: 'Toutes',
  enrolled: 'Inscrit',
  in_progress: 'En cours',
  completed: 'Terminé',
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
        <h2 className="font-display font-bold text-2xl text-navy-900">Ma progression</h2>
        <p className="text-slate-500 text-sm mt-0.5">Suivez toutes vos formations</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Candidatures', value: counts.all,         icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3A2.5 2.5 0 0 1 6.5 0.5H20v16.5H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>, color: 'bg-navy-900/8 text-navy-900' },
          { label: 'Terminé',      value: counts.completed,   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, color: 'bg-green-50 text-green-700' },
          { label: 'En cours',    value: counts.in_progress, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>, color: 'bg-teal-je/10 text-teal-dark' },
          { label: 'Heures acquises',   value: `${totalHours}h`,   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, color: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card flex items-center gap-3 py-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              {icon}
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
            {FILTER_LABELS[f]}
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-slate-300"><path d="M22 12h-6l-2 3h-4l-2-3H2"/></svg>
          <p className="text-slate-400 mb-4">
            {filter === 'all' 
              ? "Vous n'êtes inscrit à aucune formation." 
              : `Aucune formation ${FILTER_LABELS[filter].toLowerCase()}.`}
          </p>
          {filter === 'all' && (
            <Link href="/member/trainings" className="btn-teal inline-block">
              Parcourir les formations
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
                    <span>{p.training?.category}</span>
                    <span>{p.training?.duration}h</span>
                    <span>{p.training?.level}</span>
                    <span>Inscrit le {new Date(p.enrolledAt).toLocaleDateString('fr-FR')}</span>
                    {p.completedAt && (
                      <span className="text-green-600">
                        Terminé le {new Date(p.completedAt).toLocaleDateString('fr-FR')}
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
                    {p.status === 'completed' ? 'Revoir' : 'Continuer →'}
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
