import Link from 'next/link'

export default function Nav() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-subtle px-10 py-3 bg-white sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 text-deep-navy">
        <span
          className="material-symbols-outlined text-gold text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          explore
        </span>
        <span className="font-display text-xl font-bold">Founder's Navigator</span>
      </Link>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          {['Dashboard', 'My Profile', 'Resources'].map((label) => (
            <a
              key={label}
              href="#"
              className="text-label-sm font-sans text-on-surface-variant opacity-50 cursor-not-allowed"
              title="Coming in production"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-label-sm font-bold text-deep-navy">
          JS
        </div>
      </div>
    </header>
  )
}
