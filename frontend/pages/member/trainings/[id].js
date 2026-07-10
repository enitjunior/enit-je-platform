import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../lib/api';

const LEVEL_COLOR = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' };

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
      setError('Failed to load training.');
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
      setError(err.response?.data?.message || 'Enrollment failed.');
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
      setError(err.response?.data?.message || 'Update failed.');
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
        <span className="text-4xl block mb-3">⚠️</span>
        <p>{error || 'Training not found.'}</p>
        <Link href="/member/trainings" className="btn-outline mt-4 inline-block">Back to Trainings</Link>
      </div>
    </DashboardLayout>
  );

  const pct = progress?.percentageComplete ?? 0;

  return (
    <DashboardLayout requiredRole="member">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/member/trainings" className="hover:text-navy-900 transition-colors">Trainings</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium truncate">{training.title}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
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

            <div className="flex gap-3 mt-5 flex-wrap">
              {training.videoUrl && (
                <a
                  href={training.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-teal"
                >
                  Watch Video
                </a>
              )}

              {training.videoLink && (
                <a
                  href={training.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-teal"
                >
                  Open the Link
                </a>
              )}

              {training.pdfUrl && (
                <a
                  href={training.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  View PDF
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>⏱</span>
                <span><strong className="text-navy-900">{training.duration}h</strong> total</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>📦</span>
                <span><strong className="text-navy-900">{training.modules?.length || 0}</strong> modules</span>
              </div>
              {training.instructor && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>👤</span>
                  <span><strong className="text-navy-900">{training.instructor}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>👥</span>
                <span><strong className="text-navy-900">{training.enrolledCount}</strong> enrolled</span>
              </div>
            </div>
          </div>

          {training.modules?.length > 0 && (
            <div className="card">
              <h2 className="font-display font-bold text-navy-900 text-lg mb-4">Course Modules</h2>
              <div className="space-y-3">
                {training.modules.sort((a, b) => a.order - b.order).map((mod, idx) => {
                  const done = isModuleDone(idx);
                  const isUpdating = updatingModule === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${done ? 'border-teal-je/30 bg-teal-je/5' : 'border-slate-100 bg-slate-50/50'}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${done ? 'bg-teal-je text-white' : 'bg-slate-200 text-slate-500'}`}>
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
                      {progress ? (
                        <button
                          onClick={() => toggleModule(idx)}
                          disabled={isUpdating}
                          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${done ? 'bg-teal-je/15 text-teal-dark hover:bg-teal-je/25' : 'bg-navy-900 text-white hover:bg-navy-700'}`}
                        >
                          {isUpdating ? '…' : done ? 'Undo' : 'Mark Done'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Enroll to track</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card">
            {progress ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-navy-900">Your Progress</h3>
                  <span className={`badge ${progress.status === 'completed' ? 'badge-green' : progress.status === 'in_progress' ? 'badge-teal' : 'badge-yellow'}`}>
                    {progress.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-center py-6">
                  <div className="relative w-28 h-28 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3cbfbf" strokeWidth="2.5"
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
                    {progress.completedModules?.length || 0} of {training.modules?.length || 0} modules done
                  </p>
                </div>
                {progress.status === 'completed' && (
                  <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                    <span className="text-2xl block mb-1">🎉</span>
                    <p className="text-green-700 text-sm font-semibold">Training completed!</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      {new Date(progress.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="mt-4 text-xs text-slate-400 text-center">
                  Enrolled {new Date(progress.enrolledAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-900 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="font-display font-bold text-navy-900 text-lg mb-2">Start Learning</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Enroll to track your progress and complete modules.
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-teal w-full py-3"
                >
                  {enrolling ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enrolling…
                    </span>
                  ) : 'Enroll Now'}
                </button>
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-display font-semibold text-navy-900 text-sm">Training Info</h3>
            {[
              { label: 'Category', value: training.category },
              { label: 'Level', value: training.level },
              { label: 'Duration', value: `${training.duration} hours` },
              { label: 'Modules', value: training.modules?.length || 0 },
              { label: 'Students', value: training.enrolledCount },
              { label: 'Completions', value: training.completedCount },
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