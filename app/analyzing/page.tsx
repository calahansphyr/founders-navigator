'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AnalyzingAnimation from '@/components/AnalyzingAnimation'
import { SESSION_KEYS } from '@/lib/types'
import { DEFAULT_PROFILE } from '@/lib/defaults'
import { score } from '@/lib/score'
import type { CatalogItem, FounderProfile } from '@/lib/types'

export default function AnalyzingPage() {
  const router = useRouter()

  const handleComplete = useCallback(() => {
    const stored = sessionStorage.getItem(SESSION_KEYS.profile)
    const profile: FounderProfile = stored ? JSON.parse(stored) : DEFAULT_PROFILE
    import('@/data/catalog.json').then(async (mod) => {
      const catalog = mod.default as CatalogItem[]
      const recommendations = score(catalog, profile)

      try {
        const res = await fetch('/api/action-steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recommendations, profile }),
        })
        if (res.ok) {
          const data = await res.json()
          const nextSteps: string[] = data.nextSteps ?? []
          const whyItFits: string[] = data.whyItFits ?? []
          nextSteps.forEach((step, i) => {
            if (recommendations[i]) {
              recommendations[i].nextStep = step
              if (whyItFits[i]) recommendations[i].whyItFits = whyItFits[i]
            }
          })
        } else {
          recommendations.forEach((rec) => {
            rec.nextStep = `Visit ${rec.link} to learn more.`
          })
        }
      } catch {
        recommendations.forEach((rec) => {
          rec.nextStep = `Visit ${rec.link} to learn more.`
        })
      }

      sessionStorage.setItem(SESSION_KEYS.recommendations, JSON.stringify(recommendations))
      router.push('/plan')
    })
  }, [router])

  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #1e293b 0%, transparent 70%)',
        }}
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <circle cx="0" cy="0" r="1.5" fill="rgba(17, 223, 129, 0.3)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="relative z-10 w-full px-gutter flex flex-col items-center">
        <AnalyzingAnimation onComplete={handleComplete} />
        <button
          onClick={() => router.push('/review')}
          className="mt-6 text-white/50 hover:text-white transition-colors text-label-sm"
        >
          ← Edit profile
        </button>
      </div>
    </div>
  )
}
