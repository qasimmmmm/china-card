'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from 'lucide-react'
import { steps, type PlanId } from '@/content/formSchema'
import { pricing } from '@/content/marketing'
import { applicationSchema, emptyApplication, isVisible } from '@/lib/applicationSchema'
import { disclaimer } from '@/lib/site'
import { formatUSD, cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { Field } from './Field'
import { LiveFiling } from './LiveFiling'

type Values = Record<string, unknown>
const REVIEW = steps.length

interface OrderResult {
  reference: string
  plan: PlanId
  amount: number
  status: string
  contactName: string
}

export function ApplicationForm({ initialPlan = 'standard' }: { initialPlan?: PlanId }) {
  const methods = useForm<Values>({
    resolver: zodResolver(applicationSchema),
    defaultValues: emptyApplication(initialPlan),
    mode: 'onTouched',
  })
  const { watch, trigger, handleSubmit, setValue, getValues } = methods

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [result, setResult] = useState<OrderResult | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const values = watch()
  const plan = (values.plan as PlanId) || 'standard'
  const tier = pricing.find((p) => p.id === plan) ?? pricing[0]

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const visibleStepFields = (i: number) =>
    steps[i].fields.filter((f) => isVisible(f, getValues()))

  async function next() {
    if (step < REVIEW) {
      const ids = visibleStepFields(step).map((f) => f.id)
      const ok = await trigger(ids as never)
      if (!ok) return
    }
    setStep((s) => Math.min(s + 1, REVIEW))
    scrollTop()
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
    scrollTop()
  }

  function goToStep(i: number) {
    setStep(i)
    scrollTop()
  }

  async function onValid(data: Values) {
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      setResult({
        reference: json.order.reference,
        plan: json.order.plan,
        amount: json.order.amount,
        status: json.order.status,
        contactName: json.order.contactName,
      })
      scrollTop()
    } catch {
      setServerError('We couldn’t reach our servers. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function onInvalid(errors: Record<string, unknown>) {
    const firstKey = Object.keys(errors)[0]
    if (!firstKey) return
    if (firstKey === 'agreeTruth' || firstKey === 'agreeTerms') {
      setStep(REVIEW)
      scrollTop()
      return
    }
    const idx = steps.findIndex((s) => s.fields.some((f) => f.id === firstKey))
    if (idx >= 0) {
      setStep(idx)
      scrollTop()
    }
  }

  const progressPct = useMemo(() => Math.round((step / REVIEW) * 100), [step])

  if (result) return <SuccessPanel result={result} email={String(values.email || '')} />

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="scroll-mt-24" />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Stepper */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line lg:hidden">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <ol className="hidden gap-1 lg:grid">
            {steps.map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => (i <= step ? goToStep(i) : undefined)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      active ? 'bg-brand-50' : 'hover:bg-surface-soft',
                      i <= step ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                        done && 'bg-success text-white',
                        active && 'bg-brand-600 text-white',
                        !done && !active && 'bg-line text-ink-muted',
                      )}
                    >
                      {done ? <Check  className="h-4 w-4" aria-hidden="true" /> : i + 1}
                    </span>
                    <span className={cn('text-sm font-semibold', active ? 'text-navy' : 'text-ink-soft')}>
                      {s.title}
                    </span>
                  </button>
                </li>
              )
            })}
            <li>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5',
                  step === REVIEW ? 'bg-brand-50' : '',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    step === REVIEW ? 'bg-brand-600 text-white' : 'bg-line text-ink-muted',
                  )}
                >
                  {steps.length + 1}
                </span>
                <span className={cn('text-sm font-semibold', step === REVIEW ? 'text-navy' : 'text-ink-soft')}>
                  Review &amp; confirm
                </span>
              </div>
            </li>
          </ol>

          <div className="mt-6 hidden rounded-xl border border-line bg-surface-soft p-4 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your plan</p>
            <p className="mt-1 text-lg font-bold text-navy">{tier.name}</p>
            <p className="text-sm text-ink-soft">{tier.turnaround}</p>
            <p className="mt-2 text-2xl font-extrabold text-brand-700">{formatUSD(tier.price)}</p>
          </div>
        </aside>

        {/* Form body */}
        <div>
          <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
            {step < REVIEW ? (
              <StepCard step={step} />
            ) : (
              <ReviewCard
                values={values}
                plan={plan}
                onEdit={goToStep}
                onChangePlan={(p) => setValue('plan', p, { shouldDirty: true })}
              />
            )}

            {serverError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm text-accent-dark">
                <AlertCircle  className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {serverError}
              </div>
            )}

            {/* Nav */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" onClick={back} className="btn btn-outline btn-md">
                  <ChevronLeft  className="h-4 w-4" aria-hidden="true" /> Back
                </button>
              ) : (
                <span />
              )}

              {step < REVIEW ? (
                <button type="button" onClick={next} className="btn-primary btn-md">
                  Continue <ChevronRight  className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="btn-primary btn-lg">
                  {submitting ? (
                    <>
                      <Loader2  className="h-5 w-5 animate-spin" aria-hidden="true" /> Submitting…
                    </>
                  ) : (
                    <>
                      Submit application <ChevronRight  className="h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
            <Lock  className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Your information is encrypted in transit. We never sell your data.
          </p>
        </div>
      </div>
    </FormProvider>
  )
}

function StepCard({ step }: { step: number }) {
  const { getValues } = useFormContextSafe()
  const s = steps[step]
  const visible = s.fields.filter((f) => isVisible(f, getValues()))
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name={s.icon} className="h-5.5 w-5.5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-navy">{s.title}</h2>
          {s.subtitle && <p className="text-sm text-ink-soft">{s.subtitle}</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {visible.map((f) => (
          <div key={f.id} className={cn(f.half ? 'sm:col-span-1' : 'sm:col-span-2')}>
            <Field field={f} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({
  values,
  plan,
  onEdit,
  onChangePlan,
}: {
  values: Values
  plan: PlanId
  onEdit: (i: number) => void
  onChangePlan: (p: PlanId) => void
}) {
  const { register } = useFormContextSafe()
  const tier = pricing.find((p) => p.id === plan) ?? pricing[0]

  const fmt = (f: { id: string; label: string; type: string }) => {
    const v = values[f.id]
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
    return v ? String(v) : '—'
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-navy">Review your details</h2>
        <p className="mt-1 text-sm text-ink-soft">Please check everything is correct before submitting.</p>

        <div className="mt-6 space-y-6">
          {steps.map((s, i) => {
            const visible = s.fields.filter((f) => isVisible(f, values))
            return (
              <div key={s.id} className="rounded-xl border border-line">
                <div className="flex items-center justify-between border-b border-line bg-surface-soft px-4 py-2.5">
                  <p className="text-sm font-semibold text-navy">{s.title}</p>
                  <button
                    type="button"
                    onClick={() => onEdit(i)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                  >
                    <Pencil  className="h-3 w-3" aria-hidden="true" /> Edit
                  </button>
                </div>
                <dl className="grid gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2">
                  {visible.map((f) => (
                    <div key={f.id}>
                      <dt className="text-xs uppercase tracking-wide text-ink-muted">{f.label}</dt>
                      <dd className="text-sm font-medium text-ink">{fmt(f)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plan + consents */}
      <div className="card p-6 sm:p-8">
        <h3 className="text-lg font-bold text-navy">Service & payment</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {pricing.map((p) => {
            const active = p.id === plan
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChangePlan(p.id)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  active ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-line hover:border-brand-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy">{p.name}</span>
                  {active && <CheckCircle2  className="h-5 w-5 text-brand-600" aria-hidden="true" />}
                </div>
                <p className="text-xs text-ink-muted">{p.turnaround}</p>
                <p className="mt-2 text-xl font-extrabold text-brand-700">{formatUSD(p.price)}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-soft px-4 py-3">
          <span className="text-sm font-semibold text-navy">Total service fee</span>
          <span className="text-xl font-extrabold text-navy">{formatUSD(tier.price)}</span>
        </div>

        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" className="mt-0.5 h-4.5 w-4.5 rounded border-line text-brand-600 focus:ring-brand-500" {...register('agreeTruth')} />
            <span>I confirm the information I have provided is true and accurate to the best of my knowledge.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" className="mt-0.5 h-4.5 w-4.5 rounded border-line text-brand-600 focus:ring-brand-500" {...register('agreeTerms')} />
            <span>
              I understand this is an independent assistance service (not a government website), that the China
              Arrival Card is available free directly from the NIA, and I accept the{' '}
              <Link href="/legal/terms" target="_blank" className="link-underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" target="_blank" className="link-underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <p className="mt-4 rounded-xl border border-line bg-white p-3 text-xs leading-relaxed text-ink-muted">
          {disclaimer.checkout}
        </p>
      </div>
    </div>
  )
}

function SuccessPanel({ result, email }: { result: OrderResult; email: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
        <CheckCircle2  className="h-9 w-9 text-success" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold text-navy sm:text-3xl">Application received</h2>
      <p className="mt-3 text-ink-soft">
        Thanks, {result.contactName.split(' ')[0] || 'traveler'} — your details are in. Our team will review your
        China Arrival Card application and send your confirmation{email ? ` to ${email}` : ''}.
      </p>

      <div className="mx-auto mt-7 max-w-md rounded-2xl border border-line bg-white p-6 text-left shadow-card">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-sm text-ink-muted">Order reference</span>
          <span className="font-mono text-lg font-bold text-navy">{result.reference}</span>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Service</dt>
            <dd className="font-semibold text-navy capitalize">{result.plan}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Service fee</dt>
            <dd className="font-semibold text-navy">{formatUSD(result.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Status</dt>
            <dd>
              <span className="pill bg-brand-50 text-brand-700">Submitted</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mx-auto max-w-lg">
        <LiveFiling reference={result.reference} />
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={`/track?ref=${result.reference}`} className="btn-primary btn-lg">
          Track my order
        </Link>
        <Link href="/" className="btn btn-outline btn-lg">
          Back to home
        </Link>
      </div>

      <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-xs text-ink-muted">
        <ShieldCheck  className="h-4 w-4 text-success" aria-hidden="true" />
        Save your reference <strong className="text-ink">{result.reference}</strong> to check status anytime.
      </p>
    </div>
  )
}

// Small helper so sub-components can read form context without prop drilling.
function useFormContextSafe() {
  return useFormContext<Values>()
}
