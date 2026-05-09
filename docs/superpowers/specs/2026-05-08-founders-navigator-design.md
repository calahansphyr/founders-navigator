# Founder's Navigator — Hackathon Prototype Design Spec

**Date:** 2026-05-08  
**Stack:** Next.js 15 App Router · Tailwind CSS · Anthropic SDK · Vercel  
**Goal:** Interactive web prototype demoing the full 4-screen founder journey, deployed to Vercel.

---

## 1. Core Principle: Content-First Architecture

The codebase is intentionally split into two layers:

- **Content layer** (`data/`) — JSON and TypeScript config files. A non-technical person (or their AI agent) can open these files, read the comments, and change any text, resource, chip, or recommendation without touching React code.
- **UI layer** (`app/`, `components/`, `lib/`) — React components that read from the content layer. Developers work here.

**Rule:** No user-facing string, URL, or resource entry lives inside a React component. Everything goes through `data/`.

---

## 2. Routes

| Route | Screen |
|---|---|
| `/` | Homepage — scenario input |
| `/review` | Structured profile review — editable fields |
| `/analyzing` | Matching and ranking state — animated overlay |
| `/plan` | Action plan workspace — 3-column layout |

State flows through `sessionStorage` under two keys defined as constants in `lib/types.ts`:

```ts
export const SESSION_KEYS = {
  profile: 'fn_profile',           // FounderProfile JSON
  recommendations: 'fn_recommendations', // Recommendation[] JSON
} as const
```

- `fn_profile` — `FounderProfile` set by `/api/extract`, read by `/review`, `/analyzing`, `/plan`
- `fn_recommendations` — `Recommendation[]` set by `/analyzing` after scoring, read by `/plan`

---

## 3. Data Model (`lib/types.ts`)

```ts
// The structured founder profile extracted by Claude from the scenario text.
// Every field maps to an editable row on the /review screen.
// Field values must match the official GOEO resource taxonomy so scoring works correctly.
type FounderProfile = {
  scenario: string          // original freeform text the user typed
  location: string          // Utah county name, e.g. "Cache" | "Salt Lake" | "Washington" | "Weber"
  stage: string             // maps to Topics: "Start a Business" | "Funding" | "Late Stage Growth" | "International Trade"
  industry: string          // one of 10 official categories (see CatalogItem.industries)
  community: string         // "Any" | "Women" | "Veteran" | "Rural" | "Student" | "Multicultural" | "New American"
  primaryGoal: string       // free text, e.g. "Permits, funding, and first advisors"
  urgency: string           // e.g. "Needs first-step plan this week"
  supportPreference: string // "self-service" | "human" | "mix"
  constraints: string       // e.g. "Limited time; wants clear sequence"
  assumptions: string[]     // list of field names Claude inferred rather than directly read (shown as badges)
}

// One entry from the official GOEO resource dataset (data/catalog.json).
// Shape mirrors the official spreadsheet — non-technical editors add resources
// by copying an entry and changing the fields; the app picks up changes immediately.
type CatalogItem = {
  id: string
  title: string
  description: string
  communities: string[]    // "Any" | "Women" | "Veteran" | "Rural" | "Student" | "Multicultural" | "New American"
  industries: string[]     // "Aerospace and Defense" | "Agriculture" | "Arts and Entertainment and Recreation" |
                           // "Consumer Packaged Goods" | "Financial Services" | "Hospitality and Food Services" |
                           // "Life Sciences and Healthcare" | "Manufacturing" | "Other" |
                           // "Software and Information Technology"
  locations: string[]      // Utah county names — all 29 counties present in dataset
  topics: string[]         // "Start a Business" | "Funding" | "Late Stage Growth" | "International Trade" |
                           // "Marketing and Sales" | "Entrepreneurship Communities" | "Taxes and Finance" |
                           // "Close or Exit a Business" | "Relocate a Business to Utah" | "Other"
  link: string             // primary URL for this resource
  email: string            // contact email, may be empty string
}

// A scored catalog item shown as a recommendation card on /plan.
type Recommendation = CatalogItem & {
  rank: number
  fitScore: number    // 0–5, computed by lib/score.ts
  fitLabel: string    // "Strong match" | "Good match" | "Worth knowing" — derived from fitScore
  matchedCriteria: number  // how many of 4 dimensions matched (shown as "3 of 4 matched")
  whyItFits: string        // assembled from matched dimensions by lib/score.ts
}
```

