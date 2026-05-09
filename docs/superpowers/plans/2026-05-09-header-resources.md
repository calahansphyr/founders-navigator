# Header Redesign + Resources Browse Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Nav with a startup.utah.gov co-branded header with working nav links, then add a `/resources` browse page with a category-first UX backed by the 213-entry `data/catalog.json`.

**Architecture:** All new functionality is client-side only — no API calls, no sessionStorage. The filter utility is extracted to `lib/filterResources.ts` as a pure function so it can be tested independently. The Nav becomes a Client Component (required for `usePathname`). Design tokens are added to `app/globals.css` via Tailwind v4's `@theme inline` block — **not** `tailwind.config.ts`, which is unused in this project's Tailwind v4 setup.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4 (`@theme inline` tokens), Vitest (lib tests use `vitest.lib.config.ts`), existing component patterns from `RecommendationCard.tsx`.

---

## File Map

```
app/globals.css              ← MODIFY: add --color-startup-green token
components/Nav.tsx           ← MODIFY: full rewrite — co-brand, real links, usePathname
lib/filterResources.ts       ← CREATE: pure filter function (testable)
lib/filterResources.test.ts  ← CREATE: Vitest tests for filter function
components/ResourceCard.tsx  ← CREATE: single catalog item display card
app/resources/page.tsx       ← CREATE: category-first browse page
app/plan/page.tsx            ← MODIFY: add "Browse all resources →" link at bottom
```

---

## Task 1: Add `startup-green` design token

**Files:**
- Modify: `app/globals.css`

The project uses **Tailwind v4** with CSS-variable-based tokens in `@theme inline`. Do not touch `tailwind.config.ts` — it is not read by the current build.

- [ ] **Step 1: Open `app/globals.css` and add one line inside the `@theme inline` block, after the last `--color-*` line**

Find this line:
```css
  --color-background-light: #F8FAFC;
```

Add immediately after it:
```css
  --color-startup-green: #1de384;
```

