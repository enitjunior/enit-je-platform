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
          Good to see you, {user?.firstName}! 👋
        </h2>
        <p className="text-slate-500 mt-1">Here's your learning progress at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard label="Enrolled" value={stats?.totalEnrolled} icon="📚" color="navy" />
        <StatCard label="Completed" value={stats?.completed} icon="🎓" color="green" />
        <StatCard label="In Progress" value={stats?.inProgress} icon="🔄" color="teal" />
        <StatCard label="Hours Learned" value={`${stats?.totalHoursLearned}h`} icon="⏱" color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Category breakdown bar */}
        <div className="card xl:col-span-2">
          <h3 className="font-display font-bold text-navy-900 text-base mb-4">Progress by Category</h3>
          {catLabels.length > 0 ? (
            <Bar
              data={{
                labels: catLabels,
                datasets: [
                  { label: 'Completed', data: catCompleted, backgroundColor: '#3cbfbf', borderRadius: 4 },
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
              <span className="text-3xl">📭</span>
              <p className="text-sm">No trainings enrolled yet.</p>
              <Link href="/member/trainings" className="btn-teal text-xs py-1.5 px-3">Browse Trainings</Link>
            </div>
          )}
        </div>

        {/* Completion doughnut */}
        <div className="card flex flex-col">
          <h3 className="font-display font-bold text-navy-900 text-base mb-4">Completion Overview</h3>
          {stats?.totalEnrolled > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: ['Completed', 'In Progress', 'Enrolled'],
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
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-navy-900 text-base">Recent Activity</h3>
            <Link href="/member/progress" className="text-sm text-teal-dark hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((p) => (
              <div key={p._id} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-navy-900/8 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {p.status === 'completed' ? '✅' : p.status === 'in_progress' ? '🔄' : '📋'}
                  </span>
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
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <p className="font-semibold text-navy-900">Browse Trainings</p>
            <p className="text-xs text-slate-500 mt-0.5">Explore and enroll in new courses</p>
          </div>
        </Link>
        <Link href="/member/proposals" className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-je/15 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <p className="font-semibold text-navy-900">Submit Proposal</p>
            <p className="text-xs text-slate-500 mt-0.5">Suggest a new training topic</p>
          </div>
        </Link>
      </div>
    </DashboardLayout>
  );
}
