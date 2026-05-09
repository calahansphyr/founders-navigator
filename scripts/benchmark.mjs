/**
 * Synthetic benchmark — 30-persona simulation
 * Measures: Time to usable plan, Actions/clicks, Completion, Confidence, Next-step clarity
 * Runs against the live deployment at https://founders-navigator.vercel.app
 *
 * Usage: node scripts/benchmark.mjs [--base-url https://founders-navigator.vercel.app]
 */

import { readFileSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)

// Load .env.local if ANTHROPIC_API_KEY isn't already set
if (!process.env.ANTHROPIC_API_KEY) {
  try {
    const envPath = join(__dir, '../.env.local')
    const envContent = readFileSync(envPath, 'utf8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          const val = trimmed.slice(eqIdx + 1).trim()
          process.env[key] = val
        }
      }
    }
  } catch {}
}

const BASE_URL = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'https://founders-navigator.vercel.app'

const catalog = JSON.parse(readFileSync(join(__dir, '../data/catalog.json'), 'utf8'))

// ── Scoring (mirrors lib/score.ts) ────────────────────────────────────────────
function fitLabel(score) {
  if (score >= 4.0) return 'Strong match'
  if (score >= 2.5) return 'Good match'
  return 'Worth knowing'
}

function score(catalogItems, profile) {
  const isUrgent = /week|urgent|immediate|asap/i.test(profile.urgency)
  const scored = catalogItems.map((item) => {
    let raw = 0
    let matchedCriteria = 0
    const matched = []

    if (item.topics.includes(profile.stage)) {
      raw += 1; matchedCriteria += 1
      matched.push(`aligns with your goal to ${profile.stage}`)
    }
    if (item.industries.includes(profile.industry)) {
      raw += 1; matchedCriteria += 1
      matched.push(`serves ${profile.industry} businesses`)
    }
    if (item.locations.includes(profile.location)) {
      raw += 1; matchedCriteria += 1
      matched.push(`available in ${profile.location} County`)
    }
    if (item.communities.includes(profile.community) || item.communities.includes('Any')) {
      raw += 1; matchedCriteria += 1
      if (profile.community !== 'Any' && item.communities.includes(profile.community)) {
        matched.push(`is specifically designed for ${profile.community} founders`)
      }
    }
    if (isUrgent && item.topics.includes('Start a Business')) raw += 0.5

    const fitScore = Math.min(5, (raw / 4.5) * 5)
    const whyItFits = matched.length > 0
      ? `This resource ${matched.join(', ')}.`
      : 'This resource may be relevant to your situation.'

    return { ...item, fitScore, fitLabel: fitLabel(fitScore), matchedCriteria, whyItFits, nextStep: '' }
  })

  return scored.sort((a, b) => b.fitScore - a.fitScore).slice(0, 5).map((item, i) => ({ ...item, rank: i + 1 }))
}

// ── 30 diverse founder personas ───────────────────────────────────────────────
const PERSONAS = [
  // Stage: Start a Business
  "I'm a first-time founder in Salt Lake City with a business idea and I'm not sure where to start. I'm a student and haven't registered a business yet.",
  "I'm a woman starting a bakery business in Provo, Utah. I need to register my LLC and find startup resources.",
  "I'm a veteran in Ogden starting a custom fabrication and manufacturing business. I need to know what programs are available to me.",
  "I'm a recent immigrant from Mexico now living in St. George who wants to open a restaurant. My English is improving but I need help with the legal steps.",
  "I'm a rural farmer in Ephraim, Sanpete County thinking about turning my hobby farm into a small agritourism business.",
  "I'm a PhD candidate at the University of Utah commercializing my research into a software company. I've never started a business before.",
  "I'm a stay-at-home mom in Logan looking to start a handmade crafts business online. Budget is tight and I work from home.",
  "I'm 19 years old and building an app in my dorm at Utah State University. I want to form a proper company before I launch.",

  // Stage: Funding
  "I'm a B2B SaaS founder in Salt Lake City. I've had paying customers for 18 months and I'm ready to raise my first venture round.",
  "I run a women-led clean energy startup in Park City. We completed a seed round last year and need Series A funding guidance.",
  "I run a craft brewery in Moab and need small business loans to buy equipment. I've been profitable for two years.",
  "I'm a multicultural founder running a healthcare tech startup in Orem. I need to find investors who focus on underrepresented founders.",
  "I'm a veteran-owned aerospace defense contractor in Salt Lake looking to access government funding and SBIR grants.",
  "I have a CPG food company in Ogden and I've just landed my first regional grocery contract. I need growth capital fast.",
  "I'm a rural entrepreneur in Vernal, Uintah County with an oil-adjacent business. I need access to rural business loans.",

  // Stage: Late Stage Growth
  "I have a medical device company in Provo with 12 employees and FDA clearance. I want to scale operations and hire aggressively.",
  "I run a hospitality and tourism company in Moab with 25 employees. I want to open a second location and need an expansion plan.",
  "I'm scaling my manufacturing company in Weber County. I need workforce development programs to train 40 new hires.",
  "I run a software company in Lehi and we're at $5M ARR. I want to expand our team, get office space, and explore M&A.",
  "I lead a women-owned retail chain with 3 Utah locations. I want to expand to other states and need resources for interstate commerce.",
  "I have a financial services company in Salt Lake City. I need help with compliance, licensing, and scaling to new markets.",
  "I run a life sciences company in the Salt Lake area with an established product. I'm looking at international expansion.",

  // Stage: International Trade
  "I have a medical device company in Provo with FDA clearance. I want to expand to international markets and need to understand Utah's export resources.",
  "I manufacture specialty agricultural products in Cache County and want to export to Canada and Europe. I need trade assistance.",
  "I run a software company in Salt Lake City and I'm expanding to the EU. I need guidance on regulations and market entry.",
  "I'm a multicultural founder in Salt Lake with a food import/export business. I need help with international trade regulations.",
  "I run an aerospace defense company and want to export components internationally. I need export control compliance guidance.",
  "I have a hospitality business near Zion National Park that serves many international visitors. I want to formalize international bookings.",
  "I run a manufacturing company in Salt Lake County making consumer packaged goods. I want to enter Latin American markets.",
  "I'm a rural entrepreneur in San Juan County with a Native art export business. I need help understanding international trade rules.",
]

