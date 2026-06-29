import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Refund & cancellation policy',
  description: 'Clear, fair refund terms for our China Arrival Card assistance service.',
}

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund & cancellation policy"
      updated="June 29, 2026"
      activeHref="/legal/refund-policy"
      intro="We aim to be fair and transparent. Here is exactly when you are eligible for a refund."
    >
      <h2>Full refund — before review begins</h2>
      <p>
        If you cancel your order <strong>before our team has begun reviewing or processing</strong> your
        application, you are entitled to a <strong>full refund</strong> of the service fee. Just contact us with
        your order reference as soon as possible.
      </p>

      <h2>If we cannot assist you</h2>
      <p>
        If, for any reason, we are unable to provide our assistance for your specific case, we will refund your
        service fee in <strong>full</strong>.
      </p>

      <h2>After review/processing has started</h2>
      <p>
        Because our fee covers the work our team performs, refunds are limited once review or submission is
        underway. If an error on our part prevents completion, we will correct it at no charge or refund you.
        Our faster tiers include free corrections if your travel details change before submission.
      </p>

      <h2>On-time guarantee</h2>
      <p>
        We process within the turnaround time of your chosen tier. If we miss that window due to a fault on our
        side, we will refund your service fee.
      </p>

      <h2>What is not refundable</h2>
      <ul>
        <li>Government fees, where any apply (the Arrival Card itself is currently free).</li>
        <li>Outcomes decided by the authorities — we cannot guarantee approval or entry, and a denial by the authorities is not a fault of our service.</li>
        <li>Errors caused by inaccurate or incomplete information you provided, once submitted at your confirmation.</li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> with your order reference and the
        reason for your request, or use our <Link href="/contact">contact page</Link>. We respond to refund
        requests promptly and aim to process approved refunds to your original payment method within a few
        business days.
      </p>
    </LegalLayout>
  )
}
