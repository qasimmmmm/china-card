import type { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { officialChannels } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Official government links',
  description:
    'Links to the official China National Immigration Administration channels where you can complete the China Arrival Card for free.',
}

export default function OfficialLinksPage() {
  return (
    <LegalLayout
      title="Official government links"
      updated="June 29, 2026"
      activeHref="/official-links"
      intro="We believe in transparency. You can complete the China Arrival Card yourself, for free, on the official government channels below."
    >
      <h2>Apply directly with the government (free)</h2>
      <p>
        The China Arrival Card / China Digital Arrival Card is provided free of charge by China’s National
        Immigration Administration (NIA). If you prefer to file it yourself, use one of the official channels
        below. Our paid service is entirely optional.
      </p>

      <div className="not-prose mt-6 grid gap-3">
        {officialChannels.map((c) => (
          <a
            key={c.href}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center justify-between rounded-xl border border-line bg-white p-4 shadow-soft transition-colors hover:border-brand-300 hover:bg-surface-soft"
          >
            <span className="font-semibold text-navy">{c.label}</span>
            <ExternalLink  className="h-4 w-4 text-brand-600" aria-hidden="true" />
          </a>
        ))}
      </div>

      <h2 className="mt-10">What you give up by going direct</h2>
      <p>
        Nothing official — the card is identical. What our customers pay for is convenience: a simplified
        English questionnaire, a human review that catches errors before they reach the border, faster
        turnaround options, reminders, and round-the-clock support. If you’re comfortable navigating the
        official portal yourself, you should absolutely do so at no cost.
      </p>
    </LegalLayout>
  )
}
