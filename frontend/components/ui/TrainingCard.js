import Link from 'next/link';
import clsx from 'clsx';

const LEVEL_BADGE = {
  Beginner:     'badge-green',
  Intermediate: 'badge-yellow',
  Advanced:     'badge-red',
};

const CATEGORY_COLORS = {
  Technical:   '#1d2d4e',
  Management:  '#0891b2',
  Design:      '#7c3aed',
  Marketing:   '#db2777',
  Finance:     '#059669',
  'Soft Skills': '#d97706',
  Other:       '#6b7280',
};

export default function TrainingCard({ training, progress, href }) {
  const pct = progress?.percentageComplete ?? 0;
  const catColor = CATEGORY_COLORS[training.category] || '#6b7280';

  return (
    <Link href={href || `/member/trainings/${training._id}`}>
      <div className="card-hover group flex flex-col h-full">
        {/* Color strip */}
        <div className="h-1.5 rounded-t-xl2 -mt-6 -mx-6 mb-5 transition-all group-hover:h-2"
          style={{ background: catColor }} />

        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg text-white"
            style={{ background: catColor, opacity: 0.9 }}>
            {training.category}
          </span>
          <span className={clsx('badge', LEVEL_BADGE[training.level] || 'badge-navy')}>
            {training.level}
          </span>
        </div>

        <h3 className="font-display font-semibold text-navy-900 text-base mb-2 leading-snug line-clamp-2 flex-1">
          {training.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {training.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mb-4">
          <span>{training.duration}h</span>
          <span>•</span>
          <span>{training.modules?.length || 0} modules</span>
          {training.enrolledCount !== undefined && (
            <>
              <span>•</span>
              <span>{training.enrolledCount} inscrits</span>
            </>
          )}
          {training.instructor && (
            <>
              <span>•</span>
              <span className="font-medium text-slate-500">{training.instructor}</span>
            </>
          )}
        </div>

        {/* Progress bar (only if enrolled) */}
        {progress && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500 capitalize">{progress.status.replace('_', ' ')}</span>
              <span className="font-semibold text-navy-900">{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
