# Action Plan Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI-generated action steps to each recommendation card, make the left rail tabs functional (each tab filters the full catalog by topic and re-scores for the current founder), and add an AI provenance badge to the next-step callout.

**Architecture:** `score.ts` gains a `nextStep: ''` fallback on every `Recommendation`. The `/analyzing` page calls a new `/api/action-steps` route after scoring to fill `nextStep` with Claude-generated text. The `/plan` page imports the full catalog statically and re-runs `score()` on tab switch. `RecommendationCard` renders the callout only when `nextStep` is non-empty.

**Tech Stack:** Next.js 15 App Router · Anthropic SDK (`@anthropic-ai/sdk ^0.95.1`) · Tailwind CSS · Vitest

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/types.ts` | Modify | Add `nextStep: string` to `Recommendation` |
| `data/config.ts` | Modify | Add `leftRailSections` array |
| `lib/score.ts` | Modify | Set `nextStep: ''` on every scored item |
| `lib/score.test.ts` | Modify | Add test for `nextStep` field |
| `lib/export.ts` | Modify | Include `nextStep` in Markdown output |
| `lib/export.test.ts` | Modify | Update mock + add `nextStep` tests |
| `app/api/action-steps/route.ts` | Create | Claude call that returns 5 action step strings |
| `app/analyzing/page.tsx` | Modify | Call action-steps API; merge into recommendations before storing |
| `app/plan/page.tsx` | Modify | Active tab state, catalog import, derived displayedRecs, real nav buttons |
| `components/RecommendationCard.tsx` | Modify | Render next-step callout with AI badge |

---

## Task 1: Add `nextStep` to `Recommendation` type and update `data/config.ts`

**Files:**
- Modify: `lib/types.ts`
- Modify: `data/config.ts`

- [ ] **Step 1: Add `nextStep` to the `Recommendation` type**

Open `lib/types.ts`. Change the `Recommendation` type from:

```ts
export type Recommendation = CatalogItem & {
  rank: number
  fitScore: number
  fitLabel: 'Strong match' | 'Good match' | 'Worth knowing'
  matchedCriteria: number
  whyItFits: string
}
```

to:

```ts
export type Recommendation = CatalogItem & {
  rank: number
  fitScore: number
  fitLabel: 'Strong match' | 'Good match' | 'Worth knowing'
  matchedCriteria: number
  whyItFits: string
  nextStep: string
}
```

- [ ] **Step 2: Add `leftRailSections` to `data/config.ts`**

Open `data/config.ts`. Add the following property to `siteConfig`, before the closing `}`:

```ts
  leftRailSections: [
    { label: 'Overview',   icon: 'dashboard',   topics: null as string[] | null },
    { label: 'Financials', icon: 'payments',    topics: ['Funding', 'Taxes and Finance'] },
    { label: 'Product',    icon: 'inventory_2', topics: ['Start a Business', 'Late Stage Growth'] },
    { label: 'Marketing',  icon: 'campaign',    topics: ['Marketing and Sales', 'Entrepreneurship Communities'] },
    { label: 'Legal',      icon: 'work',        topics: ['Start a Business', 'International Trade'] },
  ],
```

The `null as string[] | null` annotation on the first entry keeps TypeScript from narrowing `topics` to `null` across the whole array — all entries share the union type `string[] | null`.

- [ ] **Step 3: Run existing tests to see what breaks**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run
```

Expected: failures in `lib/score.test.ts` and `lib/export.test.ts` because `score()` no longer satisfies `Recommendation` (missing `nextStep`) and `mockRec` factories don't include it. TypeScript errors may also appear. This is expected — proceed to Task 2.

---

## Task 2: Update `score.ts` to produce `nextStep`

**Files:**
- Modify: `lib/score.ts`
- Modify: `lib/score.test.ts`

- [ ] **Step 1: Write the failing test**

Open `lib/score.test.ts`. Add this test inside the `describe('score', ...)` block:

