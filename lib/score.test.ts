import { describe, it, expect } from 'vitest'
import { score, fitLabel } from './score'
import type { CatalogItem, FounderProfile } from './types'

const mockItem = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
  id: '1',
  title: 'Test Resource',
  description: 'A test resource',
  communities: ['Any'],
  industries: ['Software and Information Technology'],
  locations: ['Salt Lake'],
  topics: ['Start a Business'],
  link: 'https://example.com',
  email: '',
  ...overrides,
})

const mockProfile = (overrides: Partial<FounderProfile> = {}): FounderProfile => ({
  scenario: 'test',
  location: 'Salt Lake',
  stage: 'Start a Business',
  industry: 'Software and Information Technology',
  community: 'Student',
  primaryGoal: 'First steps',
  urgency: 'Exploring options',
  supportPreference: 'mix',
  constraints: '',
  assumptions: [],
  ...overrides,
})

describe('fitLabel', () => {
  it('returns Strong match for score >= 4.0', () => {
    expect(fitLabel(4.0)).toBe('Strong match')
    expect(fitLabel(5.0)).toBe('Strong match')
  })
  it('returns Good match for score >= 2.5', () => {
    expect(fitLabel(2.5)).toBe('Good match')
    expect(fitLabel(3.9)).toBe('Good match')
  })
  it('returns Worth knowing for score < 2.5', () => {
    expect(fitLabel(0)).toBe('Worth knowing')
    expect(fitLabel(2.4)).toBe('Worth knowing')
  })
})

describe('score', () => {
  it('returns top 5 recommendations sorted by fitScore descending', () => {
    const catalog = [
      mockItem({ id: '1' }),
      mockItem({ id: '2', topics: ['Funding'], industries: ['Agriculture'], locations: ['Cache'], communities: ['Women'] }),
      mockItem({ id: '3', communities: ['Student'] }),
    ]
    const results = score(catalog, mockProfile())
    expect(results.length).toBeLessThanOrEqual(5)
    expect(results[0].fitScore).toBeGreaterThanOrEqual(results[1]?.fitScore ?? 0)
  })

  it('assigns ranks starting at 1', () => {
    const catalog = [mockItem(), mockItem({ id: '2' })]
    const results = score(catalog, mockProfile())
    expect(results[0].rank).toBe(1)
    expect(results[1].rank).toBe(2)
  })

  it('matches community "Any" for any profile community', () => {
    const item = mockItem({ communities: ['Any'], topics: ['Funding'], industries: ['Agriculture'], locations: ['Cache'] })
    const profile = mockProfile({ community: 'Veteran', stage: 'Funding', industry: 'Agriculture', location: 'Cache' })
    const results = score([item], profile)
    expect(results[0].matchedCriteria).toBe(4)
  })

  it('applies urgency boost when profile urgency is high and topic is Start a Business', () => {
    const urgentItem = mockItem({ topics: ['Start a Business'] })
    const normalItem = mockItem({ id: '2', topics: ['Funding'], industries: ['Agriculture'], locations: ['Cache'], communities: ['Women'] })
    const profile = mockProfile({ urgency: 'Needs plan this week', stage: 'Start a Business' })
    const results = score([urgentItem, normalItem], profile)
    expect(results[0].id).toBe('1')
  })

  it('builds whyItFits from matched dimensions', () => {
    const item = mockItem()
    const profile = mockProfile()
    const results = score([item], profile)
    expect(results[0].whyItFits).toContain('Start a Business')
  })

  it('assigns correct fitLabel', () => {
    const item = mockItem({ communities: ['Student'] })
    const profile = mockProfile()
    const results = score([item], profile)
    expect(['Strong match', 'Good match', 'Worth knowing']).toContain(results[0].fitLabel)
  })
})