- [ ] **Step 2: Verify the token is available**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds (no new errors). The token will generate `text-startup-green`, `bg-startup-green`, `border-startup-green` utilities automatically.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add startup-green design token for startup.utah.gov co-brand"
```

---

## Task 2: Rewrite `components/Nav.tsx`

**Files:**
- Modify: `components/Nav.tsx`

The current Nav is a Server Component. It must become a Client Component because `usePathname` (which drives the active link underline) requires the React hook lifecycle.

- [ ] **Step 1: Replace the entire contents of `components/Nav.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Find Your Plan', href: '/' },
  { label: 'Browse Resources', href: '/resources' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-subtle px-10 py-3 bg-white sticky top-0 z-50">
      {/* Co-brand lockup */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <svg
          width="28"
          height="24"
          viewBox="0 0 28 24"
          fill="none"
          aria-hidden="true"
        >
          <polygon points="14,0 28,12 22,12 14,6 6,12 0,12" fill="#1de384" />
          <polygon
            points="14,8 28,24 22,24 14,14 6,24 0,24"
            fill="#1de384"
            opacity="0.6"
          />
        </svg>
        <div className="flex flex-col justify-center leading-none gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-startup-green">
            STARTUP STATE
          </span>
          <span className="font-display text-lg font-bold text-deep-navy">
            Founder's Navigator
          </span>
        </div>
      </Link>

      {/* Center nav links */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${
                isActive
                  ? 'text-deep-navy border-startup-green'
                  : 'text-on-surface-variant border-transparent hover:text-deep-navy'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right: official site link */}
      <a
        href="https://startup.utah.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-on-surface-variant hover:text-startup-green transition-colors flex items-center gap-1"
      >
        startup.utah.gov
        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
      </a>
    </header>
  )
}
```

- [ ] **Step 2: Start dev server and verify the header**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Left: green chevron SVG + "STARTUP STATE" small caps above "Founder's Navigator" bold
- Center: "Find Your Plan" with green underline (active), "Browse Resources" muted
- Right: "startup.utah.gov ↗" text link (no avatar)
- Navigate to `/review` — neither link should be underlined (neither is active)
- Navigate to `/` — "Find Your Plan" should show green underline again

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: co-branded Nav with startup.utah.gov lockup and real nav links"
```

---

## Task 3: Filter utility — TDD

**Files:**
- Create: `lib/filterResources.ts`
- Create: `lib/filterResources.test.ts`

The filter function is pure (no side effects, no imports of React or Next.js). It runs in the `vitest.lib.config.ts` environment (`node`, includes `lib/**/*.test.ts`).

- [ ] **Step 1: Write the failing tests first**

Create `lib/filterResources.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { filterResources } from './filterResources'
import type { CatalogItem } from './types'

const makeItem = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
  id: '1',
  title: 'SBDC Training Program',
  description: 'Business development courses for new entrepreneurs',
  communities: ['Any'],
  industries: ['Software and Information Technology'],
  locations: ['Salt Lake'],
  topics: ['Start a Business'],
  link: 'https://example.com',
  email: '',
  ...overrides,
})

describe('filterResources', () => {
  it('returns all items when no filters applied', () => {
    const catalog = [makeItem(), makeItem({ id: '2' })]
    const result = filterResources(catalog, { query: '', topic: '', community: '', location: '' })
    expect(result).toHaveLength(2)
  })

  it('filters by title (case-insensitive)', () => {
    const catalog = [
      makeItem({ title: 'SBDC Program' }),
      makeItem({ id: '2', title: 'Angel Network' }),
    ]
    const result = filterResources(catalog, { query: 'sbdc', topic: '', community: '', location: '' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('SBDC Program')
  })

  it('filters by description (case-insensitive)', () => {
    const catalog = [
      makeItem({ description: 'For veteran entrepreneurs' }),
      makeItem({ id: '2', description: 'General business support' }),
    ]
    const result = filterResources(catalog, { query: 'veteran', topic: '', community: '', location: '' })
    expect(result).toHaveLength(1)
  })

  it('filters by topic', () => {
    const catalog = [
      makeItem({ topics: ['Funding'] }),
      makeItem({ id: '2', topics: ['Start a Business'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: 'Funding', community: '', location: '' })
    expect(result).toHaveLength(1)
    expect(result[0].topics).toContain('Funding')
  })

  it('filters by community (exact match)', () => {
    const catalog = [
      makeItem({ communities: ['Women'] }),
      makeItem({ id: '2', communities: ['Veteran'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: '', community: 'Women', location: '' })
    expect(result).toHaveLength(1)
  })

  it('includes "Any" community items when community filter is set', () => {
    const catalog = [
      makeItem({ id: '1', communities: ['Any'] }),
      makeItem({ id: '2', communities: ['Women'] }),
      makeItem({ id: '3', communities: ['Veteran'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: '', community: 'Veteran', location: '' })
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.id).sort()).toEqual(['1', '3'])
  })

  it('filters by location', () => {
    const catalog = [
      makeItem({ locations: ['Cache'] }),
      makeItem({ id: '2', locations: ['Weber'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: '', community: '', location: 'Cache' })
    expect(result).toHaveLength(1)
  })

  it('combines multiple filters with AND logic', () => {
    const catalog = [
      makeItem({ id: '1', topics: ['Funding'], locations: ['Salt Lake'] }),
      makeItem({ id: '2', topics: ['Funding'], locations: ['Cache'] }),
      makeItem({ id: '3', topics: ['Start a Business'], locations: ['Salt Lake'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: 'Funding', community: '', location: 'Salt Lake' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns empty array when nothing matches', () => {
    const catalog = [makeItem({ topics: ['Funding'] })]
    const result = filterResources(catalog, { query: '', topic: 'International Trade', community: '', location: '' })
    expect(result).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
npx vitest run --config vitest.lib.config.ts
```
Expected: FAIL — "Cannot find module './filterResources'"

- [ ] **Step 3: Implement `lib/filterResources.ts`**

```ts
import type { CatalogItem } from './types'

export interface ResourceFilters {
  query: string
  topic: string
  community: string
  location: string
}

export function filterResources(
  catalog: CatalogItem[],
  filters: ResourceFilters,
): CatalogItem[] {
  const { query, topic, community, location } = filters
  const q = query.toLowerCase()

  return catalog.filter((item) => {
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    const matchesTopic = !topic || item.topics.includes(topic)
    const matchesCommunity =
      !community ||
      item.communities.includes(community) ||
      item.communities.includes('Any')
    const matchesLocation = !location || item.locations.includes(location)
    return matchesQuery && matchesTopic && matchesCommunity && matchesLocation
  })
}
```

- [ ] **Step 4: Run to confirm tests pass**

```bash
npx vitest run --config vitest.lib.config.ts
```
Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/filterResources.ts lib/filterResources.test.ts
git commit -m "feat: filterResources pure utility with AND-logic multi-filter"
```

---

## Task 4: `ResourceCard` component

**Files:**
- Create: `components/ResourceCard.tsx`

This is a simpler card than `RecommendationCard` — no rank, no fitLabel, no scoring metadata. It shows raw `CatalogItem` data. No state, no interactivity except the external link.

- [ ] **Step 1: Create `components/ResourceCard.tsx`**

```tsx
import type { CatalogItem } from '@/lib/types'

interface Props {
  item: CatalogItem
}

export default function ResourceCard({ item }: Props) {
  return (
    <div className="bg-white border border-border-subtle rounded-bento p-5 flex flex-col gap-3 hover:shadow-md hover:border-startup-green transition-all">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-deep-navy leading-snug">{item.title}</h3>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-semibold text-deep-navy border border-deep-navy px-3 py-1.5 rounded hover:bg-deep-navy hover:text-white transition-colors flex items-center gap-1"
        >
          View
          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
        </a>
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
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no TypeScript or import errors mentioning `ResourceCard`.

- [ ] **Step 3: Commit**

```bash
git add components/ResourceCard.tsx
git commit -m "feat: ResourceCard component for catalog item display"
```

---

## Task 5: `/resources` browse page

**Files:**
- Create: `app/resources/page.tsx`

This is the largest task. The page has two rendering modes driven by a single `isFiltering` boolean:
- **Category view** (default): 4 hero category cards + 4 topic sections showing first 4 resources each
- **Results view** (any filter active): filter dropdowns + flat grid of matching resources + empty state

Constants for dropdowns are defined inline (not imported from config) — they're static taxonomy values that map to `CatalogItem` field types.

- [ ] **Step 1: Create `app/resources/page.tsx`**

```tsx
'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
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
```

- [ ] **Step 2: Verify in browser**

With the dev server running, open http://localhost:3000/resources. Verify:
1. 4 category cards display with icons and resource counts ("Start a Business · 57 resources", "Funding · 151 resources", "Late Stage Growth · 123 resources", "International Trade · 26 resources")
2. Below the cards: 4 section rows, each showing 4 resource cards + "View all N →" button
3. Type anything in the search bar → category view collapses, results view appears with count
4. Click "Clear" → returns to category view
5. Click a category card → results view shows that topic's resources pre-filtered
6. Click "View all N →" in a section → results view with that topic filtered

- [ ] **Step 3: Commit**

```bash
git add app/resources/page.tsx
git commit -m "feat: /resources browse page with category-first view and live filters"
```

---

## Task 6: Add "Browse all resources" link to `/plan`

**Files:**
- Modify: `app/plan/page.tsx`

A single link at the bottom of the center pane gives judges a path from the action plan into the full catalog.

- [ ] **Step 1: Add `Link` import to `app/plan/page.tsx`**

Find the existing import line (at the top of the file):
```tsx
import { useRouter } from 'next/navigation'
```

Replace with:
```tsx
import { useRouter } from 'next/navigation'
import Link from 'next/link'
```

- [ ] **Step 2: Add the browse link at the end of the follow-up chips section**

In `app/plan/page.tsx`, find:
```tsx
              {recommendations.length > 0 && (
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
                </div>
              )}
```

Replace with:
```tsx
              {recommendations.length > 0 && (
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
                      Browse all {213} official Utah resources →
                    </Link>
                  </div>
                </div>
              )}
```

- [ ] **Step 3: Verify in browser**

Run the full flow: homepage chip → review → analyzing → plan. At the bottom of the center pane, verify "Browse all 213 official Utah resources →" appears below the quick action chips and clicking it navigates to `/resources`.

- [ ] **Step 4: Run all tests to verify nothing is broken**

```bash
npm test
npx vitest run --config vitest.lib.config.ts
```
Expected: all existing tests pass + 8 new `filterResources` tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/plan/page.tsx
git commit -m "feat: browse-all resources link at bottom of plan center pane"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `startup-green` token — Task 1 (added to `globals.css` `@theme inline`, NOT `tailwind.config.ts`)
- [x] Nav co-brand lockup: SVG chevron + "STARTUP STATE" + "Founder's Navigator" — Task 2
- [x] Nav active link underline in `startup-green` via `usePathname` — Task 2
- [x] Dead nav links replaced with "Find Your Plan" + "Browse Resources" — Task 2
- [x] `startup.utah.gov ↗` external link on right — Task 2
- [x] JS avatar removed — Task 2
- [x] `filterResources` pure function, TDD — Task 3
- [x] "Any" community items included when community filter is set — Task 3 (`matchesCommunity` logic)
- [x] AND-logic multi-filter — Task 3
- [x] `ResourceCard` component: title, description (2-line clamp), topic chips, community badge, email, View button — Task 4
- [x] `/resources` route — Task 5
- [x] Category view: 4 hero cards with icon + topic + count — Task 5
- [x] Category cards clickable → transitions to results view with that topic pre-filtered — Task 5
- [x] Categorized rows: 4 per topic section, "View all →" — Task 5
- [x] Results view: 3 filter dropdowns (topic, community, location) — Task 5
- [x] "Clear" resets all 4 state values (query + 3 dropdowns) — Task 5
- [x] Result count label — Task 5
- [x] Empty state with "Clear filters" button — Task 5
- [x] "Browse all 213 resources →" link on `/plan` — Task 6
- [x] Nav "Browse Resources" link points to `/resources` — Task 2

**Type consistency:**
- `filterResources(catalog: CatalogItem[], filters: ResourceFilters): CatalogItem[]` — defined in Task 3, imported in Task 5. ✓
- `ResourceFilters` interface exported from `lib/filterResources.ts`, used only internally. ✓
- `CatalogItem` from `@/lib/types` used in both `ResourceCard` (Task 4) and `resources/page.tsx` (Task 5). ✓

**Placeholder scan:** No TBDs. All code blocks are complete. The "213" in the plan link (Task 6) is hardcoded — it matches `catalog.length` from `catalog.json` which has 213 entries. This is intentional for the prototype; production would use `catalog.length` dynamically.
