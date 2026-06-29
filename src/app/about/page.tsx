import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Globe2, ShieldCheck, HeartHandshake, ChevronRight } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { site, disclaimer } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About us',
  description:
    'iVisa Portal is an independent travel-document assistance service helping travelers complete the China Arrival Card with confidence.',
}

const weDo = [
  'Turn the official form into a simple English questionnaire',
  'Review every application for errors before submission',
  'Submit your Arrival Card and deliver your QR confirmation',
  'Offer 24/7 human support across every time zone',
]
const weDont = [
  'Claim to be a government website or official portal',
  'Issue the Arrival Card ourselves — only the NIA does',
  'Guarantee approval or influence immigration decisions',
  'Hide that the official card is free to file yourself',
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Travel documents, made effortless"
        description={`${site.brand} is an independent service that helps travelers prepare and submit entry documents quickly, accurately, and stress-free.`}
      />

      <section className="section pt-12">
        <div className="container space-y-12">
          <div className="prose-clean max-w-prose">
            <p>
              Crossing borders should be the easy part of a trip. But government forms are often confusing,
              full of unfamiliar terminology, and unforgiving of small mistakes. We started {site.brand} to fix
              that — to give travelers a calm, guided way to handle mandatory entry documents like the China
              Digital Arrival Card, backed by real human review and support.
            </p>
            <p>
              We’re transparent about what we are: a private, independent assistance service. The official
              Arrival Card is free to file yourself, and we’ll always tell you that. What we offer is
              convenience, accuracy, and peace of mind — so you can focus on the trip, not the paperwork.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <Check className="h-5 w-5 text-success" /> What we do
              </h2>
              <ul className="mt-4 space-y-3">
                {weDo.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[0.95rem] text-ink">
                    <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <X className="h-5 w-5 text-accent" /> What we don’t do
              </h2>
              <ul className="mt-4 space-y-3">
                {weDont.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[0.95rem] text-ink-soft">
                    <X className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Globe2, title: 'Traveler-first', desc: 'Plain language, no jargon, and help whenever you need it.' },
              { icon: ShieldCheck, title: 'Trustworthy', desc: 'Transparent pricing, honest disclaimers, and secure data handling.' },
              { icon: HeartHandshake, title: 'Accountable', desc: 'A money-back guarantee and a team that owns its mistakes.' },
            ].map((v) => (
              <div key={v.title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy">{v.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-surface-soft p-6">
            <p className="text-sm leading-relaxed text-ink-soft">{disclaimer.full}</p>
          </div>

          <div className="text-center">
            <Link href="/apply" className="btn-primary btn-lg">
              Start your application <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
