import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import TrainingCard from '../../../components/ui/TrainingCard';
import api from '../../../lib/api';

const CATEGORIES = ['All', 'Technical', 'Management', 'Design', 'Marketing', 'Finance', 'Soft Skills', 'Other'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CAT_LABELS = { All: 'Toutes', Technical: 'Technique', Management: 'Management', Design: 'Design', Marketing: 'Marketing', Finance: 'Finance', 'Soft Skills': 'Soft Skills', Other: 'Autre' };
const LVL_LABELS = { All: 'Tous', Beginner: 'Débutant', Intermediate: 'Intermédiaire', Advanced: 'Avancé' };

export default function MemberTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        api.get('/trainings'),
        api.get('/progress/me'),
      ]);
      setTrainings(tRes.data.trainings);
      const map = {};
      pRes.data.progress.forEach((p) => { map[p.training._id] = p; });
      setProgressMap(map);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = trainings.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || t.category === category;
    const matchLevel = level === 'All' || t.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <DashboardLayout requiredRole="member">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-navy-900">Formations disponibles</h2>
        <p className="text-slate-500 text-sm mt-0.5">{trainings.length} cours disponibles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input max-w-xs" placeholder="Rechercher des formations…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c] || c}</option>)}
        </select>
        <select className="input w-auto" value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => <option key={l} value={l}>{LVL_LABELS[l] || l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <TrainingCard
              key={t._id}
              training={t}
              progress={progressMap[t._id] || null}
              href={`/member/trainings/${t._id}`}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 card text-center py-16 text-slate-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-slate-300"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Aucune formation ne correspond à vos critères.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}