import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie policy',
  description: 'How china.ivisaportal.com uses cookies and how you can manage them.',
}

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie policy"
      updated="June 29, 2026"
      activeHref="/legal/cookies"
      intro="This policy explains the cookies we use and how you can control them."
    >
      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device that help websites function and remember
        preferences. We use a small number of cookies to run our service and, with your consent, to understand
        how it is used.
      </p>

      <h2>Cookies we use</h2>
      <h3>Strictly necessary</h3>
      <p>
        Required for the site to work — for example, keeping your application progress and securing form
        submissions. These cannot be switched off in our systems.
      </p>
      <h3>Analytics (consent-based)</h3>
      <p>
        Help us understand which pages are useful so we can improve the experience. These are only set if you
        consent, and the data is aggregated.
      </p>
      <h3>Functional</h3>
      <p>Remember preferences such as language so we can personalize your experience.</p>

      <h2>Managing cookies</h2>
      <p>
        You can accept or decline non-essential cookies via our cookie banner, and you can clear or block
        cookies at any time in your browser settings. Blocking essential cookies may affect how the site works.
      </p>

      <h2>More information</h2>
      <p>
        See our <Link href="/legal/privacy">Privacy Policy</Link> for how we handle personal data, or email{' '}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> with any questions.
      </p>
    </LegalLayout>
  )
}
