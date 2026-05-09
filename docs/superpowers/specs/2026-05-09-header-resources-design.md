# Founder's Navigator — Header Redesign + Resources Browse Page

**Date:** 2026-05-09  
**Builds on:** `2026-05-08-founders-navigator-design.md`  
**Goal:** (1) Replace the current Nav with a co-branded startup.utah.gov header. (2) Add a `/resources` browse page with a category-first UX that serves both founders and investor-audience judges.

---

## 1. Header Redesign (`components/Nav.tsx`)

### Visual Structure

```
[ ▲ STARTUP STATE  |  Founder's Navigator ]   Find Your Plan   Browse Resources         startup.utah.gov ↗
  (left lockup)                               (nav links)                                (right CTA)
```

### Left Lockup

Three elements in a single flex row with `items-center gap-3`:

1. **Startup State chevron** — inline SVG polygon recreating the inverted-V brand mark visible on startup.utah.gov (two stacked triangles). SVG path approximation:
   ```svg
   <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
     <polygon points="14,0 28,12 22,12 14,6 6,12 0,12" fill="#1de384"/>
     <polygon points="14,8 28,24 22,24 14,14 6,24 0,24" fill="#1de384" opacity="0.6"/>
   </svg>
   ```
2. **Two-line text block** (flex-col, justify-center):
   - Line 1: `"STARTUP STATE"` — `text-[9px] font-bold uppercase tracking-[0.2em] text-startup-green`
   - Line 2: `"Founder's Navigator"` — `font-display text-lg font-bold text-deep-navy`
3. A thin `w-px h-8 bg-border-subtle mx-1` vertical divider is **not** used — the two-line stacked layout is self-contained. No divider needed.

The entire lockup is a `<Link href="/">` with no underline.

### Center Navigation

Replace the current `['Dashboard', 'My Profile', 'Resources']` map with two real links:

| Label | Href | Active state |
|---|---|---|
| Find Your Plan | `/` | underline in `#1de384` when on `/` |
| Browse Resources | `/resources` | underline in `#1de384` when on `/resources` |

Style: `text-sm font-semibold text-on-surface-variant hover:text-deep-navy transition-colors`. Active state uses `usePathname()` from `next/navigation`.

### Right Side

Remove the `"JS"` avatar entirely. Replace with:

```tsx
<a
  href="https://startup.utah.gov"
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs font-semibold text-on-surface-variant hover:text-startup-green transition-colors flex items-center gap-1"
>
  startup.utah.gov
  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
```

### Accent Color

The single new color token added to `tailwind.config.ts`:

```ts
'startup-green': '#1de384',
```

This appears only in the Nav (chevron SVG, active link underline, external link hover). The rest of the app retains its existing gold/navy palette.

---

## 2. Resources Browse Page (`app/resources/page.tsx`)

### Route

`/resources` — a new Next.js App Router page. No sessionStorage, no AI. Purely client-side filtering of `data/catalog.json`.

### Component Structure

```
app/resources/page.tsx       (client component — holds filter state)
components/ResourceCard.tsx  (new — displays one CatalogItem)
```

`Nav` and `Footer` wrap the page as on `/review`.

### Page Layout

```
Nav
────────────────────────────────────────
  Browse Utah Resources
  [All 213 official GOEO programs in one place]
  
  [ 🔍 Search resources...                    ]   ← full-width search bar
  
  ┌──────────────────────────────────────────┐
  │  CATEGORY VIEW  (shown when no query/filters active)
  │
  │  [Start a Business · 57]  [Funding · 151]
  │  [Late Stage Growth · 123] [Intl Trade · 26]
  │
  │  ─── Start a Business ────────────────────
  │  [card] [card] [card] [card]  View all →
  │  ─── Funding ──────────────────────────────
  │  [card] [card] [card] [card]  View all →
  │  ...
  └──────────────────────────────────────────┘

  ┌──────────────────────────────────────────┐
  │  RESULTS VIEW  (shown when query or filter active)
  │
  │  Topic ▾   Community ▾   Location ▾   [× Clear]   Showing 34 of 213
  │
  │  [card] [card]
  │  [card] [card]
  │  ...
  └──────────────────────────────────────────┘
Footer
```

### State Model

```ts
const [query, setQuery]         = useState('')
const [topicFilter, setTopic]   = useState('')
const [communityFilter, setCom] = useState('')
const [locationFilter, setLoc]  = useState('')

const isFiltering = query !== '' || topicFilter !== '' || communityFilter !== '' || locationFilter !== ''
```

`isFiltering` drives which view renders.

