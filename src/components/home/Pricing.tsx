import Link from 'next/link'
import { Check, Clock, Info } from 'lucide-react'
import { pricing } from '@/content/marketing'
import { formatUSD } from '@/lib/utils'
import { disclaimer } from '@/lib/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils'

export function Pricing() {
  return (
    <section className="section bg-surface-soft" id="pricing">
      <div className="container">
        <SectionHeading
          eyebrow="Transparent pricing"
          title="Choose the speed that fits your trip"
          description="One simple service fee per traveler. No subscriptions, no hidden charges — and the price you see is the price you pay."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricing.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-6 sm:p-7',
                tier.featured
                  ? 'border-brand-600 shadow-card-hover ring-1 ring-brand-600 lg:-mt-3 lg:mb-3'
                  : 'border-line shadow-card',
              )}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-cta">
                  Most popular
                </span>
              )}

              <span className="pill w-fit bg-brand-50 text-brand-700">
                <Clock className="h-3.5 w-3.5" />
                {tier.badge}
              </span>

              <h3 className="mt-4 text-xl font-bold text-navy">{tier.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{tier.turnaround}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-navy">{formatUSD(tier.price)}</span>
                <span className="text-sm text-ink-muted">/ traveler</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">Government fee: $0 (the official card is free)</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/apply?plan=${tier.id}`}
                className={cn('btn-lg mt-7 w-full', tier.featured ? 'btn-primary' : 'btn btn-outline')}
              >
                Choose {tier.name}
              </Link>
              <p className="mt-3 text-center text-xs text-ink-muted">Money-back guarantee</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 flex max-w-3xl items-start gap-2 rounded-xl border border-line bg-white p-4 text-sm text-ink-soft">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          {disclaimer.pricing}
        </p>
      </div>
    </section>
  )
}
