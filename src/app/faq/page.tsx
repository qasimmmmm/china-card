import type { Metadata } from 'next'
import Link from 'next/link'
import { faqs } from '@/content/marketing'
import { Accordion } from '@/components/ui/Accordion'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description:
    'Answers about the China Digital Arrival Card, who needs it, the 240-hour visa-free transit, pricing, refunds, and data security.',
}

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Help center"
        title="Frequently asked questions"
        description="Everything you need to know about the China Arrival Card and our independent assistance service."
      />
      <section className="section pt-12">
        <div className="container max-w-3xl">
          <Accordion items={faqs} />
          <div className="mt-8 rounded-2xl border border-line bg-surface-soft p-6 text-center">
            <p className="text-lg font-semibold text-navy">Still have a question?</p>
            <p className="mt-1 text-ink-soft">Our support team is available 24/7 and typically replies within 30 minutes.</p>
            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary btn-md">
                Contact support
              </Link>
              <Link href="/apply" className="btn btn-outline btn-md">
                Start my application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
