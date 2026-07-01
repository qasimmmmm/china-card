import type { PricingTier } from '@/content/marketing'

export type PlanId = PricingTier['id']

export type OrderStatus =
  | 'submitted'
  | 'in_review'
  | 'action_required'
  | 'processing'
  | 'completed'
  | 'cancelled'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In expert review',
  action_required: 'Action required',
  processing: 'Submitting to authorities',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export interface OrderEvent {
  at: string
  status: OrderStatus
  note?: string
}

/** Confirmation captured from the official (or mock) portal by the worker. */
export interface OfficialConfirmation {
  reference: string
  portal: string
  submittedAt: string
  /** Data-URL screenshot of the official receipt/QR delivered to the customer. */
  receiptImage?: string
}

export interface Order {
  reference: string
  plan: PlanId
  amount: number
  currency: 'USD'
  status: OrderStatus
  /** Sanitized application field values (no raw passport file bytes). */
  application: Record<string, unknown>
  contact: { name: string; email: string; phone: string }
  createdAt: string
  updatedAt: string
  events: OrderEvent[]
  /** Set once the automation submits to the official portal. */
  official?: OfficialConfirmation
}
