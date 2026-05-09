import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ScenarioInput from '@/components/ScenarioInput'
import ValuePropCards from '@/components/ValuePropCards'
import { siteConfig } from '@/data/config'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-grow flex flex-col">
        <section className="relative w-full overflow-hidden bg-navy text-white py-24 lg:py-48 flex flex-col items-center justify-center px-gutter border-b border-outline-variant">
          <div className="absolute inset-0 w-full h-full z-0 opacity-40">
            <img
              src="/utah-landscape.jpg"
              alt="Utah landscape"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/40 to-navy/90 z-[1]" />
          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
            <h1 className="text-5xl md:text-6xl font-display font-extrabold leading-tight">
              {siteConfig.hero.headline}
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">{siteConfig.hero.subheadline}</p>
            <ScenarioInput />
          </div>
        </section>
        <ValuePropCards />
      </main>
      <Footer />
    </>
  )
}
