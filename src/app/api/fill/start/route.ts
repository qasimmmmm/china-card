import { NextResponse } from 'next/server'
import { getOrder, updateOrderStatus } from '@/lib/store'
import { filing, callFilingService } from '@/lib/filing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Begin a live filing session for an order. Returns the portal's CAPTCHA image
 * for the customer to solve. If the filing service isn't configured/reachable,
 * responds { available:false } so the UI shows the assisted-filing fallback.
 */
export async function POST(req: Request) {
  let reference = ''
  try {
    reference = String((await req.json()).reference || '')
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const order = await getOrder(reference)
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  if (!filing.enabled) return NextResponse.json({ available: false })

  try {
    const { ok, json } = await callFilingService('/start', {
      reference: order.reference,
      application: order.application,
    })
    if (!ok) {
      return NextResponse.json({ available: true, error: (json.error as string) || 'Could not open the portal.' }, { status: 502 })
    }
    await updateOrderStatus(order.reference, 'processing', 'Customer is completing the official CAPTCHA verification.')
    return NextResponse.json({ available: true, ...json })
  } catch {
    // Service unreachable → graceful fallback to assisted filing.
    return NextResponse.json({ available: false })
  }
}
