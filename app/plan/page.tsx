'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import RecommendationCard from '@/components/RecommendationCard'
import RightInspector from '@/components/RightInspector'
import Toast from '@/components/Toast'
import { SESSION_KEYS, type Recommendation, type FounderProfile, type CatalogItem } from '@/lib/types'
import { DEFAULT_PROFILE } from '@/lib/defaults'
import { siteConfig } from '@/data/config'
import { score } from '@/lib/score'
import { toMarkdown, toJSON } from '@/lib/export'
import catalogData from '@/data/catalog.json'

export default function PlanPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE)
  const [activeSection, setActiveSection] = useState('Overview')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const storedRecs = sessionStorage.getItem(SESSION_KEYS.recommendations)
    const storedProfile = sessionStorage.getItem(SESSION_KEYS.profile)
    if (storedRecs) setRecommendations(JSON.parse(storedRecs))
    if (storedProfile) setProfile(JSON.parse(storedProfile))
  }, [])

  const planName = `${profile.industry} Plan`

  const displayedRecs = useMemo(() => {
    const section = siteConfig.leftRailSections.find((s) => s.label === activeSection)
    const sectionTopics = section?.topics ?? null
    if (!sectionTopics) return recommendations
    const filtered = (catalogData as CatalogItem[]).filter((item) =>
      item.topics.some((t) => sectionTopics.includes(t)),
    )
    return score(filtered, profile)
  }, [activeSection, recommendations, profile])

  const timelineGroups = [
    { label: 'Today',        recs: displayedRecs.slice(0, 1) },
    { label: 'This week',    recs: displayedRecs.slice(1, 3) },
    { label: 'Next 30 days', recs: displayedRecs.slice(3, 5) },
  ].filter((g) => g.recs.length > 0)

  function download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Nav />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 flex w-full overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>

          {/* Left Rail */}
          <div className="w-64 border-r border-border-subtle bg-white flex flex-col h-full shrink-0">
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-6">
                <div className="flex gap-3 items-center">
                  <div className="bg-slate-100 flex items-center justify-center rounded-lg size-10 text-deep-navy">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      rocket_launch
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-deep-navy text-sm font-semibold leading-tight">Action Plan</h1>
                    <p className="text-slate-500 text-xs font-medium mt-0.5 truncate max-w-[120px]">
                      {planName}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-success">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-success/80 to-success"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {siteConfig.leftRailSections.map((section) => (
                    <button
                      key={section.label}
                      onClick={() => setActiveSection(section.label)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors w-full text-left ${
                        activeSection === section.label
                          ? 'bg-slate-50 text-deep-navy border border-slate-100'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="p-4 border-t border-border-subtle bg-slate-50/50 flex flex-col gap-2">
              <button
                onClick={() =>
                  download(
                    toMarkdown(recommendations, profile),
                    'founders-navigator-plan.md',
                    'text/markdown',
                  )
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white border border-border-subtle text-slate-600 hover:text-deep-navy hover:border-slate-300 transition-all shadow-sm text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">markdown</span>
                Export Markdown
              </button>
              <button
                onClick={() =>
                  download(
                    toJSON(recommendations),
                    'founders-navigator-plan.json',
                    'application/json',
                  )
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white border border-border-subtle text-slate-600 hover:text-deep-navy hover:border-slate-300 transition-all shadow-sm text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">data_object</span>
                Export JSON
              </button>
            </div>
          </div>

          {/* Center Feed */}
          <div className="flex-1 overflow-y-auto p-8 min-w-[420px]">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-deep-navy">
                  {activeSection === 'Overview' ? 'Recommendations' : activeSection}
                </h2>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">sort</span>
                  Ranked by Fit
                </span>
              </div>

              {recommendations.length > 0 && activeSection === 'Overview' && (
                <p className="text-body-md text-on-surface-variant mb-6">
                  Here are the top resources for a{' '}
                  <strong>
                    {profile.community !== 'Any' ? profile.community + ' ' : ''}
                    {profile.industry}
                  </strong>{' '}
                  founder in <strong>{profile.location}</strong> looking to{' '}
                  <strong>{profile.stage}</strong>.
                </p>
              )}

              {recommendations.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-4 block">search</span>
                  <p>Run a scenario on the homepage to see recommendations.</p>
                  <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-innovation-orange hover:underline text-sm font-semibold"
                  >
                    Go to homepage →
                  </button>
                </div>
              )}

              {recommendations.length > 0 && displayedRecs.length < 3 && activeSection !== 'Overview' && (
                <div className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                  <p>No resources found in this category for your profile.</p>
                  <button
                    onClick={() => setActiveSection('Overview')}
                    className="mt-4 text-innovation-orange hover:underline text-sm font-semibold"
                  >
                    View all recommendations →
                  </button>
                </div>
              )}

              {(displayedRecs.length >= 3 || activeSection === 'Overview') &&
                recommendations.length > 0 &&
                timelineGroups.map((group) => (
                  <div key={group.label} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="flex flex-col gap-5">
                      {group.recs.map((rec) => (
                        <RecommendationCard key={rec.id} rec={rec} />
                      ))}
                    </div>
                  </div>
                ))}

              {recommendations.length > 0 && activeSection === 'Overview' && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-label-sm text-slate-400 uppercase tracking-widest mb-3">
                    Quick actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {siteConfig.followUpChips.map((chip) => (
                      <button
                        key={chip.intent}
                        onClick={() => setToast('Coming in production')}
                        className="px-4 py-2 rounded-full border border-border-subtle text-label-sm text-slate-600 hover:border-deep-navy hover:text-deep-navy transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <Link
                      href="/resources"
                      className="text-sm text-on-surface-variant hover:text-startup-green transition-colors"
                    >
                      Browse all 213 official Utah resources →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Inspector */}
          <RightInspector profile={profile} recommendations={recommendations} />
        </div>
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