```ts
it('sets nextStep to empty string on every result', () => {
  const item = mockItem()
  const results = score([item], mockProfile())
  expect(results[0].nextStep).toBe('')
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run lib/score.test.ts
```

Expected: FAIL — `results[0].nextStep` is `undefined`.

- [ ] **Step 3: Update `score.ts` to include `nextStep`**

Open `lib/score.ts`. In the `scored` map, change the return from:

```ts
    return {
      ...item,
      fitScore,
      fitLabel: fitLabel(fitScore),
      matchedCriteria,
      whyItFits,
    }
```

to:

```ts
    return {
      ...item,
      fitScore,
      fitLabel: fitLabel(fitScore),
      matchedCriteria,
      whyItFits,
      nextStep: '',
    }
```

- [ ] **Step 4: Run score tests to confirm they pass**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run lib/score.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && git add lib/types.ts data/config.ts lib/score.ts lib/score.test.ts && git commit -m "feat: add nextStep field to Recommendation type and score output"
```

---

## Task 3: Update `export.ts` to include `nextStep` in Markdown

**Files:**
- Modify: `lib/export.ts`
- Modify: `lib/export.test.ts`

- [ ] **Step 1: Update `mockRec` in `export.test.ts` to include `nextStep`**

Open `lib/export.test.ts`. In `mockRec`, add `nextStep` to the returned object:

```ts
const mockRec = (rank: number): Recommendation => ({
  id: String(rank),
  title: `Resource ${rank}`,
  description: 'A resource',
  communities: ['Any'],
  industries: ['Agriculture'],
  locations: ['Cache'],
  topics: ['Start a Business'],
  link: `https://example.com/${rank}`,
  email: rank === 1 ? 'contact@example.com' : '',
  rank,
  fitScore: 4.5,
  fitLabel: 'Strong match',
  matchedCriteria: 3,
  whyItFits: 'This resource aligns with your goal.',
  nextStep: rank === 1 ? 'Schedule a free consulting session at the link above.' : '',
})
```

- [ ] **Step 2: Add failing tests for `nextStep` in Markdown**

In `lib/export.test.ts`, add these two tests inside `describe('toMarkdown', ...)`:

```ts
  it('includes Your next step when nextStep is non-empty', () => {
    const md = toMarkdown([mockRec(1)], mockProfile())
    expect(md).toContain('**Your next step:**')
    expect(md).toContain('Schedule a free consulting session at the link above.')
  })

  it('omits Your next step when nextStep is empty', () => {
    const md = toMarkdown([mockRec(2)], mockProfile())
    expect(md).not.toContain('**Your next step:**')
  })
```

- [ ] **Step 3: Run to confirm tests fail**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run lib/export.test.ts
```

Expected: the two new tests FAIL. Existing tests pass.

- [ ] **Step 4: Update `export.ts` to include `nextStep`**

Open `lib/export.ts`. Replace the `sections` map:

```ts
  const sections = recs.map((rec) => {
    const lines = [
      `## ${rec.rank}. ${rec.title}`,
      `**Why it fits:** ${rec.whyItFits}`,
      `**Learn more:** ${rec.link}`,
    ]
    if (rec.email) lines.push(`**Contact:** ${rec.email}`)
    return lines.join('\n')
  })
```

with:

```ts
  const sections = recs.map((rec) => {
    const lines = [
      `## ${rec.rank}. ${rec.title}`,
      `**Why it fits:** ${rec.whyItFits}`,
    ]
    if (rec.nextStep) lines.push(`**Your next step:** ${rec.nextStep}`)
    lines.push(`**Learn more:** ${rec.link}`)
    if (rec.email) lines.push(`**Contact:** ${rec.email}`)
    return lines.join('\n')
  })
```

- [ ] **Step 5: Run all export tests**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run lib/export.test.ts
```

Expected: all PASS.

