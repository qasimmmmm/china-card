import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { QrMock } from '@/components/ui/QrMock'
import { Reveal } from '@/components/ui/Reveal'

const included = [
  'Your completed China Arrival Card confirmation',
  'A scannable QR code for immigration',
  'Your unique order reference for tracking',
  'A plain-English summary of what to show at the border',
]

export function SampleDocument() {
  return (
    <section className="section bg-navy text-white" id="what-you-receive">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow text-brand-200">What you’ll receive</p>
          <h2 className="mt-3 text-3xl text-white sm:text-4xl">
            A border-ready confirmation, delivered to your inbox
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Once our team has reviewed and submitted your details, you’ll get a single, clear
            confirmation with everything you need to clear immigration — no apps, no hunting through
            government portals.
          </p>
          <ul className="mt-6 space-y-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2  className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <span className="text-white/90">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto max-w-md">
            <div className="card overflow-hidden text-ink">
              <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">China Arrival Card</p>
                  <p className="text-lg font-bold">Entry Confirmation</p>
                </div>
                <span className="pill bg-white/15 text-white">
                  <CheckCircle2  className="h-3.5 w-3.5" aria-hidden="true" /> Confirmed
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-5 p-6">
                <dl className="space-y-3 text-sm">
                  {[
                    ['Surname / Given name', 'MORGAN / ALEX'],
                    ['Nationality', 'United Kingdom'],
                    ['Passport', 'E•••••78'],
                    ['Port of entry', 'Beijing Capital (PEK)'],
                    ['Arrival date', '12 July 2026'],
                    ['Reference', 'CAC-7F3K-9Q2D'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[0.66rem] uppercase tracking-wide text-ink-muted">{k}</dt>
                      <dd className="font-semibold text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-xl border border-line p-2">
                    <QrMock size={104} />
                  </div>
                  <span className="text-center text-[0.62rem] font-medium text-ink-muted">
                    Present with your passport
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-line bg-surface-soft px-6 py-3 text-sm text-ink-soft">
                <ShieldCheck  className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Checked for errors before submission
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-white/50">
              Sample confirmation shown for illustration only.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
