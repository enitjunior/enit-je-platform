import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';

const CATEGORIES = ['Technical', 'Management', 'Design', 'Marketing', 'Finance', 'Soft Skills', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = {
  title: '', description: '', category: 'Technical', level: 'Beginner',
  duration: '', instructor: '', tags: '', isPublished: true,
};

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    const { data } = await api.get('/trainings');
    setTrainings(data.trainings);
    setLoading(false);
  };

  useEffect(() => { fetchTrainings(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditTarget(t);
    setForm({
      title: t.title, description: t.description, category: t.category,
      level: t.level, duration: t.duration, instructor: t.instructor || '',
      tags: t.tags?.join(', ') || '', isPublished: t.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editTarget) {
        await api.put(`/trainings/${editTarget._id}`, payload);
      } else {
        await api.post('/trainings', payload);
      }
      setModalOpen(false);
      fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/trainings/${deleteId}`);
    setDeleteId(null);
    fetchTrainings();
  };

  const filtered = trainings.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const levelColor = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy-900">Training Catalog</h2>
          <p className="text-slate-500 text-sm mt-0.5">{trainings.length} trainings available</p>
        </div>
        <button className="btn-teal" onClick={openCreate}>+ Add Training</button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input className="input max-w-sm" placeholder="Search trainings…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
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
                {['Title', 'Category', 'Level', 'Duration', 'Enrolled', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-navy-900">{t.title}</td>
                  <td className="px-4 py-3"><span className="badge badge-navy">{t.category}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${levelColor[t.level]}`}>{t.level}</span></td>
                  <td className="px-4 py-3 text-slate-500">{t.duration}h</td>
                  <td className="px-4 py-3 text-slate-500">{t.enrolledCount}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${t.isPublished ? 'badge-green' : 'badge-yellow'}`}>
                      {t.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-ghost py-1 px-3 text-xs" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn-danger py-1 px-3 text-xs" onClick={() => setDeleteId(t._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-slate-400">No trainings found.</p>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Training' : 'Add Training'} maxWidth="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" value={form.description} required
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (hours)</label>
              <input className="input" type="number" min="0" value={form.duration} required
                onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="label">Instructor</label>
              <input className="input" value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" placeholder="react, javascript, frontend" value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 accent-teal-je" />
            <label htmlFor="published" className="text-sm text-slate-700">Publish immediately</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-teal" disabled={saving}>
              {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Training'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Training">
        <p className="text-slate-600 text-sm mb-5">Are you sure? This will permanently delete the training and all related progress records.</p>
        <div className="flex gap-3">
          <button className="btn-danger" onClick={handleDelete}>Yes, delete</button>
          <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
