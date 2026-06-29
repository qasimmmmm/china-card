import type { Metadata } from 'next'
import { Lock, BadgeCheck, Clock } from 'lucide-react'
import { ApplicationForm } from '@/components/apply/ApplicationForm'
import type { PlanId } from '@/content/formSchema'

export const metadata: Metadata = {
  title: 'Apply for your China Arrival Card',
  description:
    'Complete your China Digital Arrival Card application online in minutes. Guided English form, expert review, and a scannable QR code. Independent service — not a government website.',
  robots: { index: true, follow: true },
}

const PLANS: PlanId[] = ['standard', 'priority', 'express']

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const initialPlan: PlanId = PLANS.includes(plan as PlanId) ? (plan as PlanId) : 'standard'

  return (
    <>
      <section className="bg-hero-soft">
        <div className="container py-10 sm:py-12">
          <p className="eyebrow">China Digital Arrival Card</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
            Apply for your Arrival Card
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Answer a few simple questions and our team will prepare, review, and submit your mandatory
            China Arrival Card. Most travelers finish in under five minutes.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-success" /> 256-bit SSL encrypted
            </span>
            <span className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-success" /> Expert human review
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-success" /> Save & finish later
            </span>
          </div>
        </div>
      </section>

      <section className="section pt-10">
        <div className="container">
          <ApplicationForm initialPlan={initialPlan} />
        </div>
      </section>
    </>
  )
}
