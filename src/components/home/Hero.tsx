import Link from 'next/link'
import { ChevronRight, ShieldCheck, Lock, CheckCircle2, Star } from 'lucide-react'
import { hero } from '@/content/marketing'
import { disclaimer } from '@/lib/site'
import { ChinaSkyline } from '@/components/brand/ChinaSkyline'
import { QrMock } from '@/components/ui/QrMock'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero text-white">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      <ChinaSkyline className="absolute inset-x-0 bottom-0 text-white" />

      <div className="container relative grid gap-12 pb-28 pt-16 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-32 lg:pt-24">
        {/* Left: copy */}
        <div className="max-w-xl">
          <span className="pill bg-white/12 text-white ring-1 ring-inset ring-white/20">
            <ShieldCheck  className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            Now required for entry — effective Nov 2025
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.07] sm:text-5xl lg:text-[3.35rem]">
            {hero.headline}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/85">{hero.sub}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/apply" className="btn-primary btn-lg bg-white !text-brand-700 hover:bg-white/90 hover:!text-brand-800">
              {hero.primaryCta}
              <ChevronRight  className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/#how-it-works"
              className="btn btn-lg border border-white/30 bg-white/5 text-white hover:bg-white/12"
            >
              {hero.secondaryCta}
            </Link>
          </div>

          {/* Trust micro-stats */}
          <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
            {hero.stats.map((s) => (
              <div key={s.label} className="border-l border-white/20 pl-3">
                <dt className="text-xl font-bold text-white">{s.value}</dt>
                <dd className="text-xs text-white/70">{s.label}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-7 max-w-lg rounded-xl bg-navy/30 p-3 text-[0.78rem] leading-relaxed text-white/75 ring-1 ring-inset ring-white/10">
            {disclaimer.hero}
          </p>
        </div>

        {/* Right: confirmation preview card */}
        <div className="relative lg:pl-6">
          <div className="relative mx-auto max-w-sm">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="card overflow-hidden text-ink animate-fade-up">
              <div className="flex items-center justify-between border-b border-line bg-surface-soft px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[0.7rem] font-bold text-white">
                    CN
                  </span>
                  <span className="text-sm font-semibold text-navy">Arrival Card · Confirmation</span>
                </div>
                <span className="pill bg-success-light text-success-dark">
                  <CheckCircle2  className="h-3.5 w-3.5" aria-hidden="true" /> Ready
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-4 p-5">
                <dl className="space-y-2.5 text-sm">
                  {[
                    ['Traveler', 'A. MORGAN'],
                    ['Reference', 'CAC-7F3K-9Q2D'],
                    ['Port of entry', 'Shanghai (PVG)'],
                    ['Arrival', '12 Jul 2026'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[0.68rem] uppercase tracking-wide text-ink-muted">{k}</dt>
                      <dd className="font-semibold text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-white p-2">
                  <QrMock size={88} />
                  <span className="text-[0.62rem] font-medium text-ink-muted">Scan at immigration</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-line bg-success-light/60 px-5 py-3 text-sm text-success-dark">
                <ShieldCheck  className="h-4 w-4" aria-hidden="true" />
                <span className="font-medium">Reviewed & checked by our team</span>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-10 hidden rounded-xl bg-white p-2.5 shadow-card sm:flex sm:items-center sm:gap-2">
              <Lock  className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <span className="text-xs font-semibold text-navy">256-bit secure</span>
            </div>
            <div className="absolute -bottom-4 -right-2 hidden rounded-xl bg-white p-2.5 shadow-card sm:flex sm:items-center sm:gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star  key={i} className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
                ))}
              </div>
              <span className="text-xs font-semibold text-navy">Trusted service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
