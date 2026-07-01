#!/usr/bin/env node
/**
 * Live CAPTCHA-relay filing service.
 *
 * Holds a real browser session per customer. When a customer finishes your form,
 * your app calls /start: this opens the (mock or official) portal, fills every
 * field, and screenshots the portal's CAPTCHA. Your site shows that image to the
 * customer, who types the code; your app calls /solve, which enters the code into
 * the SAME live session and submits. The customer solves their own CAPTCHA — no
 * bot ever defeats it.
 *
 * Run:  npm run serve        (in the worker/ folder)
 * The Next app talks to this over HTTP (FILING_SERVICE_URL); browsers never do.
 */
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { mapApplication } from './mapping.js'
import { fillAll, tickDeclaration } from './fill.js'

let chromium
const sessions = new Map() // sessionId -> { browser, context, page, reference, createdAt }

function json(res, status, body) {
  const data = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) })
  res.end(data)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => { raw += c; if (raw.length > 2_000_000) req.destroy() })
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}

async function launchBrowser() {
  const opts = { headless: config.headless }
  if (config.browserChannel) opts.channel = config.browserChannel
  return chromium.launch(opts)
}

async function elementShot(page, selector, timeout = 8000) {
  const loc = page.locator(selector).first()
  await loc.waitFor({ state: 'visible', timeout })
  const buf = await loc.screenshot()
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function pageShot(page) {
  const buf = await page.screenshot({ fullPage: true }).catch(() => page.screenshot())
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function hasElement(page, selector) {
  try { return (await page.locator(selector).count()) > 0 } catch { return false }
}

async function clickSubmit(page) {
  for (const hint of config.submitHints) {
    const byRole = page.getByRole('button', { name: new RegExp(hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first()
    if (await byRole.count().catch(() => 0)) { await byRole.click({ timeout: 4000 }).catch(() => {}); return true }
    const byText = page.locator(`button:has-text("${hint.replace(/"/g, '\\"')}")`).first()
    if (await byText.count().catch(() => 0)) { await byText.click({ timeout: 4000 }).catch(() => {}); return true }
  }
  return false
}

async function readConfirmation(page) {
  try {
    const t = (await page.locator(config.confirmationSelector).first().textContent({ timeout: 800 }))?.trim()
    return t && t !== '—' ? t : null
  } catch { return null }
}

async function captchaError(page) {
  try {
    const el = page.locator(config.captchaErrorSelector).first()
    if (!(await el.count())) return false
    return await el.isVisible()
  } catch { return false }
}

// ── Handlers ──────────────────────────────────────────────
// /start: open the portal, fill every field, and return a screenshot of the
// FILLED official form so the customer can review it. Includes a CAPTCHA image
// only if the portal actually shows one.
async function handleStart(body) {
  if (!body.reference || !body.application) throw new Error('reference and application are required')
  const browser = await launchBrowser()
  const context = await browser.newContext({ locale: 'en-US' })
  const page = await context.newPage()
  await page.goto(config.portalUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })

  const results = await fillAll(page, mapApplication({ application: body.application, reference: body.reference }))
  const filled = results.filter((r) => r.ok).length
  const missed = results.filter((r) => !r.ok).map((r) => r.key)

  const formPreview = await pageShot(page)
  const sessionId = randomUUID()
  sessions.set(sessionId, { browser, context, page, reference: body.reference, createdAt: Date.now() })

  const out = { ok: true, sessionId, filled, total: results.length, missed, formPreview }
  if (await hasElement(page, config.captchaImageSelector)) {
    out.captcha = { image: await elementShot(page, config.captchaImageSelector), prompt: 'Enter the verification code shown on the official form.' }
    if (config.testReveal) out.debugAnswer = await page.locator(config.captchaImageSelector).getAttribute('data-code').catch(() => null)
  }
  return out
}

async function endSession(sessionId) {
  const s = sessions.get(sessionId)
  if (!s) return
  sessions.delete(sessionId)
  await s.browser.close().catch(() => {})
}

// /confirm: the customer has reviewed and given consent. Enter any CAPTCHA
// answer, tick the declaration, submit to the authorities, then capture the
// official receipt (QR) to deliver back. This final step IS the customer's
// legal attestation — nothing is submitted without it.
async function handleConfirm(body) {
  const s = sessions.get(body.sessionId)
  if (!s) throw new Error('session not found or expired')
  const { page } = s
  const answer = String(body.answer || '').trim()

  if (answer && (await hasElement(page, config.captchaInputSelector))) {
    await page.locator(config.captchaInputSelector).first().fill(answer).catch(() => {})
  }
  await tickDeclaration(page)
  await clickSubmit(page)

  // Wait for a confirmation number or a CAPTCHA error.
  const deadline = Date.now() + 12000
  while (Date.now() < deadline) {
    const conf = await readConfirmation(page)
    if (conf) {
      // Capture the official receipt/QR to deliver to the customer.
      let receiptImage = null
      try { receiptImage = await elementShot(page, config.receiptSelector, 4000) } catch { receiptImage = await pageShot(page) }
      await endSession(body.sessionId)
      return { ok: true, status: 'completed', confirmation: conf, receiptImage, portal: config.portalMode }
    }
    if (await captchaError(page)) {
      const image = await elementShot(page, config.captchaImageSelector)
      const out = { ok: true, status: 'captcha', message: 'That verification code was incorrect — please try the new one.', captcha: { image } }
      if (config.testReveal) out.debugAnswer = await page.locator(config.captchaImageSelector).getAttribute('data-code').catch(() => null)
      return out
    }
    await page.waitForTimeout(300)
  }
  return { ok: false, status: 'pending', message: 'The portal did not confirm — a human may need to finish this submission.' }
}

// ── Server ────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`)
  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
    return json(res, 200, { ok: true, portalMode: config.portalMode, portalUrl: config.portalUrl, sessions: sessions.size })
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  if ((req.headers['x-filing-key'] || '') !== config.serviceKey) return json(res, 401, { error: 'unauthorized' })

  try {
    const body = await readBody(req)
    if (url.pathname === '/start') return json(res, 200, await handleStart(body))
    if (url.pathname === '/confirm' || url.pathname === '/solve') return json(res, 200, await handleConfirm(body))
    if (url.pathname === '/cancel') { await endSession(body.sessionId); return json(res, 200, { ok: true }) }
    return json(res, 404, { error: 'not found' })
  } catch (err) {
    return json(res, 400, { error: String(err.message || err) })
  }
})

// Sweep stale sessions.
setInterval(() => {
  const now = Date.now()
  for (const [id, s] of sessions) if (now - s.createdAt > config.sessionTtlMs) endSession(id)
}, 30000).unref()

async function main() {
  try { ({ chromium } = await import('playwright')) } catch {
    console.error('✖ Playwright not installed. Run: npm install && npm run install-browser'); process.exit(1)
  }
  const PORT = Number(process.env.PORT || config.filingPort)
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🔐 Filing service on http://0.0.0.0:${PORT}`)
    console.log(`   Portal: ${config.portalMode.toUpperCase()} → ${config.portalUrl}`)
    console.log(`   Browser: ${config.browserChannel || 'bundled chromium'} (${config.headless ? 'headless' : 'headed'})`)
    console.log(`   Fills the official form → customer reviews & consents → submits → returns the receipt. Ctrl+C to stop.\n`)
  })
}
main()
