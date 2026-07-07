import clsx from 'clsx';

export default function StatCard({ label, value, sub, icon, color = 'navy', trend }) {
  const colors = {
    navy:  { text: 'text-navy-900',  border: 'border-l-4 border-l-navy-900',  bg: 'bg-navy-50/30' },
    teal:  { text: 'text-teal-dark', border: 'border-l-4 border-l-teal-je',   bg: 'bg-teal-je/5' },
    green: { text: 'text-green-700', border: 'border-l-4 border-l-green-600',  bg: 'bg-green-50/50' },
    amber: { text: 'text-amber-700', border: 'border-l-4 border-l-amber-500',  bg: 'bg-amber-50/50' },
    red:   { text: 'text-red-600',   border: 'border-l-4 border-l-red-500',    bg: 'bg-red-50/50' },
  };
  const c = colors[color] || colors.navy;

  return (
    <div className={clsx('card flex items-start gap-4 transition-all duration-200 hover:scale-[1.02]', c.border, c.bg)}>
      {icon && (
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 bg-white shadow-sm')}>
          <span className={clsx('text-xl', c.text)}>{icon}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
        <p className={clsx('font-display font-bold text-3xl leading-none', c.text)}>{value ?? '—'}</p>
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