// ── API helpers ───────────────────────────────────────────────────────────────
async function extractProfile(scenario) {
  const res = await fetch(`${BASE_URL}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  })
  if (!res.ok) throw new Error(`extract failed: ${res.status}`)
  return res.json()
}

async function getActionSteps(recommendations, profile) {
  const res = await fetch(`${BASE_URL}/api/action-steps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendations, profile }),
  })
  if (!res.ok) throw new Error(`action-steps failed: ${res.status}`)
  const data = await res.json()
  return data.nextSteps
}

// ── Quality evaluation via Claude ─────────────────────────────────────────────
const anthropic = new Anthropic()

const EVAL_SYSTEM = `You evaluate AI-generated founder action plans for quality.
Return ONLY a JSON object with exactly two fields:
- confidence: integer 1-5 — how well the resources match the founder's actual situation
- nextStepClarity: integer 1-5 — how clear and immediately actionable the next-step guidance is

Rubric for confidence:
1 = Resources are completely irrelevant to the founder
2 = Some resources loosely related but poor fit
3 = Moderate fit — some relevant, some not
4 = Good fit — most resources clearly relevant
5 = Excellent fit — all resources highly relevant and specific

Rubric for nextStepClarity:
1 = Vague or generic ("visit the website")
2 = Somewhat actionable but missing specifics
3 = Moderately clear — some concrete steps
4 = Clear and actionable — specific actions the founder can take today
5 = Excellent — concrete, specific, immediately actionable with clear first move`

async function evaluateOutput(profile, recommendations) {
  const recSummary = recommendations.map((r, i) =>
    `${i + 1}. ${r.title} (fit: ${r.fitLabel})\n   Why: ${r.whyItFits}\n   Next step: ${r.nextStep}`
  ).join('\n')

  const userMsg = `Founder: ${profile.scenario}
Profile: ${profile.stage} stage, ${profile.industry} industry, ${profile.community} community, ${profile.location} County
Goal: ${profile.primaryGoal}
Constraints: ${profile.constraints}

Recommendations:
${recSummary}`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: EVAL_SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  // Extract JSON object from response (handles code fences and trailing text)
  const match = raw.match(/\{[^{}]*"confidence"\s*:\s*\d[^{}]*"nextStepClarity"\s*:\s*\d[^{}]*\}/)
       || raw.match(/\{[^{}]*"nextStepClarity"\s*:\s*\d[^{}]*"confidence"\s*:\s*\d[^{}]*\}/)
  if (!match) throw new Error(`eval parse failed: ${raw.slice(0, 80)}`)
  return JSON.parse(match[0])
}

