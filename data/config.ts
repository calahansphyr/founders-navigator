export const siteConfig = {
  hero: {
    headline: 'Turn a founder question into a Utah action plan.',
    subheadline: "Founder's Navigator ranks the next best moves, explains why they fit, cites sources, and exports a plan that people and AI agents can use safely.",
    inputPlaceholder: 'Describe your business situation…',
  },

  // 6 chips — one per official hackathon test persona
  scenarioChips: [
    {
      label: 'First steps',
      scenario: "I'm a first-time founder in Salt Lake City with a business idea and I'm not sure where to start. I'm a student and haven't registered a business yet.",
    },
    {
      label: 'Agriculture',
      scenario: "I run a small agricultural operation near St. George. I'm a woman-owned business and I'm looking to scale but need help finding the right programs.",
    },
    {
      label: 'Veteran founder',
      scenario: "I'm a veteran in Ogden starting a custom fabrication and manufacturing business. I need to know what programs and resources are available to me.",
    },
    {
      label: 'Raising a round',
      scenario: "I'm a B2B SaaS founder in Salt Lake City. I've had paying customers for 18 months and I'm ready to raise my first venture round. I need to find angel groups and VCs.",
    },
    {
      label: 'Going global',
      scenario: "I have a medical device company in Provo with 12 employees and FDA clearance. I want to expand to international markets and need to understand what Utah offers.",
    },
    {
      label: 'Research spinout',
      scenario: "I'm a PhD candidate at the University of Utah commercializing my research into a company. I've never started a business before and need to understand my first steps.",
    },
  ],

  valuePropCards: [
    {
      icon: 'format_list_numbered',
      title: 'Ranked next moves',
      body: 'Stop guessing. Get a clear, prioritized checklist of exactly what you need to do next to launch or scale your business.',
    },
    {
      icon: 'verified',
      title: 'Source-backed',
      body: 'Every recommendation ties directly to official state programs, verified links, and real contact information.',
    },
    {
      icon: 'smart_toy',
      title: 'Agent-ready',
      body: 'Export your customized plan as structured JSON or Markdown — ready for your AI agent, legal team, or advisor.',
    },
  ],

  analyzingSteps: [
    'Reading founder profile',
    'Matching stage, county, industry, and community',
    'Checking relevance and actionability',
    'Ranking by fit and criteria matched',
    'Preparing human-readable and agent-readable plan',
  ],

  baselineMetrics: {
    label: 'Synthetic benchmark (30-persona simulation)',
    rows: [
      { metric: 'Time to usable plan', baseline: '27.8 min', target: '< 5 min',  current: '0.26 min', pass: true },
      { metric: 'Actions / clicks',    baseline: '68.4',     target: '< 12',     current: '2',        pass: true },
      { metric: 'Completion',          baseline: '50%',      target: '> 85%',    current: '100%',     pass: true },
      { metric: 'Confidence',          baseline: '2.6 / 5',  target: '> 4.0',    current: '3.4 / 5',  pass: false },
      { metric: 'Next-step clarity',   baseline: '2.6 / 5',  target: '> 4.0',    current: '3.1 / 5',  pass: false },
    ],
  },

  followUpChips: [
    { label: 'Show lower-effort steps', intent: 'rerank_by_effort' },
    { label: 'Focus on funding',        intent: 'filter_funding' },
    { label: 'Find human help first',   intent: 'filter_human' },
    { label: 'Export for agent',        intent: 'export_agent' },
    { label: 'Explain ranking',         intent: 'explain_ranking' },
  ],

  leftRailSections: [
    { label: 'Overview',   icon: 'dashboard',   topics: null as string[] | null },
    { label: 'Financials', icon: 'payments',    topics: ['Funding', 'Taxes and Finance'] },
    { label: 'Product',    icon: 'inventory_2', topics: ['Start a Business', 'Late Stage Growth'] },
    { label: 'Marketing',  icon: 'campaign',    topics: ['Marketing and Sales', 'Entrepreneurship Communities'] },
    { label: 'Legal',      icon: 'work',        topics: ['Start a Business', 'International Trade'] },
  ],
}