- [ ] **Step 6: Run full test suite**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && git add lib/export.ts lib/export.test.ts && git commit -m "feat: include nextStep in Markdown export"
```

---

## Task 4: Create `/api/action-steps` route

**Files:**
- Create: `app/api/action-steps/route.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p "/Users/calahan/Desktop/Founder's Navigator/app/api/action-steps"
```

- [ ] **Step 2: Create the route file**

Create `app/api/action-steps/route.ts` with this content:

```ts
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { Recommendation, FounderProfile } from '@/lib/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You generate concrete action steps for startup founders based on official Utah business resources.

Return ONLY a valid JSON array of exactly 5 strings. No markdown, no explanation, no code fences.

Each string is one action step for a specific resource, written in second person ("Schedule...", "Visit...", "Email...").
Base each step ONLY on the provided resource data (title, description, link, email).
Do NOT invent program names, dollar amounts, dates, deadlines, or contact details not present in the input.
Keep each step to 1-2 sentences.`

export async function POST(request: Request) {
  try {
    const { recommendations, profile } = (await request.json()) as {
      recommendations: Recommendation[]
      profile: FounderProfile
    }

    const resourceSummaries = recommendations
      .map(
        (rec, i) =>
          `Resource ${i + 1}: ${rec.title}\nDescription: ${rec.description}\nLink: ${rec.link}\nEmail: ${rec.email || 'none'}`,
      )
      .join('\n\n')

    const userMessage = `Founder profile: ${profile.primaryGoal} — ${profile.stage} stage, ${profile.industry} industry, ${profile.location} County.

Generate one concrete action step per resource, in order:

