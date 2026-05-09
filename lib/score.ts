import type { CatalogItem, FounderProfile, Recommendation } from './types'

export function fitLabel(score: number): 'Strong match' | 'Good match' | 'Worth knowing' {
  if (score >= 4.0) return 'Strong match'
  if (score >= 2.5) return 'Good match'
  return 'Worth knowing'
}

export function score(catalog: CatalogItem[], profile: FounderProfile): Recommendation[] {
  const isUrgent = /week|urgent|immediate|asap/i.test(profile.urgency)

  const scored = catalog.map((item) => {
    let raw = 0
    let matchedCriteria = 0
    const matched: string[] = []

    if (item.topics.includes(profile.stage)) {
      raw += 1
      matchedCriteria += 1
      matched.push(`aligns with your goal to ${profile.stage}`)
    }
    if (item.industries.includes(profile.industry)) {
      raw += 1
      matchedCriteria += 1
      matched.push(`serves ${profile.industry} businesses`)
    }
    if (item.locations.includes(profile.location)) {
      raw += 1
      matchedCriteria += 1
      matched.push(`available in ${profile.location} County`)
    }
    if (item.communities.includes(profile.community) || item.communities.includes('Any')) {
      raw += 1
      matchedCriteria += 1
      if (profile.community !== 'Any' && item.communities.includes(profile.community)) {
        matched.push(`is specifically designed for ${profile.community} founders`)
      }
    }
    if (isUrgent && item.topics.includes('Start a Business')) {
      raw += 0.5
    }

    const fitScore = Math.min(5, (raw / 4.5) * 5)
    const whyItFits = matched.length > 0
      ? `This resource ${matched.join(', ')}.`
      : 'This resource may be relevant to your situation.'

    return {
      ...item,
      fitScore,
      fitLabel: fitLabel(fitScore),
      matchedCriteria,
      whyItFits,
      nextStep: '',
    }
  })

  return scored
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5)
    .map((item, i) => ({ ...item, rank: i + 1 }))
}
