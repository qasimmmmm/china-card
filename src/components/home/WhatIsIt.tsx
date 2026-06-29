import { CheckCircle2 } from 'lucide-react'
import { whatIsIt } from '@/content/marketing'
import { Reveal } from '@/components/ui/Reveal'

export function WhatIsIt() {
  return (
    <section className="section bg-surface-soft" id="what-is-it">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow">The basics</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">{whatIsIt.title}</h2>
          <p className="mt-4 text-lg font-medium text-brand-700">{whatIsIt.lead}</p>
          <div className="prose-clean mt-4">
            {whatIsIt.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-navy">At a glance</h3>
            <dl className="mt-5 divide-y divide-line">
              {whatIsIt.facts.map((f) => (
                <div key={f.k} className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <dt className="font-semibold text-navy">{f.k}</dt>
                    <dd className="text-sm text-ink-soft">{f.v}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
