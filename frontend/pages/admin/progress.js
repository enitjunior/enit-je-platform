import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';

export default function AdminProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/progress/all').then(({ data }) => setProgress(data.progress)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? progress : progress.filter((p) => p.status === filter);

  const statusBadge = (s) => {
    const map = { enrolled: 'badge-yellow', in_progress: 'badge-teal', completed: 'badge-green' };
    return <span className={`badge ${map[s] || 'badge-navy'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-navy-900">Progress Overview</h2>
        <p className="text-slate-500 text-sm mt-0.5">All members' training progress</p>
      </div>

      <div className="flex gap-2 mb-5">
        {['all', 'enrolled', 'in_progress', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-navy-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Member', 'Training', 'Category', 'Progress', 'Status', 'Enrolled'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-navy-900">{p.user?.firstName} {p.user?.lastName}</p>
                      <p className="text-xs text-slate-400">{p.user?.department}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{p.training?.title}</td>
                  <td className="px-4 py-3"><span className="badge badge-navy">{p.training?.category}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-32">
                      <div className="progress-bar flex-1">
                        <div className="progress-fill" style={{ width: `${p.percentageComplete}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-navy-900 w-8 text-right">{p.percentageComplete}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(p.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-slate-400">No progress records found.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
