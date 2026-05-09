'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SESSION_KEYS } from '@/lib/types'
import { DEFAULT_PROFILE } from '@/lib/defaults'
import ScenarioChips from './ScenarioChips'
import { siteConfig } from '@/data/config'

export default function ScenarioInput() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(scenario: string) {
    if (!scenario.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })
      const profile = res.ok ? await res.json() : DEFAULT_PROFILE
      sessionStorage.setItem(SESSION_KEYS.profile, JSON.stringify(profile))
    } catch {
      sessionStorage.setItem(SESSION_KEYS.profile, JSON.stringify(DEFAULT_PROFILE))
    }
    router.push('/review')
  }

  function handleChipSelect(scenario: string) {
    setValue(scenario)
    submit(scenario)
  }

  return (
    <div className="w-full max-w-3xl mt-4 flex flex-col items-center">
      <div className="w-full bg-white/20 backdrop-blur-md rounded-full p-2 flex items-center shadow-2xl border-2 border-white/40 focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/20 transition-all">
        <div className="pl-4 pr-2">
          <span className="material-symbols-outlined text-white/80">search</span>
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(value)}
          placeholder={siteConfig.hero.inputPlaceholder}
          className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/60 text-body-lg font-sans outline-none"
        />
        <button
          onClick={() => submit(value)}
          disabled={loading}
          className="bg-gold text-deep-navy font-label-sm uppercase tracking-wider px-8 py-4 rounded-full hover:bg-inverse-primary transition-colors font-bold whitespace-nowrap shadow-md disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Generate'}
        </button>
      </div>
      <ScenarioChips onSelect={handleChipSelect} />
    </div>
  )
}
