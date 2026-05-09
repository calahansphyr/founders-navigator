import type { FounderProfile } from './types'

export const DEFAULT_PROFILE: FounderProfile = {
  scenario: "I'm a first-time founder in Salt Lake City with a business idea and I'm not sure where to start.",
  location: 'Salt Lake',
  stage: 'Start a Business',
  industry: 'Software and Information Technology',
  community: 'Student',
  primaryGoal: 'First steps and mentorship',
  urgency: 'Exploring options',
  supportPreference: 'mix',
  constraints: 'No prior business experience',
  assumptions: ['stage', 'industry', 'community'],
}
