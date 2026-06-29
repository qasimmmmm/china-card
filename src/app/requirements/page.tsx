import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, CalendarClock, FileText, Plane, ChevronRight } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { requirements } from '@/content/marketing'

export const metadata: Metadata = {
  title: 'China entry requirements & who needs an Arrival Card',
  description:
    'Who needs the China Digital Arrival Card, who is exempt, what documents you need, when to file, and how the 240-hour visa-free transit works.',
}

const need = [
  'Foreign nationals entering mainland China by air, land, or sea',
  'Travelers using the 30-day unilateral visa-free entry',
  'Travelers using the 240-hour (10-day) visa-free transit',
  'Tourists, business visitors, students, and workers',
]
const exempt = [
  'Holders of the PRC Foreign Permanent Resident ID Card',
  'Non-Chinese holders of the Mainland Travel Permit for HK/Macao residents',
  'Group-visa holders / group visa-free entrants',
  'Direct-transit passengers staying under 24 hours airside',
  'Passengers entering and leaving on the same cruise ship',
  'E-channel / fast-lane users and cross-border transport crew',
]

export default function RequirementsPage() {
  return (
    <>
      <PageHero
        eyebrow="China entry requirements"
        title="Everything you need to enter China smoothly"
        description="Since 20 November 2025, the China Digital Arrival Card is a mandatory immigration declaration for most foreign travelers. Here’s exactly what applies to you."
      />

      <section className="section pt-12">
        <div className="container space-y-10">
          {/* Who needs / exempt */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-light text-success-dark">
                  <Check className="h-5 w-5" />
                </span>
                You need an Arrival Card if…
              </h2>
              <ul className="mt-5 space-y-3">
                {need.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-[0.95rem] text-ink">
                    <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint text-brand-700">
                  <X className="h-5 w-5" />
                </span>
                You may be exempt if…
              </h2>
              <ul className="mt-5 space-y-3">
                {exempt.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-[0.95rem] text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Documents */}
          <div className="card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
              <FileText className="h-5 w-5 text-brand-600" /> Documents & information you’ll need
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3 rounded-xl border border-line bg-surface-soft p-4">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
                  <span className="text-sm text-ink">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to file + transit */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <CalendarClock className="h-5 w-5 text-brand-600" /> When to file
              </h2>
              <p className="prose-clean mt-4">
                The Arrival Card must be completed <strong>within 72 hours (3 days) before arrival</strong> — it
                can’t be filed earlier. It’s a per-trip declaration tied to your specific arrival, and it
                produces a QR code immigration scans at the border. We recommend ordering ahead so we can review
                your details and submit the moment your window opens.
              </p>
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <Plane className="h-5 w-5 text-brand-600" /> 240-hour visa-free transit
              </h2>
              <p className="prose-clean mt-4">
                Eligible travelers from 55+ countries can transit visa-free for up to 240 hours (10 days) through
                designated ports while traveling onward to a third country, with a confirmed onward ticket. Even
                with visa-free transit, you still need an Arrival Card. We’ll help confirm whether your itinerary
                qualifies.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-hero px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-bold text-white">Ready when you are</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/85">
              Start your guided application and we’ll handle the rest — reviewed, checked, and submitted.
            </p>
            <Link href="/apply" className="btn-lg mt-6 inline-flex bg-white !text-brand-700 hover:bg-white/90">
              Start my application <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
