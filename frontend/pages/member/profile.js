import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';

const DEPARTMENTS = ['IT', 'Engineering', 'Design', 'Marketing', 'Finance', 'Management', 'Other'];

// ── Constants for the crop canvas ────────────────────────────────────────────
const CROP_SIZE = 280;          // canvas display size (px)
const CROP_RADIUS = CROP_SIZE / 2 - 6;

// ── ImageCropper modal ────────────────────────────────────────────────────────
function ImageCropper({ src, onApply, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);
  const dragRef   = useRef(null);

  const [loaded,   setLoaded]   = useState(false);
  const [scale,    setScale]    = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });

  // Clamp so the image always covers the circle
  const clamp = useCallback((ox, oy, s) => {
    const img = imgRef.current;
    if (!img) return { x: ox, y: oy };
    const w  = img.width  * s;
    const h  = img.height * s;
    const cx = CROP_SIZE  / 2;
    const cy = CROP_SIZE  / 2;
    const r  = CROP_RADIUS;
    return {
      x: Math.min(cx - r, Math.max(cx + r - w, ox)),
      y: Math.min(cy - r, Math.max(cy + r - h, oy)),
    };
  }, []);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      const s = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
      setMinScale(s);
      setScale(s);
      setOffset({
        x: (CROP_SIZE - img.width  * s) / 2,
        y: (CROP_SIZE - img.height * s) / 2,
      });
      setLoaded(true);
    };
  }, [src]);

  // Redraw canvas whenever scale/offset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !loaded) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    // 1. Draw image
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);

    // 2. Dark overlay with circular hole (evenodd fill)
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.beginPath();
    ctx.rect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();

    // 3. Teal circle border
    ctx.strokeStyle = '#3cbfbf';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, offset, loaded]);

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const { sx, sy, ox, oy } = dragRef.current;
    setOffset(clamp(ox + e.clientX - sx, oy + e.clientY - sy, scale));
  };
  const onMouseUp = ()  => { dragRef.current = null; };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragRef.current = { sx: t.clientX, sy: t.clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    const { sx, sy, ox, oy } = dragRef.current;
    setOffset(clamp(ox + t.clientX - sx, oy + t.clientY - sy, scale));
  };

  // ── Zoom slider ─────────────────────────────────────────────────────────────
  const handleZoom = (e) => {
    const s = parseFloat(e.target.value);
    setScale(s);
    setOffset((prev) => clamp(prev.x, prev.y, s));
  };

  // ── Apply: export circular crop at 300×300 ──────────────────────────────────
  const handleApply = () => {
    const OUT = 300;
    const out = document.createElement('canvas');
    out.width  = OUT;
    out.height = OUT;
    const ctx = out.getContext('2d');
    ctx.beginPath();
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
    ctx.clip();
    const ratio = OUT / CROP_SIZE;
    ctx.drawImage(
      imgRef.current,
      offset.x * ratio,
      offset.y * ratio,
      imgRef.current.width  * scale * ratio,
      imgRef.current.height * scale * ratio,
    );
    onApply(out.toDataURL('image/jpeg', 0.88));
  };

  const pct = loaded ? Math.round((scale / minScale - 1) / 2 * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        {/* Header */}
        <div>
          <h3 className="font-semibold text-navy-900 text-lg">Recadrer la photo</h3>
          <p className="text-xs text-gray-400 mt-0.5">Faites glisser pour repositionner · utilisez le curseur pour zoomer</p>
        </div>

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CROP_SIZE}
            height={CROP_SIZE}
            style={{ width: CROP_SIZE, height: CROP_SIZE, borderRadius: 12 }}
            className="cursor-grab active:cursor-grabbing select-none bg-gray-100"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />
        </div>

        {/* Zoom control */}
        <div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              {/* minus icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Zoom
            </span>
            <span className="font-medium text-teal-dark">{pct}%</span>
            {/* plus icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step={0.001}
            value={scale}
            onChange={handleZoom}
            disabled={!loaded}
            className="w-full h-2 accent-teal-500 cursor-pointer"
            style={{ accentColor: '#3cbfbf' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={handleApply} disabled={!loaded} className="btn-teal flex-1">
            Appliquer
          </button>
          <button onClick={onCancel} className="btn-ghost flex-1">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [cropSrc,    setCropSrc]    = useState(null);   // raw src for cropper
  const [stats,      setStats]      = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [form, setForm] = useState({
    firstName:  '',
    lastName:   '',
    department: '',
    avatar:     '',
  });

  useEffect(() => {
    api.get('/stats/me')
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoadingStats(false));
  }, []);

  const fileRef = useRef(null);

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials  = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}`;

  const openEdit = () => {
    setForm({
      firstName:  user?.firstName  || '',
      lastName:   user?.lastName   || '',
      department: user?.department || '',
      avatar:     user?.avatar     || '',
    });
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const closeEdit = () => setEditing(false);

  // File selected → open cropper
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';            // reset so same file can be re-selected
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
  };

  // Cropper "Apply" → store result in form
  const handleCropApply = (dataUrl) => {
    setForm((f) => ({ ...f, avatar: dataUrl }));
    setCropSrc(null);
  };

  const removeAvatar = () => setForm((f) => ({ ...f, avatar: '' }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Le prénom et le nom sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put('/auth/me', {
        firstName:  form.firstName.trim(),
        lastName:   form.lastName.trim(),
        department: form.department,
        avatar:     form.avatar,
      });
      await refreshUser();
      setSuccess('Profil mis à jour avec succès !');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de l\'enregistrement des modifications.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout requiredRole="member">

      {/* Cropper modal (rendered outside layout flow) */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onApply={handleCropApply}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="p-7 space-y-6 max-w-3xl">

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-teal-je/10 border border-teal-je/30 text-teal-dark rounded-xl px-5 py-3 text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {success}
          </div>
        )}

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-teal-je/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-je flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-800">{fullName}</h2>
              <span className="inline-block mt-1 bg-teal-je/10 text-teal-je text-xs px-3 py-1 rounded-full font-medium capitalize">
                {user?.role}
              </span>
              <p className="text-sm text-gray-400 mt-2">ENIT Junior Entreprise · Tunis, Tunisia</p>
            </div>
            {!editing && (
              <button onClick={openEdit}
                className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Modifier le profil
              </button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-6">
            <h3 className="text-base font-semibold text-gray-800 border-b pb-3">Modifier le profil</h3>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {/* Avatar upload */}
            <div>
              <p className="label">Photo de profil</p>
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-je/40" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-teal-je flex items-center justify-center text-white text-xl font-bold select-none">
                      {`${(form.firstName?.[0] || '').toUpperCase()}${(form.lastName?.[0] || '').toUpperCase()}` || initials}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="btn-outline text-xs px-3 py-2">
                    {form.avatar ? 'Changer la photo' : 'Importer une photo'}
                  </button>
                  {form.avatar && (
                    <button type="button" onClick={removeAvatar}
                      className="text-xs px-3 py-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
                      Supprimer
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  className="hidden" onChange={handleFileChange} />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">JPG, PNG ou GIF · max 5 Mo · recadrer et zoomer après l'importation</p>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prénom</label>
                <input className="input" value={form.firstName} placeholder="Prénom"
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Nom</label>
                <input className="input" value={form.lastName} placeholder="Nom"
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="label">Département</label>
              <select className="input" value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                <option value="">Sélectionnez votre département</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-teal disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
              <button onClick={closeEdit} disabled={saving} className="btn-ghost">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Info + Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 mb-4">Informations personnelles</h3>
            <Info label="Nom complet"   value={fullName} />
            <Info label="Email"       value={user?.email} />
            <Info label="Département"  value={user?.department || 'Non défini'} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 mb-4">Statistiques d'apprentissage</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox number={stats?.totalEnrolled || 0}  label="Inscrit"     />
              <StatBox number={stats?.completed || 0}  label="Terminé"    />
              <StatBox number={stats?.inProgress || 0}  label="En cours"  />
              <StatBox number={`${stats?.totalHoursLearned || 0}h`} label="Heures apprises"/>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value || '—'}</p>
    </div>
  );
}

function StatBox({ number, label }) {
  return (
    <div className="bg-teal-je/10 rounded-xl p-4 text-center">
      <div className="text-xl font-semibold text-teal-je">{number}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}