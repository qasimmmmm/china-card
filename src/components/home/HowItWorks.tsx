import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { howItWorks } from '@/content/marketing'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

export function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <SectionHeading
          eyebrow="Simple process"
          title="Your China Arrival Card in four easy steps"
          description="Complete your mandatory arrival declaration online — most travelers finish in under five minutes."
        />

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 90} className="relative">
              <div className="card-hover h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-cta">
                    {i + 1}
                  </span>
                  {i < howItWorks.length - 1 && (
                    <span className="hidden h-px flex-1 bg-line lg:block" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <Link href="/apply" className="btn-primary btn-lg">
            Start my application
            <ChevronRight  className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
