import type { CatalogItem } from './types'

export interface ResourceFilters {
  query: string
  topic: string
  community: string
  location: string
}

export function filterResources(
  catalog: CatalogItem[],
  filters: ResourceFilters,
): CatalogItem[] {
  const { query, topic, community, location } = filters
  const q = query.toLowerCase()

  return catalog.filter((item) => {
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    const matchesTopic = !topic || item.topics.includes(topic)
    const matchesCommunity =
      !community ||
      item.communities.includes(community) ||
      item.communities.includes('Any')
    const matchesLocation = !location || item.locations.includes(location)
    return matchesQuery && matchesTopic && matchesCommunity && matchesLocation
  })
}
