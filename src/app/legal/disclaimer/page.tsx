import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { officialChannels, site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Disclaimer & non-affiliation notice',
  description:
    'china.ivisaportal.com is a private, independent service and is not affiliated with the Chinese government or the National Immigration Administration. The China Arrival Card is free from the NIA.',
}

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer & non-affiliation notice"
      updated="June 29, 2026"
      activeHref="/legal/disclaimer"
      intro="Please read this notice carefully. It explains who we are, who we are not, and exactly what you are paying for."
    >
      <h2>We are not a government website</h2>
      <p>
        {site.domain} is operated by {site.legalEntity}, a private and independent company. We are{' '}
        <strong>not</strong> affiliated with, associated with, authorized by, endorsed by, or in any way
        officially connected with the government of the People’s Republic of China, the National Immigration
        Administration (NIA), the General Administration of Customs, or any of their agencies or officials.
      </p>

      <h2>The official China Arrival Card is free</h2>
      <p>
        The China Arrival Card / China Digital Arrival Card can be obtained <strong>free of charge</strong>{' '}
        directly from the official NIA channels, including the official NIA website, the “NIA 12367” app, and
        the WeChat/Alipay mini-programs. You are never required to use a paid service to complete it.
      </p>
      <ul>
        {officialChannels.map((c) => (
          <li key={c.href}>
            <a href={c.href} target="_blank" rel="noopener noreferrer nofollow">
              {c.label}
            </a>
          </li>
        ))}
      </ul>

      <h2>What our fee covers</h2>
      <p>
        The fee charged on this website is an <strong>optional service fee for application assistance</strong>.
        It covers the convenience of our simplified English questionnaire, professional review of your
        information for errors and completeness, completing and submitting the form on your behalf, and
        ongoing customer support. It is separate from, and in addition to, any government fee (which for the
        Arrival Card is currently zero). You are paying for our service and your time savings — not for the
        document itself.
      </p>

      <h2>No guarantee of approval or entry</h2>
      <p>
        We do not, and cannot, guarantee approval, entry, or any particular outcome. All immigration and
        customs decisions are made solely by the relevant government authorities. We have no ability to
        influence, expedite, or override any official decision.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We work to keep the information on this site accurate and current, but entry rules, eligibility, and
        official procedures are set by the Chinese authorities and may change without notice. Nothing on this
        site constitutes legal or immigration advice. Always verify requirements for your specific situation
        with the official sources above.
      </p>

      <p>
        By using this website you confirm that you understand you may apply yourself, for free, directly with
        the NIA, and that you are choosing our assistance voluntarily. Questions? See our{' '}
        <Link href="/legal/terms">Terms of Service</Link> or{' '}
        <Link href="/contact">contact us</Link>.
      </p>
    </LegalLayout>
  )
}
