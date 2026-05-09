'use client'
import { useState, useMemo } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ResourceCard from '@/components/ResourceCard'
import { filterResources } from '@/lib/filterResources'
import type { CatalogItem } from '@/lib/types'
import catalogData from '@/data/catalog.json'

const catalog = catalogData as CatalogItem[]

const CATEGORY_TOPICS = [
  { topic: 'Start a Business', icon: 'rocket_launch' },
  { topic: 'Funding', icon: 'payments' },
  { topic: 'Late Stage Growth', icon: 'trending_up' },
  { topic: 'International Trade', icon: 'public' },
] as const

const ALL_TOPICS = [
  'Start a Business',
  'Funding',
  'Late Stage Growth',
  'International Trade',
  'Entrepreneurship Communities',
  'Marketing and Sales',
  'Taxes and Finance',
  'Close or Exit a Business',
  'Relocate a Business to Utah',
  'Other',
]

const ALL_COMMUNITIES = [
  'Women',
  'Veteran',
  'Rural',
  'Student',
  'Multicultural',
  'New American',
]

const ALL_LOCATIONS = [
  'Beaver', 'Box Elder', 'Cache', 'Carbon', 'Daggett', 'Davis', 'Duchesne', 'Emery',
  'Garfield', 'Grand', 'Iron', 'Juab', 'Kane', 'Millard', 'Morgan', 'Piute', 'Rich',
  'Salt Lake', 'San Juan', 'Sanpete', 'Sevier', 'Summit', 'Tooele', 'Uintah', 'Utah',
  'Wasatch', 'Washington', 'Wayne', 'Weber',
]

export default function ResourcesPage() {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('')
  const [community, setCommunity] = useState('')
  const [location, setLocation] = useState('')

  const isFiltering = query !== '' || topic !== '' || community !== '' || location !== ''

  const filtered = useMemo(
    () => filterResources(catalog, { query, topic, community, location }),
    [query, topic, community, location],
  )

  function clearFilters() {
    setQuery('')
    setTopic('')
    setCommunity('')
    setLocation('')
  }

  const selectClass =
    'text-sm border border-border-subtle rounded-md px-3 py-2 bg-white text-deep-navy focus:outline-none focus:ring-2 focus:ring-startup-green cursor-pointer'

  return (
    <>
      <Nav />
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-section-padding">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-headline-lg font-display text-deep-navy mb-3">
            Browse Utah Resources
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            All {catalog.length} official programs from the Governor's Office of Economic Opportunity — searchable by topic, community, and location.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="w-full pl-12 pr-4 py-3.5 border border-border-subtle rounded-lg text-body-md text-deep-navy bg-white focus:outline-none focus:ring-2 focus:ring-startup-green shadow-sm"
          />
        </div>

        {/* ─── CATEGORY VIEW (default) ─── */}
        {!isFiltering && (
          <>
            {/* Hero category cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {CATEGORY_TOPICS.map(({ topic: t, icon }) => {
                const count = catalog.filter((item) => item.topics.includes(t)).length
                return (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="bg-white border border-border-subtle rounded-bento p-6 text-left hover:shadow-md hover:border-startup-green transition-all group"
                  >
                    <span
                      className="material-symbols-outlined text-startup-green text-3xl mb-3 block"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                    <div className="text-base font-display font-bold text-deep-navy leading-snug mb-1">
                      {t}
                    </div>
                    <div className="text-label-sm text-on-surface-variant">
                      {count} resources
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Categorized topic rows */}
            {CATEGORY_TOPICS.map(({ topic: t }) => {
              const items = catalog.filter((item) => item.topics.includes(t))
              return (
                <section key={t} className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-section-header uppercase tracking-wider text-deep-navy">
                      {t}
                    </h2>
                    {items.length > 4 && (
                      <button
                        onClick={() => setTopic(t)}
                        className="text-sm font-semibold text-on-surface-variant hover:text-startup-green transition-colors"
                      >
                        View all {items.length} →
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.slice(0, 4).map((item) => (
                      <ResourceCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* ─── RESULTS VIEW (filtering active) ─── */}
        {isFiltering && (
          <>
            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={selectClass}
              >
                <option value="">All topics</option>
                {ALL_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className={selectClass}
              >
                <option value="">All communities</option>
                {ALL_COMMUNITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={selectClass}
              >
                <option value="">All counties</option>
                {ALL_LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-on-surface-variant hover:text-deep-navy transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                Clear
              </button>

              <span className="ml-auto text-label-sm text-on-surface-variant">
                Showing {filtered.length} of {catalog.length} resources
              </span>
            </div>

            {/* Results grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <ResourceCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-4 block">
                  search_off
                </span>
                <p className="text-body-md mb-4">No resources match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-startup-green hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
