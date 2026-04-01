import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [userProgress, setUserProgress] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await api.get('/users');
    setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openDetail = async (user) => {
    setSelected(user);
    const { data } = await api.get(`/users/${user._id}`);
    setUserProgress(data.progress);
  };

  const toggleStatus = async (id) => {
    await api.put(`/users/${id}/toggle-status`);
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const avgProgress = userProgress.length
    ? Math.round(userProgress.reduce((s, p) => s + p.percentageComplete, 0) / userProgress.length)
    : 0;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy-900">Members</h2>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} registered members</p>
        </div>
        <input className="input max-w-xs" placeholder="Search members…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
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
                {['Member', 'Email', 'Department', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">{u.firstName[0]}{u.lastName[0]}</span>
                      </div>
                      <span className="font-medium text-navy-900">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500">{u.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-teal' : 'badge-navy'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-ghost py-1 px-3 text-xs" onClick={() => openDetail(u)}>View</button>
                      <button
                        className={`py-1 px-3 text-xs rounded-xl font-semibold transition-colors ${
                          u.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        onClick={() => toggleStatus(u._id)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-slate-400">No members found.</p>
          )}
        </div>
      )}

      {/* User detail modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setUserProgress([]); }}
        title="Member Details" maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-navy-900 flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">
                  {selected.firstName[0]}{selected.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-navy-900 text-lg">
                  {selected.firstName} {selected.lastName}
                </h3>
                <p className="text-slate-500 text-sm">{selected.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`badge ${selected.role === 'admin' ? 'badge-teal' : 'badge-navy'}`}>{selected.role}</span>
                  {selected.department && <span className="badge badge-navy">{selected.department}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Enrolled', value: userProgress.length },
                { label: 'Completed', value: userProgress.filter((p) => p.status === 'completed').length },
                { label: 'Avg Progress', value: `${avgProgress}%` },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="font-display font-bold text-xl text-navy-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {userProgress.length > 0 && (
              <div>
                <h4 className="font-semibold text-navy-900 text-sm mb-3">Training Progress</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {userProgress.map((p) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-navy-900 truncate">{p.training?.title}</span>
                          <span className="text-slate-400 ml-2 flex-shrink-0">{p.percentageComplete}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${p.percentageComplete}%` }} />
                        </div>
                      </div>
                      <span className={`badge flex-shrink-0 ${
                        p.status === 'completed' ? 'badge-green' : p.status === 'in_progress' ? 'badge-teal' : 'badge-yellow'
                      }`}>{p.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
