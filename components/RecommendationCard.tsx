import type { Recommendation } from '@/lib/types'

interface Props {
  rec: Recommendation
}

const FIT_COLORS: Record<string, string> = {
  'Strong match': 'bg-success/10 text-success',
  'Good match':   'bg-gold/10 text-amber-700',
  'Worth knowing':'bg-slate-100 text-slate-500',
}

const LEFT_BAR: Record<string, string> = {
  'Strong match': 'bg-success',
  'Good match':   'bg-gold',
  'Worth knowing':'bg-slate-200',
}

export default function RecommendationCard({ rec }: Props) {
  return (
    <div className="bg-white p-6 rounded-bento shadow-sm hover:shadow-md border border-border-subtle flex flex-col gap-4 transition-all relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${LEFT_BAR[rec.fitLabel] ?? 'bg-slate-200'}`} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${FIT_COLORS[rec.fitLabel]}`}
          >
            {rec.fitLabel}
          </span>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            #{rec.rank}
          </span>
          {rec.matchedCriteria >= 3 && (
            <span className="text-success text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 uppercase tracking-wider">
              {rec.matchedCriteria} of 4 matched
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-deep-navy mt-1">{rec.title}</h3>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-700">Why it fits: </span>
          {rec.whyItFits}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {rec.topics.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider"
          >
            {t}
          </span>
        ))}
        {rec.communities[0] && rec.communities[0] !== 'Any' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/10 text-amber-700 uppercase tracking-wider">
            {rec.communities[0]}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
          startup.utah.gov
        </span>
        <a
          href={rec.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-deep-navy border border-deep-navy px-3 py-1.5 rounded hover:bg-deep-navy hover:text-white transition-colors flex items-center gap-1.5"
        >
          View Resource
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </div>
    </div>
  )
}
