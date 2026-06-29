import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'The terms governing your use of the china.ivisaportal.com China Arrival Card assistance service.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of service"
      updated="June 29, 2026"
      activeHref="/legal/terms"
      intro="These terms govern your use of our website and services. By placing an order you agree to them."
    >
      <h2>1. Who we are</h2>
      <p>
        {site.domain} (the “Website”) is operated by {site.legalEntity} (“we”, “us”, “our”). We are a private,
        independent service that helps travelers prepare and submit the China Arrival Card. We are{' '}
        <strong>not a government agency</strong> and are not affiliated with the Chinese government or the
        National Immigration Administration. See our <Link href="/legal/disclaimer">Disclaimer</Link>.
      </p>

      <h2>2. Our service</h2>
      <p>
        Our service consists of: (a) a guided English-language questionnaire; (b) human review of your
        information for completeness and obvious errors; (c) completion and submission of your Arrival Card
        based on the details you provide; and (d) customer support. The official Arrival Card is available free
        directly from the authorities; our fee is for the assistance described above.
      </p>

      <h2>3. Eligibility & your responsibilities</h2>
      <ul>
        <li>You must be at least 18 years old, or have the consent of a parent or guardian, to place an order.</li>
        <li>
          You are responsible for providing accurate, complete, and truthful information. We rely entirely on
          the details you submit and cannot verify their truthfulness.
        </li>
        <li>
          You are responsible for ensuring you meet all entry requirements for China, including holding a valid
          visa or qualifying visa-free status where required.
        </li>
      </ul>

      <h2>4. Fees & payment</h2>
      <p>
        The price displayed at checkout is the total service fee for your selected tier, per traveler. There
        are no hidden charges. Any government fee (currently zero for the Arrival Card) is separate. Prices are
        in US dollars unless otherwise stated.
      </p>

      <h2>5. Refunds & cancellation</h2>
      <p>
        Our refund terms are set out in our <Link href="/legal/refund-policy">Refund &amp; Cancellation Policy</Link>,
        which forms part of these terms.
      </p>

      <h2>6. No guarantee</h2>
      <p>
        We do not guarantee approval, entry, or any specific processing time by the authorities. Stated
        turnaround times refer to <em>our</em> review and submission work, not to any government decision. All
        immigration decisions rest solely with the relevant authorities.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total liability arising out of or relating to the service
        is limited to the amount of the service fee you paid. We are not liable for indirect, incidental, or
        consequential losses, including missed travel, where these result from inaccurate information you
        provided or from decisions made by government authorities.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        All content on the Website (text, design, logos, and graphics) is owned by us or our licensors and may
        not be copied or reused without permission.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The “last updated” date above reflects the current
        version. Continued use of the Website after changes constitutes acceptance.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> or use
        our <Link href="/contact">contact page</Link>.
      </p>

      <p className="text-sm text-ink-muted">
        Business identity: [Your Registered Company Name] · [Business Registration No.] · [Registered Address].
        Replace these placeholders with your real registered details before going live.
      </p>
    </LegalLayout>
  )
}
