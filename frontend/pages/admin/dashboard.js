import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { Users, BookOpen, CheckCircle2, FileText, ClipboardList, RefreshCw, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// TODO: remplacer les clés à gauche par les vraies clés renvoyées par ton backend
// dans stats.enrollmentsByCategory (ex: si le backend renvoie "design", "finance"...)
const CELL_LABELS = {
  Design: 'Marketing',
  Finance: 'DevCo',
  Technical: 'Projet',
  Management: 'Affaires Internationales',
};

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

  const categoryLabels = Object.keys(stats?.enrollmentsByCategory || {}).map(
    (key) => CELL_LABELS[key] || key
  );
  const categoryData = Object.values(stats?.enrollmentsByCategory || {});

  const monthlyLabels = (stats?.monthlyEnrollments || []).map(
    (d) => `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`
  );
  const monthlyCounts = (stats?.monthlyEnrollments || []).map((d) => d.count);

  return (
    <DashboardLayout requiredRole="admin">
      {/* Cartes de statistiques */}
      <motion.div
  className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8 max-w-5xl mx-auto justify-center"
  initial="hidden"
  animate="visible"
  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
>
  <StatCard label={"Membres\nau total"}      value={stats?.totalUsers}         icon={Users}        color="navy" />
  <StatCard label="Formations actives"    value={stats?.totalTrainings}     icon={BookOpen}     color="teal" />
  <StatCard label="Formations terminées"  value={stats?.completedTrainings} icon={CheckCircle2} color="green" />
  <StatCard label="Propositions en attente" value={stats?.pendingProposals} icon={FileText}     color="amber" />
</motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Graphique en ligne des inscriptions mensuelles */}
        <div className="card xl:col-span-2">
          <h2 className="font-display font-bold text-navy-900 text-base mb-4">Inscriptions mensuelles</h2>
          <Line
            data={{
              labels: monthlyLabels.length ? monthlyLabels : ['Aucune donnée'],
              datasets: [{
                label: 'Inscriptions',
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

        {/* Diagramme en anneau par cellule */}
        <div className="card">
          <h2 className="font-display font-bold text-navy-900 text-base mb-4">Inscriptions par cellule</h2>
          {categoryLabels.length > 0 ? (
            <>
              <div className="max-w-[280px] mx-auto mt-12">
                <Doughnut
                  data={{
                    labels: categoryLabels,
                    datasets: [{
                      data: categoryData,
                      // Dégradé basé sur la charte graphique : #28374d → #3ec0c7
                      backgroundColor: ['#28374d', '#2f6475', '#37919e', '#3ec0c7'],
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              {/* Légende personnalisée : mt-8 contrôle la distance avec la roue */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-12">
                {categoryLabels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm inline-block"
                      style={{ backgroundColor: ['#28374d', '#2f6475', '#37919e', '#3ec0c7'][i] }}
                    />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Aucune donnée d'inscription pour l'instant</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
