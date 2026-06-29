import { features } from '@/content/marketing'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

export function Features() {
  return (
    <section className="section" id="why-us">
      <div className="container">
        <SectionHeading
          eyebrow="Why travelers choose us"
          title="A smoother way to handle a mandatory form"
          description="The arrival card is free to file yourself — people pay us for the guidance, the human review, and the peace of mind."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="card-hover h-full p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={f.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
