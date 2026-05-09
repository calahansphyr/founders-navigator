'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Find Your Plan', href: '/' },
  { label: 'Browse Resources', href: '/resources' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-subtle px-10 py-3 bg-white sticky top-0 z-50">
      {/* Co-brand lockup */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <svg
          width="28"
          height="24"
          viewBox="0 0 28 24"
          fill="none"
          aria-hidden="true"
        >
          <polygon points="14,0 28,12 22,12 14,6 6,12 0,12" fill="#1de384" />
          <polygon
            points="14,8 28,24 22,24 14,14 6,24 0,24"
            fill="#1de384"
            opacity="0.6"
          />
        </svg>
        <div className="flex flex-col justify-center leading-none gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-startup-green">
            STARTUP STATE
          </span>
          <span className="font-display text-lg font-bold text-deep-navy">
            Founder's Navigator
          </span>
        </div>
      </Link>

      {/* Center nav links */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${
                isActive
                  ? 'text-deep-navy border-startup-green'
                  : 'text-on-surface-variant border-transparent hover:text-deep-navy'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right: official site link */}
      <a
        href="https://startup.utah.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-on-surface-variant hover:text-startup-green transition-colors flex items-center gap-1"
      >
        startup.utah.gov
        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
      </a>
    </header>
  )
}
