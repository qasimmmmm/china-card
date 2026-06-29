import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How we collect, use, protect, and share your personal data when you use our China Arrival Card service.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy policy"
      updated="June 29, 2026"
      activeHref="/legal/privacy"
      intro="Your privacy matters. This policy explains what we collect, why, how we protect it, and your rights."
    >
      <h2>1. Information we collect</h2>
      <p>To prepare your China Arrival Card, we collect the information you enter into our application form, which may include:</p>
      <ul>
        <li>Identity details: name, sex, date of birth, nationality, and country of birth.</li>
        <li>Travel-document details: passport type, number, expiry, and (optionally) an uploaded passport image.</li>
        <li>Trip details: flight/transport information, arrival date, ports, purpose, and accommodation in China.</li>
        <li>Contact details: email address and phone number.</li>
        <li>Declaration responses (health and customs questions).</li>
        <li>Technical data: IP address, device/browser information, and basic analytics.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To review, complete, and submit your Arrival Card application.</li>
        <li>To contact you about your order and deliver your confirmation.</li>
        <li>To provide customer support and process refunds where applicable.</li>
        <li>To detect and prevent fraud, and to comply with legal obligations.</li>
      </ul>

      <h2>3. Legal basis</h2>
      <p>
        Where the GDPR or similar laws apply, we process your data to perform our contract with you (providing
        the service you requested), to meet legal obligations, and on the basis of our legitimate interests in
        operating and securing our service. Analytics cookies are used only with your consent.
      </p>

      <h2>4. Sharing</h2>
      <p>
        We do <strong>not</strong> sell your personal data. We share it only with: (a) trusted service
        providers who help us operate (e.g. hosting, payment processing, email/SMS delivery), under
        confidentiality obligations; and (b) authorities, where required to submit your application or as
        required by law. We submit the details you provide to the official Arrival Card channel on your behalf.
      </p>

      <h2>5. Security</h2>
      <p>
        We protect your information with encryption in transit (TLS/SSL) and at rest, restrict access to staff
        who need it to process your order, and apply organizational safeguards. No method of transmission is
        100% secure, but we work hard to protect your data.
      </p>

      <h2>6. Retention</h2>
      <p>
        We keep your application data only as long as necessary to provide the service, handle support and
        refunds, and meet legal/accounting obligations — after which it is securely deleted or anonymized. You
        can request earlier deletion (see below).
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, delete, or port your data, to
        object to or restrict processing, and to withdraw consent. To exercise any right, email{' '}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. You may also lodge a complaint with
        your local data-protection authority.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use essential and (with consent) analytics cookies. See our{' '}
        <Link href="/legal/cookies">Cookie Policy</Link> for details and how to manage them.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions or requests: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalLayout>
  )
}
