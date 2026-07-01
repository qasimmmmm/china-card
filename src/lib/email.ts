import 'server-only'
import { site } from './site'
import type { PlanId } from './types'

/**
 * Transactional email delivery via Resend (https://resend.com).
 *
 * We call the REST API directly with `fetch` so there is NO dependency on the
 * `resend` npm package — nothing to install, works on the Node runtime and on
 * serverless/edge-node alike.
 *
 * Design rules (do not break these):
 *   - When RESEND_API_KEY is unset we NO-OP gracefully (log + return). This lets
 *     the app run in dev/preview without email configured.
 *   - Nothing here ever throws. Every send is wrapped in try/catch so a mail
 *     failure can never break the customer's request. Email is best-effort.
 *
 * Env vars:
 *   RESEND_API_KEY   (required to actually send; unset = no-op)
 *   EMAIL_FROM       (optional; defaults to "China Arrival Card <no-reply@domain>")
 *   EMAIL_REPLY_TO   (optional; defaults to the public support address)
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/** Human-readable plan label for the email body. */
const PLAN_LABELS: Record<PlanId, string> = {
  standard: 'Standard',
  priority: 'Priority',
  express: 'Express',
}

function planLabel(plan?: PlanId | string): string {
  if (!plan) return 'Standard'
  return PLAN_LABELS[plan as PlanId] ?? String(plan)
}

/** Sender address. Must be a verified domain/sender in your Resend account. */
function fromAddress(): string {
  return process.env.EMAIL_FROM || `${site.name} <no-reply@${site.domain}>`
}

function replyTo(): string {
  return process.env.EMAIL_REPLY_TO || site.supportEmail
}

/** Escape untrusted values before interpolating into the HTML body. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface ResendPayload {
  from: string
  to: string[]
  subject: string
  html: string
  text: string
  reply_to?: string
}

/**
 * Low-level send. Returns `true` on success, `false` on any failure or when
 * email is not configured. NEVER throws.
 */
async function send(payload: Omit<ResendPayload, 'from' | 'reply_to'>): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Graceful no-op: email isn't configured (dev/preview). Log and move on.
    console.log('[email] RESEND_API_KEY unset — skipping send', {
      to: payload.to,
      subject: payload.subject,
    })
    return false
  }

  const body: ResendPayload = {
    from: fromAddress(),
    reply_to: replyTo(),
    ...payload,
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Don't let a slow mail API hang the request.
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[email] Resend responded with an error', {
        status: res.status,
        subject: payload.subject,
        detail: detail.slice(0, 500),
      })
      return false
    }

    return true
  } catch (err) {
    // Timeouts, DNS, network — swallow so the caller's request still succeeds.
    console.error('[email] send failed', {
      subject: payload.subject,
      error: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}

// ── Shared HTML shell ────────────────────────────────────────────────────────

const BRAND = '#2563eb'
const INK = '#0f172a'
const MUTED = '#64748b'
const BORDER = '#e2e8f0'
const BG = '#f8fafc'

/** Wrap body content in an on-brand, email-client-safe layout (inline styles). */
function shell(opts: { heading: string; preheader: string; inner: string }): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${esc(
      opts.preheader,
    )}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND};padding:20px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.01em;">${esc(
                  site.name,
                )}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px 28px;">
                <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:700;color:${INK};">${esc(
                  opts.heading,
                )}</h1>
                ${opts.inner}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 28px 28px;">
                <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 16px 0;" />
                <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${MUTED};">
                  <strong style="color:${INK};">Independent service — not a government website.</strong>
                  ${esc(site.name)} is a private, independent application-assistance service and is
                  <strong>not affiliated with, endorsed by, or operated by</strong> the Chinese
                  government or the National Immigration Administration (NIA). The China Arrival Card is
                  available free of charge directly from the NIA; our fee covers optional assistance and review.
                </p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
                  Questions? Reply to this email or contact
                  <a href="mailto:${esc(site.supportEmail)}" style="color:${BRAND};text-decoration:none;">${esc(
                    site.supportEmail,
                  )}</a>.
                </p>
              </td>
            </tr>
          </table>
          <p style="max-width:560px;margin:16px auto 0 auto;font-size:11px;line-height:1.5;color:${MUTED};text-align:center;">
            &copy; ${new Date().getFullYear()} ${esc(site.legalEntity)} &middot; ${esc(site.domain)}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/** A labeled reference/detail row. */
function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};width:42%;">${esc(
      label,
    )}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;font-weight:600;color:${INK};font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${esc(
      value,
    )}</td>
  </tr>`
}

function detailsTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0;background:${BG};border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;">
    ${rows}
  </table>`
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface SubmittedEmailArgs {
  to: string
  name: string
  reference: string
}

