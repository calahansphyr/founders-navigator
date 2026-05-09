'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProfileField from '@/components/ProfileField'
import { SESSION_KEYS, type FounderProfile } from '@/lib/types'
import { DEFAULT_PROFILE } from '@/lib/defaults'

const FIELD_CONFIG: Array<{ key: keyof FounderProfile; label: string; icon: string }> = [
  { key: 'location',          label: 'Location',           icon: 'location_on' },
  { key: 'stage',             label: 'Business Stage',     icon: 'rocket_launch' },
  { key: 'industry',          label: 'Industry Sector',    icon: 'domain' },
  { key: 'community',         label: 'Community',          icon: 'groups' },
  { key: 'primaryGoal',       label: 'Primary Goal',       icon: 'flag' },
  { key: 'urgency',           label: 'Timeline',           icon: 'calendar_month' },
  { key: 'supportPreference', label: 'Support Preference', icon: 'support_agent' },
  { key: 'constraints',       label: 'Constraints',        icon: 'warning' },
]

export default function ReviewPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEYS.profile)
    if (stored) setProfile(JSON.parse(stored))
  }, [])

  function updateField(key: keyof FounderProfile, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function handleGenerate() {
    sessionStorage.setItem(SESSION_KEYS.profile, JSON.stringify(profile))
    router.push('/analyzing')
  }

  return (
    <>
      <Nav />
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-section-padding">
        <div className="mb-8 max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-on-surface-variant hover:text-innovation-orange transition-colors duration-200"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">arrow_back</span>
            <span className="text-label-sm font-semibold">Use an example scenario</span>
          </button>
        </div>

        <div className="mb-10 max-w-4xl mx-auto">
          <h1 className="text-headline-lg font-display text-deep-navy mb-4">
            Confirm your business profile
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Review the details we extracted. Edit any field, then generate your action plan.
          </p>
        </div>

        <div className="bg-white border border-border-subtle rounded-bento mb-10 overflow-hidden max-w-4xl mx-auto shadow-lg">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-section-header uppercase text-deep-navy tracking-wider">
              Profile Details
            </h2>
          </div>
          <dl className="divide-y divide-border-subtle">
            {FIELD_CONFIG.map(({ key, label, icon }) => (
              <ProfileField
                key={key}
                label={label}
                icon={icon}
                value={String(profile[key] ?? '')}
                isAssumed={profile.assumptions.includes(key)}
                onChange={(val) => updateField(key, val)}
              />
            ))}
          </dl>
        </div>

        <div className="max-w-4xl mx-auto flex items-center gap-4 pt-4">
          <button
            onClick={handleGenerate}
            className="min-w-[220px] bg-deep-navy text-white py-3.5 px-6 rounded-lg text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            Generate Action Plan
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
