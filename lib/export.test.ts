import { describe, it, expect } from 'vitest'
import { toMarkdown, toJSON } from './export'
import type { Recommendation, FounderProfile } from './types'

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

const mockProfile = (): FounderProfile => ({
  scenario: 'test',
  location: 'Cache',
  stage: 'Start a Business',
  industry: 'Agriculture',
  community: 'Women',
  primaryGoal: 'First steps',
  urgency: 'This week',
  supportPreference: 'mix',
  constraints: '',
  assumptions: [],
})

describe('toMarkdown', () => {
  it('includes YAML frontmatter', () => {
    const md = toMarkdown([mockRec(1)], mockProfile())
    expect(md).toContain('---')
    expect(md).toContain('stage: Start a Business')
    expect(md).toContain('industry: Agriculture')
    expect(md).toContain('location: Cache')
    expect(md).toContain('community: Women')
  })

  it('includes one ## section per recommendation', () => {
    const md = toMarkdown([mockRec(1), mockRec(2)], mockProfile())
    expect(md).toContain('## 1. Resource 1')
    expect(md).toContain('## 2. Resource 2')
  })

  it('includes Why it fits and Learn more', () => {
    const md = toMarkdown([mockRec(1)], mockProfile())
    expect(md).toContain('**Why it fits:**')
    expect(md).toContain('**Learn more:**')
    expect(md).toContain('https://example.com/1')
  })

  it('includes Contact when email is present', () => {
    const md = toMarkdown([mockRec(1)], mockProfile())
    expect(md).toContain('**Contact:** contact@example.com')
  })

  it('omits Contact when email is empty', () => {
    const md = toMarkdown([mockRec(2)], mockProfile())
    expect(md).not.toContain('**Contact:**')
  })

  it('includes Your next step when nextStep is non-empty', () => {
    const md = toMarkdown([mockRec(1)], mockProfile())
    expect(md).toContain('**Your next step:**')
    expect(md).toContain('Schedule a free consulting session at the link above.')
  })

  it('omits Your next step when nextStep is empty', () => {
    const md = toMarkdown([mockRec(2)], mockProfile())
    expect(md).not.toContain('**Your next step:**')
  })
})

describe('toJSON', () => {
  it('returns valid JSON array', () => {
    const json = toJSON([mockRec(1), mockRec(2)])
    const parsed = JSON.parse(json)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].rank).toBe(1)
  })
})
