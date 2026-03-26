import clsx from 'clsx';

export default function StatCard({ label, value, sub, icon, color = 'navy', trend }) {
  const colors = {
    navy:  { bg: 'bg-navy-900/8',  icon: 'text-navy-900',  ring: 'ring-navy-900/10' },
    teal:  { bg: 'bg-teal-je/10',  icon: 'text-teal-dark', ring: 'ring-teal-je/20'  },
    green: { bg: 'bg-green-50',    icon: 'text-green-600', ring: 'ring-green-100'   },
    amber: { bg: 'bg-amber-50',    icon: 'text-amber-600', ring: 'ring-amber-100'   },
    red:   { bg: 'bg-red-50',      icon: 'text-red-500',   ring: 'ring-red-100'     },
  };
  const c = colors[color] || colors.navy;

  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ring-1', c.bg, c.ring)}>
        <span className={clsx('text-xl', c.icon)}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="font-display font-bold text-2xl text-navy-900 leading-none">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <p className={clsx('text-xs font-medium mt-1', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}
