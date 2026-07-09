import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';

const CATEGORIES = ['Technical', 'Management', 'Design', 'Marketing', 'Finance', 'Soft Skills', 'Other'];

const STATUS_META = {
  pending:  { badge: 'badge-yellow', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'En attente' },
  approved: { badge: 'badge-green',  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><polyline points="20 6 9 17 4 12"/></svg>, label: 'Approuvé' },
  rejected: { badge: 'badge-red',    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>, label: 'Rejeté' },
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
      setError(err.response?.data?.message || 'Échec de la soumission.');
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
          <h2 className="font-display font-bold text-2xl text-navy-900">Mes propositions</h2>
          <p className="text-slate-500 text-sm mt-0.5">Suggérez des sujets de formation à l'équipe administrative</p>
        </div>
        <button className="btn-teal" onClick={() => { setModalOpen(true); setError(''); }}>
          + Nouvelle proposition
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 inline-block"><polyline points="20 6 9 17 4 12"/></svg>
          Proposition soumise avec succès ! L'équipe administrative l'examinera bientôt.
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Total soumis', value: counts.total, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, color: 'bg-navy-900/8' },
          { label: 'En attente', value: counts.pending, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, color: 'bg-amber-50' },
          { label: 'Approuvé',       value: counts.approved, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, color: 'bg-green-50' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`card flex items-center gap-3 ${color}`}>
            <span className="text-navy-900">{icon}</span>
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-slate-300"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>
          <h3 className="font-display font-bold text-navy-900 text-lg mb-2">Partagez vos idées</h3>
          <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
            Vous avez une idée de formation ? Soumettez une proposition et aidez à façonner le programme d'apprentissage !
          </p>
          <button className="btn-teal" onClick={() => setModalOpen(true)}>Soumettre ma première proposition</button>
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
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bénéfices attendus</p>
                          <p className="text-slate-700 text-xs leading-relaxed">{p.expectedBenefits}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3">
                      <span>Soumis le {new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
                      {p.suggestedDuration && <span>{p.suggestedDuration}h suggérées</span>}
                      {p.reviewedAt && <span>Examiné le {new Date(p.reviewedAt).toLocaleDateString('fr-FR')}</span>}
                    </div>

                    {/* Review note */}
                    {p.reviewNote && (
                      <div className={`mt-3 px-4 py-3 rounded-xl text-sm border ${
                        p.status === 'approved'
                          ? 'bg-green-50 border-green-100 text-green-700'
                          : 'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        <span className="font-semibold">Note de l'admin : </span>{p.reviewNote}
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
        title="Soumettre une proposition de formation" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">Titre de la formation <span className="text-red-400">*</span></label>
            <input
              name="title" className="input" required
              placeholder="ex. Python avancé pour la Data Science"
              value={form.title} onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Catégorie <span className="text-red-400">*</span></label>
              <select name="category" className="input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Durée suggérée (heures)</label>
              <input
                name="suggestedDuration" type="number" min="1" className="input"
                placeholder="ex. 8"
                value={form.suggestedDuration} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea
              name="description" className="input h-24 resize-none" required
              placeholder="Décrivez le contenu de la formation et ses objectifs…"
              value={form.description} onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Justification <span className="text-red-400">*</span></label>
            <textarea
              name="justification" className="input h-20 resize-none" required
              placeholder="Pourquoi cette formation est-elle nécessaire ? Quel problème résout-elle ?"
              value={form.justification} onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Bénéfices attendus</label>
            <textarea
              name="expectedBenefits" className="input h-20 resize-none"
              placeholder="Quelles compétences ou quels résultats les membres vont-ils acquérir ?"
              value={form.expectedBenefits} onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-teal flex-1" disabled={saving}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Soumission…
                </span>
              ) : 'Soumettre la proposition'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