export interface ConfirmationEmailArgs {
  to: string
  name: string
  reference: string
  /** The official portal / arrival-card confirmation code. */
  confirmation: string
  plan?: PlanId | string
}

/**
 * Sent when an order is first received (status: submitted). Reassures the
 * customer we have their application and are reviewing it.
 */
export async function sendSubmittedEmail({ to, name, reference }: SubmittedEmailArgs): Promise<boolean> {
  try {
    if (!to) {
      console.log('[email] sendSubmittedEmail — no recipient, skipping', { reference })
      return false
    }

    const firstName = String(name || 'there').split(' ')[0] || 'there'
    const trackUrl = `${site.url}/track?ref=${encodeURIComponent(reference)}`

    const inner = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${INK};">
        Hi ${esc(firstName)}, thanks — we've received your China Arrival Card application and it's now
        queued for expert human review. You don't need to do anything right now.
      </p>
      ${detailsTable(detailRow('Order reference', reference))}
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:${INK};">
        We'll email you again the moment your confirmation is ready. You can check your status any time:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px 0;">
        <tr><td style="border-radius:8px;background:${BRAND};">
          <a href="${esc(trackUrl)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Track your order</a>
        </td></tr>
      </table>`

    return await send({
      to: [to],
      subject: `We've received your China Arrival Card application (${reference})`,
      html: shell({
        heading: 'Your application has been received',
        preheader: `Reference ${reference} — queued for expert review.`,
        inner,
      }),
      text:
        `Hi ${firstName},\n\n` +
        `Thanks — we've received your China Arrival Card application and it's now queued for expert human review.\n\n` +
        `Order reference: ${reference}\n\n` +
        `We'll email you again the moment your confirmation is ready.\n` +
        `Track your order: ${trackUrl}\n\n` +
        `— ${site.name}\n\n` +
        `Independent service — not a government website. ${site.name} is not affiliated with the Chinese government or the NIA. The China Arrival Card is free directly from the NIA.\n` +
        `Support: ${site.supportEmail}`,
    })
  } catch (err) {
    console.error('[email] sendSubmittedEmail failed', {
      reference,
      error: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}

/**
 * Sent when an order is completed. Delivers the arrival-card confirmation and
 * the customer's order reference. Best-effort — never throws.
 */
export async function sendConfirmationEmail({
  to,
  name,
  reference,
  confirmation,
  plan,
}: ConfirmationEmailArgs): Promise<boolean> {
  try {
    if (!to) {
      console.log('[email] sendConfirmationEmail — no recipient, skipping', { reference })
      return false
    }

    const firstName = String(name || 'there').split(' ')[0] || 'there'
    const trackUrl = `${site.url}/track?ref=${encodeURIComponent(reference)}`

    const rows =
      detailRow('Order reference', reference) +
      detailRow('Confirmation code', confirmation) +
      detailRow('Service plan', planLabel(plan))

    const inner = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${INK};">
        Great news, ${esc(firstName)} — your China Arrival Card is complete. Please keep this
        confirmation with your travel documents; you may be asked for it on arrival.
      </p>
      ${detailsTable(rows)}
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:${INK};">
        You can view and re-download your confirmation any time from your order page:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px 0;">
        <tr><td style="border-radius:8px;background:${BRAND};">
          <a href="${esc(trackUrl)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">View your confirmation</a>
        </td></tr>
      </table>
      <p style="margin:20px 0 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
        Safe travels — and thank you for choosing ${esc(site.name)}.
      </p>`

    return await send({
      to: [to],
      subject: `Your China Arrival Card is ready (${reference})`,
      html: shell({
        heading: 'Your China Arrival Card is confirmed',
        preheader: `Confirmation ${confirmation} — reference ${reference}.`,
        inner,
      }),
      text:
        `Hi ${firstName},\n\n` +
        `Great news — your China Arrival Card is complete. Please keep this confirmation with your travel documents; you may be asked for it on arrival.\n\n` +
        `Order reference:   ${reference}\n` +
        `Confirmation code: ${confirmation}\n` +
        `Service plan:      ${planLabel(plan)}\n\n` +
        `View your confirmation: ${trackUrl}\n\n` +
        `Safe travels, and thank you for choosing ${site.name}.\n\n` +
        `— ${site.name}\n\n` +
        `Independent service — not a government website. ${site.name} is not affiliated with the Chinese government or the NIA. The China Arrival Card is free directly from the NIA.\n` +
        `Support: ${site.supportEmail}`,
    })
  } catch (err) {
    console.error('[email] sendConfirmationEmail failed', {
      reference,
      error: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}
