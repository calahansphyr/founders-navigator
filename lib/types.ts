export const SESSION_KEYS = {
  profile: 'fn_profile',
  recommendations: 'fn_recommendations',
} as const

export type FounderProfile = {
  scenario: string
  location: string        // Utah county, e.g. "Salt Lake"
  stage: string           // "Start a Business" | "Funding" | "Late Stage Growth" | "International Trade"
  industry: string        // one of 10 official GOEO categories
  community: string       // "Any" | "Women" | "Veteran" | "Rural" | "Student" | "Multicultural" | "New American"
  primaryGoal: string
  urgency: string
  supportPreference: string // "self-service" | "human" | "mix"
  constraints: string
  assumptions: string[]
}

export type CatalogItem = {
  id: string
  title: string
  description: string
  communities: string[]
  industries: string[]
  locations: string[]
  topics: string[]
  link: string
  email: string
}

export type Recommendation = CatalogItem & {
  rank: number
  fitScore: number
  fitLabel: 'Strong match' | 'Good match' | 'Worth knowing'
  matchedCriteria: number
  whyItFits: string
}
