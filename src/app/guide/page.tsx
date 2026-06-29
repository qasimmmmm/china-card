import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { guides } from '@/content/guides'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'China travel guides',
  description:
    'Practical, up-to-date guides on China entry requirements, the Digital Arrival Card, 240-hour visa-free transit, and customs & health declarations.',
}

export default function GuideIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Travel guides"
        title="China entry, explained in plain English"
        description="Clear, current guides to help you prepare for a smooth arrival in China."
      />
      <section className="section pt-12">
        <div className="container grid gap-6 md:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guide/${g.slug}`} className="card-hover flex flex-col p-6">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <Clock  className="h-3.5 w-3.5" aria-hidden="true" /> {g.readingTime}
              </p>
              <h2 className="mt-3 text-lg font-bold text-navy">{g.title}</h2>
              <p className="mt-2 flex-1 text-sm text-ink-soft">{g.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                Read guide <ArrowRight  className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
