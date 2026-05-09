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
