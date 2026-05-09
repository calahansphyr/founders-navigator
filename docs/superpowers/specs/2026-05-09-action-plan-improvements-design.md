# Action Plan Improvements — Design Spec

**Date:** 2026-05-09
**Scope:** `/plan` page — left rail tab navigation, AI-generated action steps per recommendation, AI provenance badge

---

## 1. Problem Statement

The current `/plan` page has three gaps:

1. **Left rail tabs are non-functional.** Overview, Financials, Product, Marketing, and Legal are rendered as disabled anchors with `cursor-not-allowed`. They show nothing.
2. **Recommendations lack direction.** Each card shows a resource and a "Why it fits" sentence but gives the founder no concrete action to take.
3. **No AI provenance signal.** Users cannot tell which parts of the output are AI-generated vs. pulled from the official catalog.

---

## 2. Changes Overview

| Area | Change |
|---|---|
| `lib/types.ts` | Add `nextStep: string` to `Recommendation` |
| `data/config.ts` | Add `leftRailSections` config array |
| `app/analyzing/page.tsx` | Add Claude call to generate `nextStep` for each top-5 rec |
| `app/plan/page.tsx` | Wire left rail tabs; derive `displayedRecs` per active section |
| `components/RecommendationCard.tsx` | Render `nextStep` callout with AI badge |
| `lib/export.ts` | Include `nextStep` in Markdown and JSON exports |

---

## 3. Data Model

### `lib/types.ts`

Add one field to `Recommendation`:

```ts
type Recommendation = CatalogItem & {
  rank: number
  fitScore: number
  fitLabel: 'Strong match' | 'Good match' | 'Worth knowing'
  matchedCriteria: number
  whyItFits: string
  nextStep: string   // NEW — Claude-generated action step grounded in catalog data
}
```

No changes to `CatalogItem` or `FounderProfile`.

### `data/config.ts`

Add `leftRailSections` array. `topics: null` means no filter — use stored top-5 from sessionStorage:

```ts
leftRailSections: [
  { label: 'Overview',   icon: 'dashboard',   topics: null },
  { label: 'Financials', icon: 'payments',    topics: ['Funding', 'Taxes and Finance'] },
  { label: 'Product',    icon: 'inventory_2', topics: ['Start a Business', 'Late Stage Growth'] },
  { label: 'Marketing',  icon: 'campaign',    topics: ['Marketing and Sales', 'Entrepreneurship Communities'] },
  { label: 'Legal',      icon: 'work',        topics: ['Start a Business', 'International Trade'] },
]
```

---

## 4. Action Step Generation (`app/analyzing/page.tsx`)

After `score()` produces the top-5 recommendations, make one Claude call before storing results to sessionStorage.

**Timing:** runs concurrently with the animation sequence. Navigation to `/plan` waits for whichever finishes last — the animation or the Claude call. In practice the 2.5s minimum animation absorbs the call with no perceived wait, but the page must not navigate before `nextStep` values are ready.

**Input to Claude:**
- Founder profile (stage, industry, location, community, primaryGoal, constraints)
- For each of the 5 recommendations: title, description, link, email

**System prompt constraints:**
- Return a JSON array of exactly 5 strings, indexed to match recommendation rank order
- Each string is one concrete action step the founder can take to engage this resource
- Base each step only on the provided title, description, link, and email — do not invent program names, dates, dollar amounts, or contact details not present in the input
- Steps should be 1–2 sentences, written in second person ("Schedule...", "Visit...", "Email...")

**Fallback:** if the call fails or returns malformed JSON, set `nextStep` to `"Visit ${rec.link} to learn more and apply."` for each recommendation. The card still renders cleanly.

**Storage:** assign each string to `recommendation.nextStep` before `sessionStorage.setItem(SESSION_KEYS.recommendations, ...)`.

---

## 5. Left Rail Tab Navigation (`app/plan/page.tsx`)

### State

```ts
const [activeSection, setActiveSection] = useState('Overview')
```

### Catalog import

```ts
import catalog from '@/data/catalog.json'
```

Static import — bundled at build time. 213 items, ~50KB. No runtime fetch.

### Derived recommendations

```ts
const section = siteConfig.leftRailSections.find(s => s.label === activeSection)

const displayedRecs = section?.topics === null
  ? recommendations                                          // Overview: stored top-5
  : score(
      catalog.filter(item =>
        item.topics.some(t => section.topics!.includes(t))
      ),
      profile
    )                                                        // Other tabs: filter + re-score
```

If `displayedRecs.length < 3` after filtering, the center pane renders an empty state:

```
No resources found in this category for your profile.
Try the Overview tab to see all top matches.
```

### Tab rendering

Replace the current disabled anchor map with real buttons sourced from `siteConfig.leftRailSections`. Active tab: `bg-slate-50 text-deep-navy border border-slate-100`. Inactive: `text-slate-600 hover:bg-slate-50`. Remove `opacity-50`, `cursor-not-allowed`, and `e.preventDefault()`.

### Center pane heading

Change from hardcoded `"Recommendations"` to `activeSection === 'Overview' ? 'Recommendations' : section.label`.

---

## 6. RecommendationCard — Next Step Callout

Add a new block between the "Why it fits" box and the topics chips:

```
┌──────────────────────────────────────────────────┐
│ arrow_forward  Your next step    ✦ Claude        │
│ [nextStep text]                                  │
└──────────────────────────────────────────────────┘
```

**Styling:**
- Container: `bg-innovation-orange/5 border border-innovation-orange/20 rounded-lg p-3`
- Header row: flex, space-between
  - Left: `arrow_forward` icon (16px, `text-innovation-orange`) + "Your next step" label (`text-xs font-semibold text-innovation-orange`)
  - Right: `auto_awesome` icon (12px) + "Claude" text (`text-[10px] text-slate-400`) — AI provenance badge
- Body: `text-sm text-slate-600 leading-relaxed mt-1`

The badge is subdued (`text-slate-400`) to read as a label, not a promotion. It marks the boundary between catalog data (below) and AI output (the next step).

---

## 7. Export Updates (`lib/export.ts`)

### Markdown

Add a "**Your next step:**" line after "**Why it fits:**" for each recommendation block:

```markdown
## 1. [Resource Title]
**Why it fits:** [whyItFits]
**Your next step:** [nextStep]
**Learn more:** [link]
**Contact:** [email — omitted if empty]
```

### JSON

`nextStep` is already present on the `Recommendation` object — the raw array export includes it automatically. No code change needed.

---

## 8. Out of Scope

- Follow-up command chips (still show "Coming in production" toast)
- Progress bar percentage (stays hardcoded at 85%)
- Mobile layout
- Tab-specific empty states beyond the 3-result threshold message

---

## 9. Metrics

No changes. The `baselineMetrics` table in the right inspector correctly represents the startup.utah.gov baseline benchmark — the "before" measurement this tool is designed to improve on. The comparison will be run again against the finished product.
