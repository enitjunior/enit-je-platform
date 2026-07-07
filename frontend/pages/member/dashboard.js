import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function MemberDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/me').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout requiredRole="member">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const catLabels = Object.keys(stats?.categoryProgress || {});
  const catCompleted = catLabels.map((k) => stats.categoryProgress[k].completed);
  const catTotal = catLabels.map((k) => stats.categoryProgress[k].total);

  return (
    <DashboardLayout requiredRole="member">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-3xl text-navy-900">
          Bienvenue, {user?.firstName} !
        </h2>
        <p className="text-slate-500 mt-1">Voici un aperçu de votre progression.</p>
      </div>
 
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard label="Inscrit" value={stats?.totalEnrolled} color="navy" />
        <StatCard label="Terminé" value={stats?.completed} color="green" />
        <StatCard label="En cours" value={stats?.inProgress} color="teal" />
        <StatCard label="Heures apprises" value={`${stats?.totalHoursLearned}h`} color="amber" />
      </div>
 
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Category breakdown bar */}
        <div className="card xl:col-span-2">
          <h3 className="font-display font-bold text-navy-900 text-base mb-4">Progression par catégorie</h3>
          {catLabels.length > 0 ? (
            <Bar
               data={{
                 labels: catLabels,
                 datasets: [
                   { label: 'Terminé', data: catCompleted, backgroundColor: '#3cbfbf', borderRadius: 4 },
                   { label: 'Total', data: catTotal, backgroundColor: '#e2e8f0', borderRadius: 4 },
                 ],
               }}
               options={{
                 responsive: true, plugins: { legend: { position: 'bottom' } },
                 scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
               }}
             />
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-3">
              <p className="text-sm">Aucune formation inscrite pour l'instant.</p>
              <Link href="/member/trainings" className="btn-teal text-xs py-1.5 px-3">Parcourir les formations</Link>
            </div>
          )}
        </div>
 
        {/* Completion doughnut */}
        <div className="card flex flex-col">
          <h3 className="font-display font-bold text-navy-900 text-base mb-4">Vue d'ensemble</h3>
          {stats?.totalEnrolled > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: ['Terminé', 'En cours', 'Inscrit'],
                  datasets: [{
                    data: [
                      stats?.completed,
                      stats?.inProgress,
                      stats?.totalEnrolled - stats?.completed - stats?.inProgress,
                    ],
                    backgroundColor: ['#059669', '#3cbfbf', '#e2e8f0'],
                    borderWidth: 0,
                  }],
                }}
                options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } } } }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>
 
      {/* Recent activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-navy-900 text-base">Activité récente</h3>
            <Link href="/member/progress" className="text-sm text-teal-dark hover:underline font-medium">Tout voir</Link>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((p) => (
              <div key={p._id} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-navy-900/8 flex items-center justify-center flex-shrink-0 text-navy-900">
                  {p.status === 'completed' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : p.status === 'in_progress' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-dark"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 text-sm truncate">{p.training?.title}</p>
                  <p className="text-xs text-slate-400">{p.training?.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-navy-900 text-sm">{p.percentageComplete}%</p>
                  <div className="w-16 progress-bar mt-1">
                    <div className="progress-fill" style={{ width: `${p.percentageComplete}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/member/trainings" className="card-hover flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div>
            <p className="font-semibold text-navy-900">Parcourir les formations</p>
            <p className="text-xs text-slate-500 mt-0.5">Explorer et s'inscrire à de nouveaux cours</p>
          </div>
        </Link>
        <Link href="/member/proposals" className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-je/15 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-dark"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>
          </div>
          <div>
            <p className="font-semibold text-navy-900">Soumettre une proposition</p>
            <p className="text-xs text-slate-500 mt-0.5">Suggérer un nouveau sujet de formation</p>
          </div>
        </Link>
      </div>
    </DashboardLayout>

  );
}
