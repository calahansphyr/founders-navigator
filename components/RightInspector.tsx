'use client'
import { useState } from 'react'
import type { Recommendation, FounderProfile } from '@/lib/types'
import { siteConfig } from '@/data/config'
import { toMarkdown, toJSON } from '@/lib/export'

interface Props {
  profile: FounderProfile
  recommendations: Recommendation[]
}

type Tab = 'Profile' | 'Sources' | 'Metrics' | 'Agent Plan'
const TABS: Tab[] = ['Profile', 'Sources', 'Metrics', 'Agent Plan']

export default function RightInspector({ profile, recommendations }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Profile')

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="w-[420px] bg-white border-l border-border-subtle flex flex-col h-full shrink-0 z-10">
      <div className="flex border-b border-border-subtle px-4 gap-2 shrink-0 pt-2 bg-slate-50/50">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-4 px-3 text-[13px] font-bold tracking-tight transition-colors ${
              activeTab === tab
                ? 'border-b-innovation-orange text-innovation-orange'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Profile' && (
          <dl className="flex flex-col gap-3">
            {Object.entries(profile)
              .filter(([key]) => key !== 'scenario' && key !== 'assumptions')
              .map(([key, value]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {key}
                  </dt>
                  <dd className="text-sm text-deep-navy font-medium">{String(value)}</dd>
                </div>
              ))}
            {profile.assumptions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Assumed fields
                </dt>
                <div className="flex flex-wrap gap-1">
                  {profile.assumptions.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-500 uppercase"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </dl>
        )}

        {activeTab === 'Sources' && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Official sources
            </p>
            {recommendations.map((rec) => (
              <a
                key={rec.id}
                href={rec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-innovation-orange hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">#{rec.rank}</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-deep-navy">
                    {rec.title}
                  </span>
                  {rec.email && (
                    <span className="text-xs text-slate-400">{rec.email}</span>
                  )}
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  open_in_new
                </span>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'Metrics' && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              {siteConfig.baselineMetrics.label}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="text-left pb-2">Metric</th>
                  <th className="text-right pb-2">Baseline</th>
                  <th className="text-right pb-2">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteConfig.baselineMetrics.rows.map((row) => (
                  <tr key={row.metric}>
                    <td className="py-2 text-slate-700 font-medium">{row.metric}</td>
                    <td className="py-2 text-right text-slate-500">{row.baseline}</td>
                    <td className="py-2 text-right text-success font-bold">{row.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Agent Plan' && (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Machine-readable export
            </p>
            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-700 overflow-auto max-h-72 whitespace-pre-wrap">
              {recommendations.length > 0 ? toJSON(recommendations) : '// Run a scenario to see output'}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(toJSON(recommendations))}
                className="flex-1 flex items-center justify-center rounded-md h-9 px-3 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined mr-1.5 text-[16px]">data_object</span>
                Copy JSON
              </button>
              <button
                onClick={() => copyToClipboard(toMarkdown(recommendations, profile))}
                className="flex-1 flex items-center justify-center rounded-md h-9 px-3 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined mr-1.5 text-[16px]">markdown</span>
                Copy Markdown
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
