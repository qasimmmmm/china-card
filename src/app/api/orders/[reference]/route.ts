import { NextResponse } from 'next/server'
import { getOrder } from '@/lib/store'
import { publicOrderView } from '@/lib/orders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Public order lookup — the order reference itself acts as the access token. */
export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params
  const order = await getOrder(reference)
  if (!order) {
    return NextResponse.json({ error: 'No order found with that reference.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, order: publicOrderView(order) })
}
