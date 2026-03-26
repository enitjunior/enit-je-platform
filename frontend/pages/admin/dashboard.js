import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import api from '../../lib/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/admin').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout requiredRole="admin">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-900 border-t-teal-je rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const categoryLabels = Object.keys(stats?.enrollmentsByCategory || {});
  const categoryData = Object.values(stats?.enrollmentsByCategory || {});

  const monthlyLabels = (stats?.monthlyEnrollments || []).map(
    (d) => `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`
  );
  const monthlyCounts = (stats?.monthlyEnrollments || []).map((d) => d.count);

  return (
    <DashboardLayout requiredRole="admin">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Members" value={stats?.totalUsers} icon="👥" color="navy" />
        <StatCard label="Active Trainings" value={stats?.totalTrainings} icon="📚" color="teal" />
        <StatCard label="Completions" value={stats?.completedTrainings} icon="✅" color="green" />
        <StatCard label="Pending Proposals" value={stats?.pendingProposals} icon="💡" color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Monthly enrollments line chart */}
        <div className="card xl:col-span-2">
          <h2 className="font-display font-bold text-navy-900 text-base mb-4">Monthly Enrollments</h2>
          <Line
            data={{
              labels: monthlyLabels.length ? monthlyLabels : ['No data'],
              datasets: [{
                label: 'Enrollments',
                data: monthlyCounts.length ? monthlyCounts : [0],
                borderColor: '#3cbfbf',
                backgroundColor: 'rgba(60,191,191,0.12)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1d2d4e',
                pointRadius: 4,
              }],
            }}
            options={{
              responsive: true, plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            }}
          />
        </div>

        {/* Category doughnut */}
        <div className="card">
          <h2 className="font-display font-bold text-navy-900 text-base mb-4">Enrollments by Category</h2>
          {categoryLabels.length > 0 ? (
            <Doughnut
              data={{
                labels: categoryLabels,
                datasets: [{
                  data: categoryData,
                  backgroundColor: ['#1d2d4e', '#3cbfbf', '#7c3aed', '#db2777', '#059669', '#d97706', '#6b7280'],
                  borderWidth: 0,
                }],
              }}
              options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } } }}
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No enrollment data yet</div>
          )}
        </div>
      </div>

      {/* Bar chart: category breakdown */}
      <div className="card">
        <h2 className="font-display font-bold text-navy-900 text-base mb-4">Category Breakdown</h2>
        <Bar
          data={{
            labels: categoryLabels.length ? categoryLabels : ['No data'],
            datasets: [{
              label: 'Enrollments',
              data: categoryData.length ? categoryData : [0],
              backgroundColor: '#1d2d4e',
              borderRadius: 6,
              hoverBackgroundColor: '#3cbfbf',
            }],
          }}
          options={{
            responsive: true, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          }}
        />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-5 mt-6">
        {[
          { label: 'Total Enrollments', value: stats?.totalEnrollments, icon: '📋' },
          { label: 'In Progress', value: stats?.inProgressTrainings, icon: '🔄' },
          { label: 'Total Proposals', value: stats?.totalProposals, icon: '📝' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className="font-display font-bold text-xl text-navy-900">{s.value ?? 0}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