### Category View (default)

Four hero category cards in a `grid grid-cols-2 gap-4` (or `grid-cols-4` on wide screens):

| Topic | Count | Icon |
|---|---|---|
| Start a Business | 57 | `rocket_launch` |
| Funding | 151 | `payments` |
| Late Stage Growth | 123 | `trending_up` |
| International Trade | 26 | `public` |

Each card:
- `bg-white border border-border-subtle rounded-bento p-6 hover:shadow-md hover:border-startup-green transition-all cursor-pointer`
- Material icon (filled, `text-startup-green`)
- Topic name (`text-xl font-display font-bold text-deep-navy`)
- Count label (`text-label-sm text-on-surface-variant`)
- Clicking the card sets `topicFilter` to that topic name (transitions to results view)

Below the hero cards: four categorized rows, one per main topic, each showing the first 4 resources:

```tsx
<section>
  <h2>{topic}</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {resourcesForTopic.slice(0, 4).map(…)}
  </div>
  {resourcesForTopic.length > 4 && (
    <button onClick={() => setTopic(topic)}>View all {resourcesForTopic.length} →</button>
  )}
</section>
```

The four topic sections rendered: "Start a Business", "Funding", "Late Stage Growth", "International Trade". (The remaining topics — Entrepreneurship Communities, Marketing and Sales, etc. — are accessible via the Topic filter dropdown in results view but not given their own hero section, to keep the default view focused on the 4 scoring dimensions.)

### Results View (filtering active)

Shown when `isFiltering === true`.

**Filter row** (appears above results, below search):
- Three `<select>` dropdowns: Topic (all 10 topics from `CatalogItem.topics`), Community (`"Any" | "Women" | "Veteran" | "Rural" | "Student" | "Multicultural" | "New American"`), Location (all 29 Utah county names or empty = "All counties")
- Default option for each: `""` (empty string = no filter applied)
- "× Clear all" button appears when any filter is non-empty; resets all four state values to `''`
- Result count: `"Showing {filtered.length} of 213 resources"`

**Filter logic:**
```ts
const filtered = catalog.filter((item) => {
  const q = query.toLowerCase()
  const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
  const matchesTopic = !topicFilter || item.topics.includes(topicFilter)
  const matchesCommunity = !communityFilter || communityFilter === 'Any' || item.communities.includes(communityFilter) || item.communities.includes('Any')
  const matchesLocation = !locationFilter || item.locations.includes(locationFilter)
  return matchesQuery && matchesTopic && matchesCommunity && matchesLocation
})
```

**Result grid:** `grid grid-cols-1 md:grid-cols-2 gap-4`, all matching items (no artificial cap — 213 cards is ~2MB of DOM which is fine for a prototype).

**Empty state:** centered icon + "No resources match your filters. Try broadening your search." + "Clear filters" button.

### `components/ResourceCard.tsx`

A new component, simpler than `RecommendationCard` (no rank, no fitLabel — just the raw resource data):

```
┌─────────────────────────────────────────┐
│ Title                        [View →]   │
│ Description (2-line clamp)              │
│ [topic chip] [topic chip] [community]   │
│ email (if present, small text)          │
└─────────────────────────────────────────┘
```

Props: `item: CatalogItem`. Uses existing Tailwind classes from `RecommendationCard` for consistency.

### Link from `/plan`

At the bottom of the center pane on `/plan`, after the follow-up chips section, add:

```tsx
<div className="mt-6 pt-4 border-t border-slate-100 text-center">
  <Link href="/resources" className="text-sm text-on-surface-variant hover:text-startup-green transition-colors">
    Browse all 213 official Utah resources →
  </Link>
</div>
```

This gives judges a natural path from the action plan into the full catalog.

---

## 3. Files Changed / Created

| File | Action |
|---|---|
| `components/Nav.tsx` | Modify — co-brand lockup, real nav links, startup.utah.gov external link |
| `tailwind.config.ts` | Modify — add `startup-green: '#1de384'` token |
| `app/resources/page.tsx` | Create — client component, full resources browse |
| `components/ResourceCard.tsx` | Create — resource display card |
| `app/plan/page.tsx` | Modify — add "Browse all resources →" link at bottom of center pane |

---

## 4. Out of Scope

- Industry filter on the Resources page (omitted to keep filter row from crowding — topic + community + location covers the three most founder-relevant dimensions; industry can be searched by keyword)
- Pagination (213 items renders fine client-side)
- Saved/bookmarked resources (future production feature)
- The Startup Map (Part 2 of hackathon — separate product, separate spec)
