import { NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/store'
import { filing, callFilingService } from '@/lib/filing'
import { sendConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Relay the customer's CAPTCHA answer into their live session and submit.
 * Returns { status:'completed', confirmation } on success, or { status:'captcha' }
 * with a fresh image if the code was wrong.
 */
export async function POST(req: Request) {
  let body: { reference?: string; sessionId?: string; answer?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!filing.enabled) return NextResponse.json({ error: 'Live filing is not enabled.' }, { status: 400 })
  if (!body.sessionId || !body.answer) {
    return NextResponse.json({ error: 'sessionId and answer are required.' }, { status: 400 })
  }

  try {
    const { ok, json } = await callFilingService('/solve', { sessionId: body.sessionId, answer: body.answer })
    if (!ok) {
      return NextResponse.json({ error: (json.error as string) || 'Submission failed.' }, { status: 502 })
    }
    if (json.status === 'completed' && body.reference) {
      const updated = await updateOrderStatus(
        body.reference,
        'completed',
        `Filed on the ${(json.portal as string) || 'official'} portal — confirmation ${json.confirmation}.`,
        { reference: String(json.confirmation), portal: String(json.portal || 'official') },
      )
      if (updated?.contact?.email) {
        await sendConfirmationEmail({
          to: updated.contact.email,
          name: updated.contact.name,
          reference: updated.reference,
          confirmation: String(json.confirmation),
          plan: updated.plan,
        })
      }
    }
    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: 'Could not reach the filing service.' }, { status: 502 })
  }
}
