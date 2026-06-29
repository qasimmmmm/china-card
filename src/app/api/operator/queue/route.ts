import { NextResponse } from 'next/server'
import { isOperator } from '@/lib/operator'
import { listOrders } from '@/lib/store'
import type { OrderStatus } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Operator/worker queue. Returns full order records (including the application
 * payload) so the automation worker can map fields into the official NIA form.
 * Protected by the operator key.
 */
export async function GET(req: Request) {
  if (!isOperator(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const status = (searchParams.get('status') as OrderStatus | null) ?? undefined
  const orders = await listOrders(status ? { status } : undefined)
  return NextResponse.json({ ok: true, count: orders.length, orders })
}