`fitLabel` derivation (applied in `lib/score.ts`, displayed on cards):
- `fitScore >= 4.0` → `"Strong match"`
- `fitScore >= 2.5` → `"Good match"`
- `fitScore < 2.5` → `"Worth knowing"`

---

## 4. Content Layer (`data/`)

### `data/catalog.json`
The full official GOEO resource dataset — 213 entries sourced from the Builder Day starter data pack. Each entry is a `CatalogItem`. Editors add a new resource by copying an existing entry and editing the fields; comments in the file explain every field and list accepted values.

The dataset covers all 29 Utah counties and the following communities, industries, and topics as enumerated in `CatalogItem` above. Notable entries include resources for each of the 6 official hackathon test personas:

| Persona | Key tags |
|---|---|
| Jordan — pre-seed, SLC | topics: Start a Business · community: Student · location: Salt Lake |
| Maria — agriculture, Washington County | industries: Agriculture · community: Women/Rural · location: Washington |
| Marcus — veteran, fabrication, Weber | community: Veteran · industries: Manufacturing · location: Weber |
| Priya — SaaS, raising seed, SLC | topics: Funding · industries: Software and Information Technology · location: Salt Lake |
| David — medical device, international | topics: International Trade, Late Stage Growth · industries: Life Sciences and Healthcare |
| Dr. Amir — research commercialization, SLC | community: Student · topics: Start a Business · location: Salt Lake |

### `data/config.ts`
All site-wide content a non-technical editor might want to change:

```ts
export const siteConfig = {
  // Homepage hero text
  hero: {
    headline: "Turn a founder question into a Utah action plan.",
    subheadline: "Founder's Navigator ranks the next best moves, explains why they fit, cites sources, and exports a plan that people and AI agents can use safely.",
    inputPlaceholder: "Describe your business situation…",
  },

  // 6 scenario chips — one per official hackathon test persona.
  // Clicking a chip populates the input and triggers extraction immediately.
  scenarioChips: [
    {
      label: "First steps",
      scenario: "I'm a first-time founder in Salt Lake City with a business idea and I'm not sure where to start. I'm a student and haven't registered a business yet.",
    },
    {
      label: "Agriculture",
      scenario: "I run a small agricultural operation near St. George. I'm a woman-owned business and I'm looking to scale but need help finding the right programs.",
    },
    {
      label: "Veteran founder",
      scenario: "I'm a veteran in Ogden starting a custom fabrication and manufacturing business. I need to know what programs and resources are available to me.",
    },
    {
      label: "Raising a round",
      scenario: "I'm a B2B SaaS founder in Salt Lake City. I've had paying customers for 18 months and I'm ready to raise my first venture round. I need to find angel groups and VCs.",
    },
    {
      label: "Going global",
      scenario: "I have a medical device company in Provo with 12 employees and FDA clearance. I want to expand to international markets and need to understand what Utah offers.",
    },
    {
      label: "Research spinout",
      scenario: "I'm a PhD candidate at the University of Utah commercializing my research into a company. I've never started a business before and need to understand my first steps.",
    },
  ],

  // Value proposition cards below the hero
  valuePropCards: [
    { icon: "format_list_numbered", title: "Ranked next moves", body: "Stop guessing. Get a clear, prioritized checklist of exactly what you need to do next to launch or scale your business." },
    { icon: "verified",             title: "Source-backed",    body: "Every recommendation ties directly to official state programs, verified links, and real contact information." },
    { icon: "smart_toy",            title: "Agent-ready",      body: "Export your customized plan as structured JSON or Markdown — ready for your AI agent, legal team, or advisor." },
  ],

  // Steps shown during the /analyzing animation (time-gated, not score-gated)
  analyzingSteps: [
    "Reading founder profile",
    "Matching stage, county, industry, and community",
    "Checking relevance and actionability",
    "Ranking by fit and criteria matched",
    "Preparing human-readable and agent-readable plan",
  ],

  // Metrics shown on the /plan metrics tab
  baselineMetrics: {
    label: "Synthetic benchmark (30-persona simulation)",
    rows: [
      { metric: "Time to usable plan", baseline: "27.8 min", target: "< 5 min" },
      { metric: "Actions / clicks",    baseline: "68.4",     target: "< 12" },
      { metric: "Completion",          baseline: "50%",      target: "> 85% target" },
      { metric: "Confidence",          baseline: "2.6 / 5",  target: "> 4.0 target" },
      { metric: "Next-step clarity",   baseline: "2.6 / 5",  target: "> 4.0 target" },
    ],
  },

  // Follow-up quick action chips on the /plan command bar (display only in prototype)
  followUpChips: [
    { label: "Show lower-effort steps", intent: "rerank_by_effort" },
    { label: "Focus on funding",        intent: "filter_funding" },
    { label: "Find human help first",   intent: "filter_human" },
    { label: "Export for agent",        intent: "export_agent" },
    { label: "Explain ranking",         intent: "explain_ranking" },
  ],
}
```

