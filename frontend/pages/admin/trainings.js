import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';

const CATEGORIES = ['Technical', 'Management', 'Design', 'Marketing', 'Finance', 'Soft Skills', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = {
  title: '', description: '', category: 'Technical', level: 'Beginner',
  duration: '', instructor: '', tags: '', isPublished: true, videoLink: '',
};

export default function AdminTrainings() {
  const [trainings, setTrainings]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);

  const [videoFile, setVideoFile]           = useState(null);
  const [pdfFile, setPdfFile]               = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf]     = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    const { data } = await api.get('/trainings');
    setTrainings(data.trainings);
    setLoading(false);
  };

  useEffect(() => { fetchTrainings(); }, []);

  const openCreate = () => {
    setEditTarget(null); setForm(emptyForm);
    setVideoFile(null); setPdfFile(null);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditTarget(t);
    setForm({
      title: t.title, description: t.description, category: t.category,
      level: t.level, duration: t.duration, instructor: t.instructor || '',
      tags: t.tags?.join(', ') || '', isPublished: t.isPublished,videoLink: t.videoLink || '',
    });
    setVideoFile(null); setPdfFile(null);
    setModalOpen(true);
  };

  const uploadFileToTraining = async (trainingId, file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/trainings/${trainingId}/upload?type=${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      let savedTraining;
      if (editTarget) {
        const { data } = await api.put(`/trainings/${editTarget._id}`, payload);
        savedTraining = data.training;
      } else {
        const { data } = await api.post('/trainings', payload);
        savedTraining = data.training;
      }
      if (videoFile) {
        setUploadingVideo(true);
        await uploadFileToTraining(savedTraining._id, videoFile, 'video');
        setUploadingVideo(false);
      }
      if (pdfFile) {
        setUploadingPdf(true);
        await uploadFileToTraining(savedTraining._id, pdfFile, 'pdf');
        setUploadingPdf(false);
      }
      setModalOpen(false);
      fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
      setUploadingVideo(false);
      setUploadingPdf(false);
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
                {['Title', 'Category', 'Level', 'Duration', 'Enrolled', 'Training Video','Video Link', 'Training PDF', 'Status', 'Actions'].map((h) => (
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
  {t.videoUrl ? (
    <a href={t.videoUrl} target="_blank" rel="noopener noreferrer">
      <span className="badge badge-navy">🎬 Video</span>
    </a>
  ) : (
    <span className="text-slate-300">—</span>
  )}
</td>
<td className="px-4 py-3">
  {t.videoLink ? (
    <a href={t.videoLink} target="_blank" rel="noopener noreferrer">
      <span className="badge badge-teal">🔗 Link</span>
    </a>
  ) : (
    <span className="text-slate-300">—</span>
  )}
</td>
<td className="px-4 py-3">
  {t.pdfUrl ? (
    <a href={t.pdfUrl} target="_blank" rel="noopener noreferrer">
      <span className="badge badge-green">📄 PDF</span>
    </a>
  ) : (
    <span className="text-slate-300">—</span>
  )}
</td>
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
          {/* Video Link */}
<div>
  <label className="label">Video Link (YouTube ou autre)</label>
  <input
    className="input"
    placeholder="https://youtube.com/watch?v=..."
    value={form.videoLink || ''}
    onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
  />
  <p className="text-xs text-slate-400 mt-1">
  </p>
</div>

          {/* Upload Vidéo */}
          <div>
            <label className="label">Training Video</label>
            {editTarget?.videoUrl && (
              <p className="text-xs text-teal-600 mb-1">✅ Vidéo déjà uploadée. Sélectionne un nouveau fichier pour la remplacer.</p>
            )}
            <input type="file" accept="video/*" className="input py-2"
              onChange={(e) => setVideoFile(e.target.files[0] || null)} />
            {uploadingVideo && <p className="text-xs text-slate-400 mt-1">Upload de la vidéo en cours…</p>}
          </div>

          {/* Upload PDF */}
          <div>
            <label className="label">Training PDF</label>
            {editTarget?.pdfUrl && (
              <p className="text-xs text-teal-600 mb-1">✅ PDF déjà uploadé. Sélectionne un nouveau fichier pour le remplacer.</p>
            )}
            <input type="file" accept="application/pdf" className="input py-2"
              onChange={(e) => setPdfFile(e.target.files[0] || null)} />
            {uploadingPdf && <p className="text-xs text-slate-400 mt-1">Upload du PDF en cours…</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 accent-teal-je" />
            <label htmlFor="published" className="text-sm text-slate-700">Publish immediately</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-teal" disabled={saving || uploadingVideo || uploadingPdf}>
              {saving ? 'Saving…' : uploadingVideo ? 'Uploading video…' : uploadingPdf ? 'Uploading PDF…' : editTarget ? 'Save Changes' : 'Create Training'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

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