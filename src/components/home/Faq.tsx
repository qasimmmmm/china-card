import Link from 'next/link'
import { faqs } from '@/content/marketing'
import { Accordion } from '@/components/ui/Accordion'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function Faq() {
  return (
    <section className="section" id="faq">
      <div className="container max-w-3xl">
        <SectionHeading
          eyebrow="Questions & answers"
          title="Frequently asked questions"
          description="Everything you need to know about the China Arrival Card and our service."
        />
        <div className="mt-10">
          <Accordion items={faqs.slice(0, 7)} />
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Still have questions?{' '}
          <Link href="/faq" className="link-underline">
            See all FAQs
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="link-underline">
            contact our team
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
