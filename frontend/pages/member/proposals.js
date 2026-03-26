import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';

const CATEGORIES = ['Technical', 'Management', 'Design', 'Marketing', 'Finance', 'Soft Skills', 'Other'];

const STATUS_META = {
  pending:  { badge: 'badge-yellow', icon: '⏳', label: 'Pending Review' },
  approved: { badge: 'badge-green',  icon: '✅', label: 'Approved' },
  rejected: { badge: 'badge-red',    icon: '❌', label: 'Rejected' },
};

const emptyForm = {
  title: '', description: '', category: 'Technical',
  justification: '', expectedBenefits: '', suggestedDuration: '',
};

export default function MemberProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchProposals = async () => {
    setLoading(true);
    const { data } = await api.get('/proposals/me');
    setProposals(data.proposals);
    setLoading(false);
  };

  useEffect(() => { fetchProposals(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/proposals', {
        ...form,
        suggestedDuration: form.suggestedDuration ? Number(form.suggestedDuration) : undefined,
      });
      setModalOpen(false);
      setForm(emptyForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      fetchProposals();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
  };

  return (
    <DashboardLayout requiredRole="member">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy-900">My Proposals</h2>
          <p className="text-slate-500 text-sm mt-0.5">Suggest training topics to the admin team</p>
        </div>
        <button className="btn-teal" onClick={() => { setModalOpen(true); setError(''); }}>
          + New Proposal
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <span>✅</span>
          Proposal submitted successfully! The admin team will review it soon.
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Total Submitted', value: counts.total, icon: '📝', color: 'bg-navy-900/8' },
          { label: 'Pending Review', value: counts.pending, icon: '⏳', color: 'bg-amber-50' },
          { label: 'Approved',       value: counts.approved, icon: '✅', color: 'bg-green-50' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`card flex items-center gap-3 ${color}`}>
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-display font-bold text-xl text-navy-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Proposals list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">💡</span>
          <h3 className="font-display font-bold text-navy-900 text-lg mb-2">Share your ideas</h3>
          <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
            Have a training topic in mind? Submit a proposal and help shape the learning program!
          </p>
          <button className="btn-teal" onClick={() => setModalOpen(true)}>Submit your first proposal</button>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.pending;
            return (
              <div key={p._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display font-semibold text-navy-900 text-base">{p.title}</h3>
                      <span className={`badge ${meta.badge}`}>{meta.icon} {meta.label}</span>
                      <span className="badge badge-navy">{p.category}</span>
                    </div>

                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">{p.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Justification</p>
                        <p className="text-slate-700 text-xs leading-relaxed">{p.justification}</p>
                      </div>
                      {p.expectedBenefits && (
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Expected Benefits</p>
                          <p className="text-slate-700 text-xs leading-relaxed">{p.expectedBenefits}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3">
                      <span>Submitted {new Date(p.createdAt).toLocaleDateString()}</span>
                      {p.suggestedDuration && <span>⏱ {p.suggestedDuration}h suggested</span>}
                      {p.reviewedAt && <span>Reviewed {new Date(p.reviewedAt).toLocaleDateString()}</span>}
                    </div>

                    {/* Review note */}
                    {p.reviewNote && (
                      <div className={`mt-3 px-4 py-3 rounded-xl text-sm border ${
                        p.status === 'approved'
                          ? 'bg-green-50 border-green-100 text-green-700'
                          : 'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        <span className="font-semibold">Admin note: </span>{p.reviewNote}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Proposal Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title="Submit Training Proposal" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">Training Title <span className="text-red-400">*</span></label>
            <input
              name="title" className="input" required
              placeholder="e.g. Advanced Python for Data Science"
              value={form.title} onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category <span className="text-red-400">*</span></label>
              <select name="category" className="input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Suggested Duration (hours)</label>
              <input
                name="suggestedDuration" type="number" min="1" className="input"
                placeholder="e.g. 8"
                value={form.suggestedDuration} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea
              name="description" className="input h-24 resize-none" required
              placeholder="Describe the training content and objectives…"
              value={form.description} onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Justification <span className="text-red-400">*</span></label>
            <textarea
              name="justification" className="input h-20 resize-none" required
              placeholder="Why is this training needed? What problem does it solve?"
              value={form.justification} onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Expected Benefits</label>
            <textarea
              name="expectedBenefits" className="input h-20 resize-none"
              placeholder="What skills or outcomes will members gain?"
              value={form.expectedBenefits} onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-teal flex-1" disabled={saving}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : 'Submit Proposal'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
