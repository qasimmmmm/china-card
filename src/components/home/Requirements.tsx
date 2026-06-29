import Link from 'next/link'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { requirements } from '@/content/marketing'
import { Reveal } from '@/components/ui/Reveal'

export function Requirements() {
  return (
    <section className="section bg-surface-soft" id="requirements">
      <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="eyebrow">Before you start</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">What you’ll need</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Have these handy and you’ll breeze through the application in a few minutes. Don’t have
            everything yet? You can save your details and finish later.
          </p>
          <div className="mt-7">
            <Link href="/apply" className="btn-primary btn-md">
              Begin application
              <ChevronRight  className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ul className="grid gap-3 sm:grid-cols-1">
            {requirements.map((r) => (
              <li key={r} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-soft">
                <CheckCircle2  className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <span className="text-[0.95rem] text-ink">{r}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
