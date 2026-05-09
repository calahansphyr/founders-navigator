export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-border-subtle mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-gutter w-full max-w-container-max mx-auto gap-6">
        <div className="text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
          © 2024 State of Utah. An official Startup State initiative.
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          {['Privacy Policy', 'Accessibility', 'Terms of Service', 'Contact'].map((label) => (
            <a
              key={label}
              href="#"
              className="text-label-sm text-on-surface-variant hover:text-innovation-orange transition-colors font-medium"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
