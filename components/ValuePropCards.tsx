import { siteConfig } from '@/data/config'

export default function ValuePropCards() {
  return (
    <section className="w-full max-w-container-max mx-auto px-gutter py-section-padding">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-bento-gap">
        {siteConfig.valuePropCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-border-subtle rounded-bento p-component-padding flex flex-col gap-4 hover:shadow-lg hover:border-deep-navy transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-gold">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {card.icon}
              </span>
            </div>
            <h3 className="text-section-header uppercase text-on-surface">{card.title}</h3>
            <p className="text-body-md text-on-surface-variant">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
