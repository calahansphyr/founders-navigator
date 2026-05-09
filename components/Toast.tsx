'use client'
import { useEffect } from 'react'

interface Props {
  message: string
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-deep-navy text-white px-5 py-3 rounded-full shadow-xl text-label-sm font-semibold z-50">
      {message}
    </div>
  )
}
