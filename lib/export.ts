import type { Recommendation, FounderProfile } from './types'

export function toMarkdown(recs: Recommendation[], profile: FounderProfile): string {
  const today = new Date().toISOString().split('T')[0]
  const frontmatter = [
    '---',
    `generated: ${today}`,
    `stage: ${profile.stage}`,
    `industry: ${profile.industry}`,
    `location: ${profile.location}`,
    `community: ${profile.community}`,
    '---',
  ].join('\n')

  const sections = recs.map((rec) => {
    const lines = [
      `## ${rec.rank}. ${rec.title}`,
      `**Why it fits:** ${rec.whyItFits}`,
      `**Learn more:** ${rec.link}`,
    ]
    if (rec.email) lines.push(`**Contact:** ${rec.email}`)
    return lines.join('\n')
  })

  return [frontmatter, "# Founder's Navigator Action Plan", ...sections].join('\n\n')
}

export function toJSON(recs: Recommendation[]): string {
  return JSON.stringify(recs, null, 2)
}
