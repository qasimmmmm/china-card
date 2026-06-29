import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { legalNav, disclaimer } from '@/lib/site'
import { PageHero } from '@/components/layout/PageHero'

export function LegalLayout({
  title,
  updated,
  intro,
  activeHref,
  children,
}: {
  title: string
  updated: string
  intro?: string
  activeHref: string
  children: React.ReactNode
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={intro} />
      <section className="section pt-12">
        <div className="container grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Legal & policies</p>
            <nav className="mt-3 flex flex-col gap-1">
              {legalNav.map((l) => {
                const active = l.href === activeHref
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-surface-soft hover:text-navy'
                    }`}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          <div>
            <p className="mb-6 text-sm text-ink-muted">Last updated: {updated}</p>
            <div className="prose-clean max-w-prose">{children}</div>

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-line bg-surface-soft p-5">
              <ShieldAlert  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-soft">{disclaimer.full}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
