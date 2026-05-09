import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { FounderProfile } from '@/lib/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You extract a structured founder profile from a freeform scenario description.
Return ONLY a valid JSON object. No markdown, no explanation, no code fences.

Fields and accepted values:
- scenario: the original text verbatim
- location: a Utah county name. Choose from: Beaver, Box Elder, Cache, Carbon, Daggett, Davis, Duchesne, Emery, Garfield, Grand, Iron, Juab, Kane, Millard, Morgan, Piute, Rich, Salt Lake, San Juan, Sanpete, Sevier, Summit, Tooele, Uintah, Utah, Wasatch, Washington, Wayne, Weber. Default: "Salt Lake"
- stage: one of exactly: "Start a Business" | "Funding" | "Late Stage Growth" | "International Trade"
- industry: one of exactly: "Aerospace and Defense" | "Agriculture" | "Arts and Entertainment and Recreation" | "Consumer Packaged Goods" | "Financial Services" | "Hospitality and Food Services" | "Life Sciences and Healthcare" | "Manufacturing" | "Other" | "Software and Information Technology"
- community: one of exactly: "Any" | "Women" | "Veteran" | "Rural" | "Student" | "Multicultural" | "New American"
- primaryGoal: short phrase describing the founder's main goal
- urgency: short phrase describing timeline or urgency
- supportPreference: one of "self-service" | "human" | "mix"
- constraints: short phrase about limitations or constraints, or empty string
- assumptions: array of field name strings that you inferred rather than directly read from the scenario

Example output:
{"scenario":"I'm a veteran starting a manufacturing business in Ogden.","location":"Weber","stage":"Start a Business","industry":"Manufacturing","community":"Veteran","primaryGoal":"Register business and find startup resources","urgency":"Ready to start now","supportPreference":"human","constraints":"","assumptions":["supportPreference"]}`

export async function POST(request: Request) {
  try {
    const { scenario } = await request.json()
    if (!scenario || typeof scenario !== 'string') {
      return NextResponse.json({ error: 'scenario required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: scenario }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const profile: FounderProfile = JSON.parse(text)
    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: 'extraction failed' }, { status: 500 })
  }
}
