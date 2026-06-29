import type { Metadata } from 'next'
import { Mail, Clock, MessageSquare, LifeBuoy } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { ContactForm } from '@/components/contact/ContactForm'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Get in touch with our 24/7 support team about your China Arrival Card application.',
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="We’re here to help"
        title="Contact our support team"
        description="Questions about your application or order? Our team is available around the clock and typically replies within 30 minutes."
      />
      <section className="section pt-12">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            <div className="card p-5">
              <Mail className="h-6 w-6 text-brand-600" />
              <p className="mt-3 font-semibold text-navy">Email us</p>
              <a href={`mailto:${site.supportEmail}`} className="link-underline text-sm">
                {site.supportEmail}
              </a>
            </div>
            <div className="card p-5">
              <Clock className="h-6 w-6 text-brand-600" />
              <p className="mt-3 font-semibold text-navy">Support hours</p>
              <p className="text-sm text-ink-soft">24 hours a day, 7 days a week — including weekends and holidays.</p>
            </div>
            <div className="card p-5">
              <MessageSquare className="h-6 w-6 text-brand-600" />
              <p className="mt-3 font-semibold text-navy">Average response</p>
              <p className="text-sm text-ink-soft">Around 30 minutes for most enquiries.</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-soft p-5">
              <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-sm text-ink-soft">
                Have an order? Include your reference (e.g. <span className="font-mono">CAC-••••-••••</span>) so we can
                help faster. You can also{' '}
                <a className="link-underline" href="/track">
                  track your order
                </a>{' '}
                anytime.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
