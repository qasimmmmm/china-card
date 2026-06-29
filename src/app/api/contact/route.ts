import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(120),
  email: z.string().email('Enter a valid email.'),
  orderRef: z.string().max(40).optional().default(''),
  subject: z.string().min(1, 'Please add a subject.').max(160),
  message: z.string().min(5, 'Please add a few details.').max(4000),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const i of parsed.error.issues) fieldErrors[i.path.join('.')] = i.message
    return NextResponse.json({ error: 'Please check the form.', fieldErrors }, { status: 422 })
  }

  // In production, forward to your support inbox/CRM (e.g. Resend, SES, HubSpot).
  // Here we accept and acknowledge so the flow is fully testable.
  console.log('[contact] new message', { ...parsed.data, message: '[redacted]' })

  return NextResponse.json({ ok: true, message: 'Thanks — we’ve received your message and will reply shortly.' })
}
