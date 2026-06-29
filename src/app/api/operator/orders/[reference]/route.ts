import { NextResponse } from 'next/server'
import { isOperator } from '@/lib/operator'
import { getOrder, updateOrderStatus } from '@/lib/store'
import type { OrderStatus } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID: OrderStatus[] = [
  'submitted',
  'in_review',
  'action_required',
  'processing',
  'completed',
  'cancelled',
]

export async function GET(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  if (!isOperator(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { reference } = await params
  const order = await getOrder(reference)
  if (!order) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, order })
}

/** Update an order's status (operator/worker only). */
export async function PATCH(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  if (!isOperator(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { reference } = await params

  let body: { status?: string; note?: string; confirmation?: { reference?: string; portal?: string } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  if (!body.status || !VALID.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: `status must be one of: ${VALID.join(', ')}` }, { status: 400 })
  }

  const official =
    body.confirmation?.reference
      ? { reference: String(body.confirmation.reference), portal: String(body.confirmation.portal || 'official') }
      : undefined

  const updated = await updateOrderStatus(reference, body.status as OrderStatus, body.note, official)
  if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, order: updated })
}
