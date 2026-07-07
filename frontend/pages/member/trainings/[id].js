import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../lib/api';

const LEVEL_COLOR = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' };
const STATUS_LABELS = { in_progress: 'En cours', completed: 'Terminé', enrolled: 'Inscrit' };

export default function TrainingDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [training, setTraining] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [updatingModule, setUpdatingModule] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/trainings/${id}`);
      setTraining(data.training);
      setProgress(data.userProgress);
    } catch {
      setError('Échec du chargement de la formation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/progress/enroll/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de l\'inscription.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = async (moduleIndex) => {
    if (!progress) return;
    setUpdatingModule(moduleIndex);
    try {
      const { data } = await api.put(`/progress/${id}/module/${moduleIndex}`);
      setProgress(data.progress);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la mise à jour.');
    } finally {
      setUpdatingModule(null);
    }
  };

  const isModuleDone = (index) =>
    progress?.completedModules?.some((m) => m.moduleIndex === index);

  if (loading) return (
    <DashboardLayout requiredRole="member">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (error || !training) return (
    <DashboardLayout requiredRole="member">
      <div className="card text-center py-16 text-slate-400">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-amber-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p>{error || 'Formation introuvable.'}</p>
        <Link href="/member/trainings" className="btn-outline mt-4 inline-block">← Retour aux formations</Link>
      </div>
    </DashboardLayout>
  );

  const pct = progress?.percentageComplete ?? 0;

  return (
    <DashboardLayout requiredRole="member">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/member/trainings" className="hover:text-navy-900 transition-colors">Formations</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium truncate">{training.title}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ── Left: Main content ─────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Header card */}
          <div className="card">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="badge badge-navy">{training.category}</span>
              <span className={`badge ${LEVEL_COLOR[training.level] || 'badge-navy'}`}>{training.level}</span>
              {training.tags?.map((tag) => (
                <span key={tag} className="badge badge-teal">#{tag}</span>
              ))}
            </div>

            <h1 className="font-display font-bold text-2xl text-navy-900 mb-3 leading-tight">
              {training.title}
            </h1>
            <p className="text-slate-600 leading-relaxed">{training.description}</p>

            <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span><strong className="text-navy-900">{training.duration}h</strong> au total</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <span><strong className="text-navy-900">{training.modules?.length || 0}</strong> modules</span>
              </div>
              {training.instructor && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span><strong className="text-navy-900">{training.instructor}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span><strong className="text-navy-900">{training.enrolledCount}</strong> inscrits</span>
              </div>
            </div>
          </div>

          {/* Modules */}
          {training.modules?.length > 0 && (
            <div className="card">
              <h2 className="font-display font-bold text-navy-900 text-lg mb-4">Modules du cours</h2>
              <div className="space-y-3">
                {training.modules.sort((a, b) => a.order - b.order).map((mod, idx) => {
                  const done = isModuleDone(idx);
                  const isUpdating = updatingModule === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        done
                          ? 'border-teal-je/30 bg-teal-je/5'
                          : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      {/* Module number / check */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${
                          done ? 'bg-teal-je text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {done ? '✓' : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${done ? 'text-teal-dark line-through' : 'text-navy-900'}`}>
                          {mod.title}
                        </p>
                        {mod.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{mod.description}</p>
                        )}
                      </div>

                      {/* Toggle button (only if enrolled) */}
                      {progress ? (
                        <button
                          onClick={() => toggleModule(idx)}
                          disabled={isUpdating}
                          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            done
                              ? 'bg-teal-je/15 text-teal-dark hover:bg-teal-je/25'
                              : 'bg-navy-900 text-white hover:bg-navy-700'
                          }`}
                        >
                          {isUpdating ? '…' : done ? 'Annuler' : 'Marquer terminé'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Inscrivez-vous pour suivre</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ─────────────────────────────────── */}
        <div className="space-y-5">
          {/* Progress / Enroll card */}
          <div className="card">
            {progress ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-navy-900">Votre progression</h3>
                  <span className={`badge ${
                    progress.status === 'completed' ? 'badge-green'
                    : progress.status === 'in_progress' ? 'badge-teal'
                    : 'badge-yellow'
                  }`}>
                    {STATUS_LABELS[progress.status] || progress.status}
                  </span>
                </div>

                {/* Big percentage */}
                <div className="text-center py-6">
                  <div className="relative w-28 h-28 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9"
                        fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.9"
                        fill="none" stroke="#3cbfbf" strokeWidth="2.5"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display font-bold text-2xl text-navy-900">{pct}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">
                    {progress.completedModules?.length || 0} sur {training.modules?.length || 0} modules terminés
                  </p>
                </div>

                {progress.status === 'completed' && (
                  <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1 text-green-600"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                    <p className="text-green-700 text-sm font-semibold">Formation terminée !</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      {new Date(progress.completedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-slate-400 text-center">
                  Inscrit le {new Date(progress.enrolledAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-900 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <h3 className="font-display font-bold text-navy-900 text-lg mb-2">Commencez à apprendre</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Inscrivez-vous pour suivre votre progression et terminer les modules.
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-teal w-full py-3"
                >
                  {enrolling ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Inscription…
                    </span>
                  ) : 'S\'inscrire maintenant'}
                </button>
              </div>
            )}
          </div>

          {/* Training info card */}
          <div className="card space-y-3">
            <h3 className="font-display font-semibold text-navy-900 text-sm">Informations sur la formation</h3>
            {[
              { label: 'Catégorie', value: training.category },
              { label: 'Niveau', value: training.level },
              { label: 'Durée', value: `${training.duration} heures` },
              { label: 'Modules', value: training.modules?.length || 0 },
              { label: 'Étudiants', value: training.enrolledCount },
              { label: 'Validations', value: training.completedCount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-navy-900">{value}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