${resourceSummaries}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const nextSteps: string[] = JSON.parse(text)
    return NextResponse.json({ nextSteps })
  } catch {
    return NextResponse.json({ error: 'action steps generation failed' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && git add app/api/action-steps/route.ts && git commit -m "feat: /api/action-steps route generates Claude action step per recommendation"
```

---

## Task 5: Update analyzing page to call action-steps API

**Files:**
- Modify: `app/analyzing/page.tsx`

- [ ] **Step 1: Replace `handleComplete` in `app/analyzing/page.tsx`**

The current `handleComplete` scores and stores. Replace it entirely with:

```ts
  const handleComplete = useCallback(() => {
    const stored = sessionStorage.getItem(SESSION_KEYS.profile)
    const profile: FounderProfile = stored ? JSON.parse(stored) : DEFAULT_PROFILE
    import('@/data/catalog.json').then(async (mod) => {
      const catalog = mod.default as CatalogItem[]
      const recommendations = score(catalog, profile)

      try {
        const res = await fetch('/api/action-steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recommendations, profile }),
        })
        if (res.ok) {
          const data = await res.json()
          const nextSteps: string[] = data.nextSteps ?? []
          nextSteps.forEach((step, i) => {
            if (recommendations[i]) recommendations[i].nextStep = step
          })
        } else {
          recommendations.forEach((rec) => {
            rec.nextStep = `Visit ${rec.link} to learn more.`
          })
        }
      } catch {
        recommendations.forEach((rec) => {
          rec.nextStep = `Visit ${rec.link} to learn more.`
        })
      }

      sessionStorage.setItem(SESSION_KEYS.recommendations, JSON.stringify(recommendations))
      router.push('/plan')
    })
  }, [router])
```

The rest of the file (JSX, the Edit profile button) is unchanged.

- [ ] **Step 2: Smoke-test the full flow manually**

Start the dev server if not running:

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npm run dev
```

Navigate to `http://localhost:3000`. Click the "First steps" chip. Confirm:
- `/review` loads with a profile
- `/analyzing` animates through all steps (may take slightly longer than before due to the Claude call)
- `/plan` loads
- In the browser console there are no errors from `/api/action-steps`

Open DevTools → Network. Confirm a POST to `/api/action-steps` appears with a 200 response containing `{ nextSteps: [...] }`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && git add app/analyzing/page.tsx && git commit -m "feat: generate AI action steps during analysis phase"
```

---

## Task 6: Update `RecommendationCard` with next-step callout and AI badge

**Files:**
- Modify: `components/RecommendationCard.tsx`

- [ ] **Step 1: Add the next-step callout block**

Open `components/RecommendationCard.tsx`. The current card body has, in order:
1. Fit label / rank badges
2. Title
3. "Why it fits" box (`bg-slate-50 p-3 rounded-lg`)
4. Topics / community chips
5. Footer with source badge + "View Resource" button

Add the next-step callout **between the "Why it fits" box and the topics chips**. The full updated component:

```tsx
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

      {rec.nextStep && (
        <div className="bg-innovation-orange/5 border border-innovation-orange/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-innovation-orange">
                arrow_forward
              </span>
              <span className="text-xs font-semibold text-innovation-orange">Your next step</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-slate-400">
                auto_awesome
              </span>
              <span className="text-[10px] text-slate-400">Claude</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{rec.nextStep}</p>
        </div>
      )}

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
```

- [ ] **Step 2: Verify in browser**

With the dev server running, run the full flow again (home → chip → review → analyzing → plan). On the `/plan` page, each card should now show the orange "Your next step" callout with the Claude badge. Cards rendered from tab filters (next task) will not show the callout since `nextStep` is `''`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && git add components/RecommendationCard.tsx && git commit -m "feat: next-step callout with Claude AI badge on recommendation cards"
```

---

## Task 7: Wire left rail tabs in the plan page

**Files:**
- Modify: `app/plan/page.tsx`

- [ ] **Step 1: Replace `app/plan/page.tsx` with the updated version**

The changes from the current file:
1. Remove the `LEFT_RAIL_LINKS` constant
2. Add imports for `catalog`, `score`, and `CatalogItem`
3. Add `activeSection` state
4. Add derived `displayedRecs` and updated `timelineGroups`
5. Replace the disabled nav anchors with real buttons from `siteConfig.leftRailSections`
6. Update center pane heading + empty state

Full updated file:

```tsx
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
```

- [ ] **Step 2: Run the full test suite**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run
```

Expected: all PASS.

- [ ] **Step 3: Verify tab behavior in browser**

With the dev server running, run the full flow (home → chip → plan). On `/plan`:

1. **Overview tab** (default): shows stored top-5 recs with Claude next-step callouts and AI badge
2. **Financials tab**: click it — center pane heading changes to "Financials", cards reload with funding/tax resources; no next-step callout (tab results have `nextStep: ''`)
3. **Product tab**: click — shows Start a Business / Late Stage Growth resources
4. **Marketing tab**: click — shows Marketing and Sales / Entrepreneurship Communities resources
5. **Legal tab**: click — shows Start a Business / International Trade resources
6. **Back to Overview**: next-step callouts reappear
7. **Sparse tab** (if any tab returns < 3 results for a persona): confirm the "No resources found" message appears with "View all recommendations →" button

Run all 6 scenario chips and spot-check that each persona gets sensible tab results.

- [ ] **Step 4: Commit**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && git add app/plan/page.tsx && git commit -m "feat: functional left rail tabs with personalized topic-filtered recommendations"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run full test suite one last time**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx vitest run
```

Expected: all PASS.

- [ ] **Step 2: TypeScript check**

```bash
cd "/Users/calahan/Desktop/Founder's Navigator" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Confirm exported Markdown includes next step**

Run the flow, reach `/plan`, click "Export Markdown". Open the downloaded file. Confirm each recommendation block includes a `**Your next step:**` line between `**Why it fits:**` and `**Learn more:**`.

- [ ] **Step 4: Confirm JSON export includes nextStep**

Click "Export JSON". Open the file. Confirm each object in the array has a `nextStep` string property.
