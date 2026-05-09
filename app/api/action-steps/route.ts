import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { Recommendation, FounderProfile } from '@/lib/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You generate personalized explanations and concrete action steps for startup founders based on official Utah business resources.

Return ONLY a valid JSON array of exactly 5 objects. No markdown, no explanation, no code fences.

Each object has exactly two fields:
- "whyItFits": 1-2 sentences explaining specifically why THIS resource matters for this founder's exact stage, industry, and goal. Be specific about what value it provides — do not list matching criteria. Write as if you are a knowledgeable advisor who knows both the founder and the resource.
- "nextStep": One concrete action the founder should take RIGHT NOW to engage this resource. Rules:
  - Start with an action verb (Email, Visit, Schedule, Apply, Call, Register)
  - Include the actual URL or email address from the resource data
  - Reference the founder's specific goal or stage so it feels personal
  - Do NOT invent program names, dollar amounts, dates, or contact details not present in the input
  - Keep to 1-2 sentences

Example of good output for one object:
{"whyItFits": "The SBDC offers free one-on-one counseling from advisors who specialize in funding strategy — exactly the kind of guidance you need to structure your raise and pitch Utah investors.", "nextStep": "Visit utahsbdc.org and request a free consultation, mentioning you are a women-owned company seeking Series A guidance so they connect you with the right advisor."}`

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

    const userMessage = `Founder: ${profile.primaryGoal}
Stage: ${profile.stage} | Industry: ${profile.industry} | Location: ${profile.location} County | Community: ${profile.community}
Constraints: ${profile.constraints || 'none'}

Generate a whyItFits explanation and nextStep action for each resource, in order:

${resourceSummaries}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const enriched: { whyItFits: string; nextStep: string }[] = JSON.parse(text)

    const nextSteps = enriched.map((e) => e.nextStep)
    const whyItFits = enriched.map((e) => e.whyItFits)

    return NextResponse.json({ nextSteps, whyItFits })
  } catch {
    return NextResponse.json({ error: 'action steps generation failed' }, { status: 500 })
  }
}
