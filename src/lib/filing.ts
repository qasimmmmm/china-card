import 'server-only'

/**
 * Bridge to the live CAPTCHA-relay filing service (worker/filing-service.js).
 * The browser never talks to the service directly — these helpers run
 * server-side so the shared key stays secret. If FILING_SERVICE_URL is not set,
 * live filing is "disabled" and the UI falls back to assisted (staff) filing.
 */
export const filing = {
  url: process.env.FILING_SERVICE_URL || '',
  key: process.env.FILING_SERVICE_KEY || 'dev-filing-key',
  get enabled() {
    return !!this.url
  },
}

export async function callFilingService(
  path: '/start' | '/solve' | '/cancel',
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${filing.url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-filing-key': filing.key },
    body: JSON.stringify(body),
    // Filling the portal + screenshotting the CAPTCHA can take a few seconds.
    signal: AbortSignal.timeout(45000),
  })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { ok: res.ok, status: res.status, json }
}