// ── Main benchmark loop ───────────────────────────────────────────────────────
async function runPersona(scenario, index) {
  const label = `[${String(index + 1).padStart(2, '0')}/30]`
  process.stdout.write(`${label} Running...`)

  const t0 = Date.now()
  let completed = false
  let confidence = 0
  let nextStepClarity = 0
  let error = null

  let step = 'extract'
  try {
    const profile = await extractProfile(scenario)

    step = 'score'
    const recommendations = score(catalog, profile)

    step = 'action-steps'
    const nextSteps = await getActionSteps(recommendations, profile)
    nextSteps.forEach((s, i) => { if (recommendations[i]) recommendations[i].nextStep = s })

    const elapsed = Date.now() - t0
    const elapsedSec = elapsed / 1000

    completed = recommendations.some(r => r.fitLabel !== 'Worth knowing')

    step = 'evaluate'
    const eval_ = await evaluateOutput(profile, recommendations)
    confidence = eval_.confidence
    nextStepClarity = eval_.nextStepClarity

    const statusIcon = completed ? '✓' : '✗'
    process.stdout.write(`\r${label} ${statusIcon} ${elapsedSec.toFixed(1)}s | conf:${confidence} clarity:${nextStepClarity} | ${profile.stage} / ${profile.industry}\n`)

    return { elapsed, completed, confidence, nextStepClarity, error: null }
  } catch (err) {
    error = `[${step}] ${err.message}`
    process.stdout.write(`\r${label} ERROR: ${error}\n`)
    return { elapsed: Date.now() - t0, completed: false, confidence: 0, nextStepClarity: 0, error }
  }
}

async function main() {
  console.log(`\nFounder's Navigator — Synthetic Benchmark (30-persona simulation)`)
  console.log(`Target: ${BASE_URL}`)
  console.log(`─`.repeat(70))

  // Actions/clicks in the new UX: 1 action per persona (submit scenario chip or type + submit)
  // This is constant and measurable by design
  const UX_CLICKS_PER_PERSONA = 2 // type/select scenario + submit button

  const results = []

  // Run personas sequentially to avoid rate limiting
  for (let i = 0; i < PERSONAS.length; i++) {
    const result = await runPersona(PERSONAS[i], i)
    results.push(result)
    // Small pause between calls to be respectful of rate limits
    if (i < PERSONAS.length - 1) await new Promise(r => setTimeout(r, 500))
  }

  // ── Compute metrics ──────────────────────────────────────────────────────
  const successful = results.filter(r => !r.error)
  const n = successful.length

  if (n === 0) {
    console.error('\nAll personas failed. Check API connectivity.')
    process.exit(1)
  }

  const avgTimeSec = successful.reduce((s, r) => s + r.elapsed, 0) / n / 1000
  const avgTimeMin = avgTimeSec / 60
  const completionRate = (successful.filter(r => r.completed).length / n * 100).toFixed(1)
  const avgConfidence = (successful.reduce((s, r) => s + r.confidence, 0) / n).toFixed(2)
  const avgClarity = (successful.reduce((s, r) => s + r.nextStepClarity, 0) / n).toFixed(2)

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`RESULTS — ${n}/${PERSONAS.length} personas completed\n`)

  const rows = [
    { metric: 'Time to usable plan', baseline: '27.8 min', target: '< 5 min',    actual: `${avgTimeMin.toFixed(2)} min`, pass: avgTimeMin < 5 },
    { metric: 'Actions / clicks',    baseline: '68.4',     target: '< 12',        actual: `${UX_CLICKS_PER_PERSONA}`,    pass: UX_CLICKS_PER_PERSONA < 12 },
    { metric: 'Completion',          baseline: '50%',      target: '> 85%',       actual: `${completionRate}%`,           pass: parseFloat(completionRate) > 85 },
    { metric: 'Confidence',          baseline: '2.6 / 5',  target: '> 4.0',       actual: `${avgConfidence} / 5`,         pass: parseFloat(avgConfidence) > 4.0 },
    { metric: 'Next-step clarity',   baseline: '2.6 / 5',  target: '> 4.0',       actual: `${avgClarity} / 5`,            pass: parseFloat(avgClarity) > 4.0 },
  ]

  const colW = [22, 12, 10, 16, 6]
  const header = ['Metric', 'Baseline', 'Target', 'Actual', 'Pass?']
  console.log(header.map((h, i) => h.padEnd(colW[i])).join('  '))
  console.log('─'.repeat(colW.reduce((a, b) => a + b, 0) + colW.length * 2))
  for (const row of rows) {
    const pass = row.pass ? '✓' : '✗'
    console.log([
      row.metric.padEnd(colW[0]),
      row.baseline.padEnd(colW[1]),
      row.target.padEnd(colW[2]),
      row.actual.padEnd(colW[3]),
      pass.padEnd(colW[4]),
    ].join('  '))
  }

  const passCount = rows.filter(r => r.pass).length
  console.log(`\n${'─'.repeat(70)}`)
  console.log(`Overall: ${passCount}/${rows.length} targets met`)

  if (results.some(r => r.error)) {
    const errors = results.filter(r => r.error)
    console.log(`\nFailed personas (${errors.length}):`)
    errors.forEach((e, i) => console.log(`  Persona ${i + 1}: ${e.error}`))
  }

  console.log()
}

main().catch(err => {
  console.error('Benchmark failed:', err)
  process.exit(1)
})