### `lib/defaults.ts`
Hardcoded fallback `FounderProfile` used when the `/api/extract` call fails for any reason (network error, API unavailable, freehand input with no chip context). Uses the Jordan persona — the simplest, most broadly applicable scenario:

```ts
export const DEFAULT_PROFILE: FounderProfile = {
  scenario: "I'm a first-time founder in Salt Lake City with a business idea and I'm not sure where to start.",
  location: "Salt Lake",
  stage: "Start a Business",
  industry: "Software and Information Technology",
  community: "Student",
  primaryGoal: "First steps and mentorship",
  urgency: "Exploring options",
  supportPreference: "mix",
  constraints: "No prior business experience",
  assumptions: ["stage", "industry", "community"],
}
```

---

## 5. API Route (`app/api/extract/route.ts`)

`POST /api/extract`  
Body: `{ scenario: string }`  
Response: `FounderProfile`

Calls Claude (claude-sonnet-4-6) with a structured system prompt that:
1. Instructs Claude to return **only** a JSON object matching `FounderProfile`
2. Lists each field with a one-line description and the accepted values from the official GOEO taxonomy (county names, 10 industry categories, community values, topic values)
3. Populates `assumptions` with the names of any fields Claude inferred rather than directly read from the scenario text

No streaming — simple `json()` response. If the call fails for any reason, the client falls back to `DEFAULT_PROFILE` from `lib/defaults.ts`.

---

## 6. Scoring (`lib/score.ts`)

Pure function — no AI, no async:

```
score(catalog: CatalogItem[], profile: FounderProfile): Recommendation[]
```

For each catalog item, score across 4 dimensions:
1. **Topic match** — `item.topics` includes `profile.stage` (1 pt)
2. **Industry match** — `item.industries` includes `profile.industry` (1 pt)
3. **Location match** — `item.locations` includes `profile.location` (1 pt)
4. **Community match** — `item.communities` includes `profile.community` OR `item.communities` includes `"Any"` (1 pt)

Urgency boost: +0.5 if `profile.urgency` contains "week" or "urgent" or "immediate" and the item's `topics` includes `"Start a Business"` (a proxy for quick, actionable resources).

Raw score range: 0–4.5. Normalize to 0–5 by multiplying by `5 / 4.5`. Sort descending, take top 5, assign ranks 1–5.

`fitLabel` assignment (stored on `Recommendation`):
- `>= 4.0` → `"Strong match"`
- `>= 2.5` → `"Good match"`
- `< 2.5` → `"Worth knowing"`

`whyItFits` template — assembled from which dimensions matched:
- Topic: `"aligns with your goal to {stage}"`
- Industry: `"serves {industry} businesses"`
- Location: `"available in {location} County"`
- Community: `"is specifically designed for {community} founders"`

Combine matched phrases: `"This resource {phrase1}, {phrase2}, and {phrase3}."`

---

## 7. Screen Specifications

### Screen 1 — `/` Homepage
Matches Stitch design "Homepage - Enhanced Visual Depth" pixel-for-pixel.

- Dark navy hero (`#0B1A2A`) with Utah landscape background image (served from `/public/`)
- Centered prompt input → on submit: POST `/api/extract`, store result in `sessionStorage[SESSION_KEYS.profile]`, navigate to `/review`
- 6 scenario chips from `siteConfig.scenarioChips` populate the input and trigger extraction immediately on click
- 3 value prop cards below hero, content from `siteConfig.valuePropCards`

### Screen 2 — `/review` Profile Review
Matches Stitch design "Profile Review - High Fidelity Concierge".

- Reads `sessionStorage[SESSION_KEYS.profile]`
- Each field renders as an editable row with a label, current value (inline `<input>`), and "Change" link
- Fields listed in `assumptions` show an orange "Assumed" badge
- Fields shown (in order): location, stage, industry, community, primaryGoal, urgency, supportPreference, constraints
- "Generate ranked action plan" → save edited profile back to `sessionStorage[SESSION_KEYS.profile]`, navigate to `/analyzing`
- "Use an example scenario" → navigate back to `/`

