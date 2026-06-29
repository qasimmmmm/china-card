import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ChevronRight, Lightbulb, ArrowRight } from 'lucide-react'
import { getGuide, guides, GUIDE_ORDER } from '@/content/guides'
import { PageHero } from '@/components/layout/PageHero'

export function generateStaticParams() {
  return GUIDE_ORDER.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return { title: 'Guide not found' }
  return {
    title: guide.title,
    description: guide.description,
    openGraph: { title: guide.title, description: guide.description, type: 'article' },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const others = guides.filter((g) => g.slug !== slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Travel guide" title={guide.title} description={guide.description}>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Clock  className="h-4 w-4" aria-hidden="true" /> {guide.readingTime}
        </p>
      </PageHero>

      <section className="section pt-12">
        <div className="container grid gap-12 lg:grid-cols-[1fr_300px]">
          <article className="prose-clean max-w-prose">
            {guide.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.bullets && (
                  <ul>
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
              <div className="not-prose mt-10 rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-navy">
                  <Lightbulb  className="h-5 w-5 text-brand-600" aria-hidden="true" /> Key takeaways
                </h3>
                <ul className="mt-3 space-y-2">
                  {guide.keyTakeaways.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-ink-soft">
                      <ChevronRight  className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-hero p-6 text-white">
              <h3 className="text-lg font-bold text-white">Need it done for you?</h3>
              <p className="mt-2 text-sm text-white/85">
                We’ll prepare, review, and submit your China Arrival Card — with a QR code ready to scan.
              </p>
              <Link href="/apply" className="btn-md mt-4 inline-flex bg-white !text-brand-700 hover:bg-white/90">
                Start application <ChevronRight  className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">More guides</p>
              <ul className="mt-3 space-y-3">
                {others.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guide/${g.slug}`} className="group flex items-start gap-2">
                      <ArrowRight  className="mt-1 h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      <span className="text-sm font-medium text-navy group-hover:text-brand-700">{g.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="container mt-12">
          <p className="rounded-xl border border-line bg-surface-soft p-4 text-xs text-ink-muted">
            This guide is for general information only and is not legal or immigration advice. Entry rules are
            set by the Chinese authorities and can change. iVisa Portal is an independent service and is not
            affiliated with any government. The China Arrival Card is free to file directly with the NIA.
          </p>
        </div>
      </section>
    </>
  )
}
