import type { CatalogItem } from '@/lib/types'

interface Props {
  item: CatalogItem
}

export default function ResourceCard({ item }: Props) {
  return (
    <div className="bg-white border border-border-subtle rounded-bento p-5 flex flex-col gap-3 hover:shadow-md hover:border-startup-green transition-all">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-deep-navy leading-snug">{item.title}</h3>
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-deep-navy border border-deep-navy px-3 py-1.5 rounded hover:bg-deep-navy hover:text-white transition-colors flex items-center gap-1"
          >
            View
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">open_in_new</span>
          </a>
        ) : item.email ? (
          <a
            href={`mailto:${item.email}`}
            className="shrink-0 text-xs font-semibold text-deep-navy border border-deep-navy px-3 py-1.5 rounded hover:bg-deep-navy hover:text-white transition-colors flex items-center gap-1"
          >
            Contact
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">mail</span>
          </a>
        ) : null}
      </div>

      <p className="text-sm text-on-surface-variant line-clamp-2">{item.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {item.topics.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider"
          >
            {t}
          </span>
        ))}
        {item.communities[0] && item.communities[0] !== 'Any' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-startup-green/10 text-emerald-700 uppercase tracking-wider">
            {item.communities[0]}
          </span>
        )}
      </div>

      {item.email && (
        <p className="text-xs text-on-surface-variant">{item.email}</p>
      )}
    </div>
  )
}
