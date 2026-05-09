'use client'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/data/config'

interface Props {
  onComplete: () => void
}

const STEP_DURATION = 500

export default function AnalyzingAnimation({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const steps = siteConfig.analyzingSteps

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete()
      return
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1)
      setProgress(Math.round(((currentStep + 1) / steps.length) * 100))
    }, STEP_DURATION)
    return () => clearTimeout(timer)
  }, [currentStep, steps.length, onComplete])

  return (
    <div className="bg-white rounded-bento border border-border-subtle p-12 flex flex-col items-center text-center shadow-lg w-full max-w-lg">
      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#11DF81] opacity-20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-4 border-t-[#11DF81] border-r-[#11DF81] border-b-transparent border-l-transparent animate-spin" />
        <span className="material-symbols-outlined text-4xl text-[#11DF81]">search</span>
      </div>

      <h1 className="text-headline-md font-display text-on-surface mb-2">Analyzing Profile</h1>
      <p className="text-body-md text-on-surface-variant mb-8">
        Matching your business needs with Utah's ecosystem.
      </p>

      <div className="w-full bg-surface-container-low border border-border-subtle rounded p-4 mb-8 text-left h-20 flex items-center overflow-hidden">
        <span className="font-mono text-sm text-deep-navy/80">
          <span className="text-[#11DF81] mr-2">&gt;&gt;</span>
          {steps[Math.min(currentStep, steps.length - 1)]}
          <span className="animate-pulse">_</span>
        </span>
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            Progress
          </span>
          <span className="text-label-sm text-on-surface font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-[#11DF81] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
