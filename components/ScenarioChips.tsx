'use client'
import { siteConfig } from '@/data/config'

interface Props {
  onSelect: (scenario: string) => void
}

export default function ScenarioChips({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
      <span className="text-label-sm uppercase tracking-wider text-white/60 mr-2">Try:</span>
      {siteConfig.scenarioChips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.scenario)}
          className="px-4 py-2 rounded-full border border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/50 transition-colors text-label-sm backdrop-blur-sm"
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
