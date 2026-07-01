import { NextResponse } from 'next/server'
import { applicationSchema } from '@/lib/applicationSchema'
import { buildOrder, publicOrderView } from '@/lib/orders'
import { saveOrder } from '@/lib/store'
import { sendSubmittedEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_'
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fieldErrors },
      { status: 422 },
    )
  }

  const order = buildOrder(parsed.data as Record<string, unknown>)
  await saveOrder(order)
  await sendSubmittedEmail({ to: order.contact.email, name: order.contact.name, reference: order.reference })

  return NextResponse.json(
    { ok: true, order: publicOrderView(order) },
    { status: 201 },
  )
}
