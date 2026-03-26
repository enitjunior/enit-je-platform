import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    const { data } = await api.get('/proposals', { params });
    setProposals(data.proposals);
    setLoading(false);
  };

  useEffect(() => { fetchProposals(); }, [filter]);

  const handleReview = async (status) => {
    setSaving(true);
    try {
      await api.put(`/proposals/${selected._id}/review`, { status, reviewNote });
      setSelected(null);
      setReviewNote('');
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed.');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (s) => {
    const map = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-navy'}`}>{s}</span>;
  };

  const counts = {
    all: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-navy-900">Training Proposals</h2>
        <p className="text-slate-500 text-sm mt-0.5">Review and manage member-submitted proposals</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-navy-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}>
            {f} {counts[f] > 0 && <span className="ml-1 opacity-60">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <div key={p._id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display font-semibold text-navy-900 text-base">{p.title}</h3>
                  {statusBadge(p.status)}
                  <span className="badge badge-navy">{p.category}</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-2">{p.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>By {p.submittedBy?.firstName} {p.submittedBy?.lastName}</span>
                  <span>·</span>
                  <span>{p.submittedBy?.department}</span>
                  <span>·</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  {p.suggestedDuration && <><span>·</span><span>{p.suggestedDuration}h suggested</span></>}
                </div>
                {p.reviewNote && (
                  <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <span className="font-medium">Review note:</span> {p.reviewNote}
                  </div>
                )}
              </div>
              {p.status === 'pending' && (
                <button className="btn-outline text-xs py-1.5 px-3 flex-shrink-0"
                  onClick={() => { setSelected(p); setReviewNote(''); }}>
                  Review
                </button>
              )}
            </div>
          ))}
          {proposals.length === 0 && (
            <div className="card text-center py-12 text-slate-400">No proposals found.</div>
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review Proposal">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-navy-900 mb-1">{selected.title}</h3>
              <p className="text-sm text-slate-600 mb-2">{selected.description}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Justification:</span> {selected.justification}</p>
              {selected.expectedBenefits && (
                <p className="text-sm text-slate-700 mt-1"><span className="font-medium">Expected benefits:</span> {selected.expectedBenefits}</p>
              )}
            </div>
            <div>
              <label className="label">Review note (optional)</label>
              <textarea className="input h-20 resize-none" placeholder="Add a note for the member…"
                value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn-teal flex-1" disabled={saving} onClick={() => handleReview('approved')}>
                ✓ Approve
              </button>
              <button className="btn-danger flex-1" disabled={saving} onClick={() => handleReview('rejected')}>
                ✕ Reject
              </button>
              <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
