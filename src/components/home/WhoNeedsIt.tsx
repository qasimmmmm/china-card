import Link from 'next/link'
import { Check, X, Plane, Info } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

const need = [
  'Foreign nationals entering mainland China by air, land, or sea',
  'Travelers using the 30-day unilateral visa-free entry',
  'Travelers using the 240-hour (10-day) visa-free transit',
  'Tourists, business visitors, students, and workers alike',
]

const exempt = [
  'Holders of the PRC Foreign Permanent Resident ID Card',
  'Non-Chinese holders of the Mainland Travel Permit for HK/Macao residents',
  'Group-visa holders / group visa-free entrants',
  'Direct-transit passengers staying under 24 hours airside',
  'Passengers entering and leaving on the same cruise ship',
  'E-channel / fast-lane users and cross-border transport crew',
]

export function WhoNeedsIt() {
  return (
    <section className="section bg-surface-soft" id="who-needs-it">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card h-full p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-light text-success-dark">
                  <Check  className="h-5 w-5" aria-hidden="true" />
                </span>
                You need an Arrival Card if…
              </h3>
              <ul className="mt-5 space-y-3">
                {need.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-[0.95rem] text-ink">
                    <Check  className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" aria-hidden="true" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card h-full p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint text-brand-700">
                  <X  className="h-5 w-5" aria-hidden="true" />
                </span>
                You may be exempt if…
              </h3>
              <ul className="mt-5 space-y-3">
                {exempt.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-[0.95rem] text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-brand-600 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="flex items-start gap-3 text-sm sm:text-[0.95rem]">
            <Plane  className="mt-0.5 h-5 w-5 shrink-0 text-white/80" aria-hidden="true" />
            <span>
              <span className="font-semibold">Transiting through China?</span> The 240-hour visa-free
              transit still requires an Arrival Card. We’ll help confirm your itinerary qualifies.
            </span>
          </p>
          <Link href="/requirements" className="btn btn-md shrink-0 bg-white !text-brand-700 hover:bg-white/90">
            Check requirements
          </Link>
        </div>

        <p className="mx-auto mt-6 flex max-w-3xl items-start justify-center gap-2 text-center text-xs text-ink-muted">
          <Info  className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Eligibility rules are set by China’s authorities and can change. Always verify your specific
          situation; we’ll flag anything that looks off during review.
        </p>
      </div>
    </section>
  )
}