### Screen 3 — `/analyzing`
Matches Stitch design "Analyzing Your Scenario..."

- Full-screen dark navy overlay with centered white card
- 5 labeled steps from `siteConfig.analyzingSteps` animate in sequence (each step completes before the next starts)
- Animation is time-gated to ~2.5s total regardless of how fast `score()` completes; `score()` runs immediately on mount
- After final step, save `Recommendation[]` to `sessionStorage[SESSION_KEYS.recommendations]`, navigate to `/plan`
- "Edit profile" link navigates back to `/review`

### Screen 4 — `/plan` Action Plan Workspace
Matches Stitch design "Action Plan Workspace - Refined Bento Alignment".

Three-zone layout:

**Left rail**
- "Action Plan" header + current plan name (derived from `profile.industry + " Plan"`)
- Progress indicator (85% visual)
- Section links: Overview, Financials, Product, Marketing, Legal — rendered as `opacity-50 cursor-not-allowed` anchors with `title="Coming in production"` tooltip; no click handler
- "Search or command…" input (display only — no handler)
- Export buttons: Export Markdown, Export JSON (functional — see export formats below)

**Center pane**
- Result summary sentence (templated: `"Here are the top resources for a {community} {industry} founder in {location} looking to {stage}."`)
- 5 `RecommendationCard` components, ranked 1–5
- Each card: rank badge, `fitLabel` badge (Strong match / Good match / Worth knowing), title, "Why it fits" sentence, link button, criteria matched count (`"3 of 4 matched"`), community badge if not "Any", topics chips
- Action timeline (Today / This week / Next 30 days) — rank 1 card → Today, ranks 2–3 → This week, ranks 4–5 → Next 30 days
- Follow-up command bar with `siteConfig.followUpChips` — clicking any chip shows a toast `"Coming in production"`

**Right inspector** — tabs:
- **Profile** — read-only display of all `fn_profile` fields including `assumptions` badges
- **Sources** — list of `{ title, link, email }` from all 5 recommendations, with which rank each supports
- **Metrics** — baseline comparison table from `siteConfig.baselineMetrics`
- **Agent Plan** — live preview of the structured export payload, plus "Copy JSON" and "Copy Markdown" buttons

**Export formats:**

*Markdown* — one `##` block per recommendation, in rank order, with YAML frontmatter:
```markdown
---
generated: 2026-05-08
stage: Start a Business
industry: Software and Information Technology
location: Salt Lake
community: Student
---

# Founder's Navigator Action Plan

## 1. [Resource Title]
**Why it fits:** [whyItFits sentence]
**Learn more:** [link]
**Contact:** [email — omitted if empty]

## 2. [Resource Title]
...
```

*JSON* — the raw `Recommendation[]` array as pretty-printed JSON.

---

## 8. Design System

Tailwind config token names:

| Token | Value |
|---|---|
| `navy` | `#0B1A2A` |
| `gold` | `#ffae00` |
| `secondary` | `#006d3c` |
| `surface` | `#f7f9fb` |
| `on-surface` | `#191c1e` |
| `outline-variant` | `#d7c4ac` |

Fonts: `Space Grotesk` (headings) + `Public Sans` (body) via Google Fonts in `app/layout.tsx`.  
Icons: Material Symbols Outlined via Google Fonts CDN.

The Stitch HTML files in `stitch-designs/` are the reference. When building a component, open the matching Stitch file, copy the relevant Tailwind classes, and adapt to JSX.

---

## 9. Non-Technical Editing Guide (README section)

The spec requires a `## Editing Content` section in the project README explaining:

1. **Add a new resource:** Open `data/catalog.json`, copy the last entry, change the fields (each has an inline comment listing accepted values). Save. The app picks it up immediately.
2. **Change homepage text:** Open `data/config.ts`, find `siteConfig.hero`, edit the strings.
3. **Add or change a scenario chip:** Open `data/config.ts`, add or edit an entry in `siteConfig.scenarioChips`.
4. **Change the analyzing steps:** Open `data/config.ts`, find `siteConfig.analyzingSteps`.
5. **Change metrics:** Open `data/config.ts`, find `siteConfig.baselineMetrics`.

---

## 10. Out of Scope (Hackathon Build)

- User accounts / saved plans (navigation present, routes show "Coming soon")
- Real-time source verification / web scraping
- Follow-up command bar AI responses (chips show toast only)
- Left rail section links (Overview, Financials, etc.) — display only with tooltip
- Form submission to external agencies
- Mobile layout (desktop-first for demo)
