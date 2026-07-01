import 'server-only'
import { pricing } from '@/content/marketing'
import { makeOrderReference } from './utils'
import type { Order, PlanId } from './types'

export function amountForPlan(plan: PlanId): number {
  return pricing.find((p) => p.id === plan)?.price ?? pricing[0].price
}

/** Build a new Order from validated application values. */
export function buildOrder(values: Record<string, unknown>): Order {
  const plan = (values.plan as PlanId) || 'standard'
  const now = new Date().toISOString()

  const surname = String(values.surname || '').trim()
  const given = String(values.givenNames || '').trim()
  const name = [given, surname].filter(Boolean).join(' ') || 'Traveler'

  // Strip consent booleans from the stored application payload (keep record flags).
  // `signature` (PNG data-URL) stays in `application` — the worker reproduces it.
  const { agreeTruth, agreeTerms, agreeAuthorize, ...application } = values as Record<string, unknown>

  return {
    reference: makeOrderReference(),
    plan,
    amount: amountForPlan(plan),
    currency: 'USD',
    status: 'submitted',
    application: {
      ...application,
      consentGiven: agreeTruth === true && agreeTerms === true,
      authorizationGiven: agreeAuthorize === true,
      authorizedAt: agreeAuthorize === true ? now : null,
    },
    contact: {
      name,
      email: String(values.email || ''),
      phone: String(values.phone || ''),
    },
    createdAt: now,
    updatedAt: now,
    events: [{ at: now, status: 'submitted', note: 'Application received and queued for expert review.' }],
  }
}

/** Public-safe view of an order (no internal notes beyond status timeline). */
export function publicOrderView(order: Order) {
  return {
    reference: order.reference,
    plan: order.plan,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    contactName: order.contact.name,
    arrivalDate: order.application.arrivalDate ?? null,
    entryPort: order.application.entryPort ?? null,
    official: order.official ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    events: order.events,
  }
}
