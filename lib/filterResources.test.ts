import { describe, it, expect } from 'vitest'
import { filterResources } from './filterResources'
import type { CatalogItem } from './types'

const makeItem = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
  id: '1',
  title: 'SBDC Training Program',
  description: 'Business development courses for new entrepreneurs',
  communities: ['Any'],
  industries: ['Software and Information Technology'],
  locations: ['Salt Lake'],
  topics: ['Start a Business'],
  link: 'https://example.com',
  email: '',
  ...overrides,
})

describe('filterResources', () => {
  it('returns all items when no filters applied', () => {
    const catalog = [makeItem(), makeItem({ id: '2' })]
    const result = filterResources(catalog, { query: '', topic: '', community: '', location: '' })
    expect(result).toHaveLength(2)
  })

  it('filters by title (case-insensitive)', () => {
    const catalog = [
      makeItem({ title: 'SBDC Program' }),
      makeItem({ id: '2', title: 'Angel Network' }),
    ]
    const result = filterResources(catalog, { query: 'sbdc', topic: '', community: '', location: '' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('SBDC Program')
  })

  it('filters by description (case-insensitive)', () => {
    const catalog = [
      makeItem({ description: 'For veteran entrepreneurs' }),
      makeItem({ id: '2', description: 'General business support' }),
    ]
    const result = filterResources(catalog, { query: 'veteran', topic: '', community: '', location: '' })
    expect(result).toHaveLength(1)
  })

  it('filters by topic', () => {
    const catalog = [
      makeItem({ topics: ['Funding'] }),
      makeItem({ id: '2', topics: ['Start a Business'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: 'Funding', community: '', location: '' })
    expect(result).toHaveLength(1)
    expect(result[0].topics).toContain('Funding')
  })

  it('filters by community (exact match)', () => {
    const catalog = [
      makeItem({ communities: ['Women'] }),
      makeItem({ id: '2', communities: ['Veteran'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: '', community: 'Women', location: '' })
    expect(result).toHaveLength(1)
  })

  it('includes "Any" community items when community filter is set', () => {
    const catalog = [
      makeItem({ id: '1', communities: ['Any'] }),
      makeItem({ id: '2', communities: ['Women'] }),
      makeItem({ id: '3', communities: ['Veteran'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: '', community: 'Veteran', location: '' })
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.id).sort()).toEqual(['1', '3'])
  })

  it('filters by location', () => {
    const catalog = [
      makeItem({ locations: ['Cache'] }),
      makeItem({ id: '2', locations: ['Weber'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: '', community: '', location: 'Cache' })
    expect(result).toHaveLength(1)
  })

  it('combines multiple filters with AND logic', () => {
    const catalog = [
      makeItem({ id: '1', topics: ['Funding'], locations: ['Salt Lake'] }),
      makeItem({ id: '2', topics: ['Funding'], locations: ['Cache'] }),
      makeItem({ id: '3', topics: ['Start a Business'], locations: ['Salt Lake'] }),
    ]
    const result = filterResources(catalog, { query: '', topic: 'Funding', community: '', location: 'Salt Lake' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns empty array when nothing matches', () => {
    const catalog = [makeItem({ topics: ['Funding'] })]
    const result = filterResources(catalog, { query: '', topic: 'International Trade', community: '', location: '' })
    expect(result).toHaveLength(0)
  })
})
