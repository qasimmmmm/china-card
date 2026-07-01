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
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { driveWizard, submitWizard, pageShot } from './official-driver.js'

let chromium
const sessions = new Map() // sessionId -> { browser, context, page, reference, createdAt, tempFiles }

/** Write a passport-image data-URL to a temp file so the portal's <input type=file> can take it. */
function writeDataUrlToTemp(dataUrl, ref) {
  const m = /^data:(image\/[\w.+-]+);base64,(.+)$/s.exec(String(dataUrl || ''))
  if (!m) return null
  const ext = m[1].split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg'
  const file = path.join(os.tmpdir(), `passport-${String(ref || 'x').replace(/[^\w-]/g, '')}-${Date.now()}.${ext}`)
  fs.writeFileSync(file, Buffer.from(m[2], 'base64'))
  return file
}

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

// ── Handlers ──────────────────────────────────────────────
// /start: open the portal and drive the whole 5-step Element-UI wizard from the
// customer's confirmed data (upload passport → basic → personal → travel →
// declaration + signature), STOPPING before the final Submit. Returns a
// screenshot of the completed form for a final review before submitting.
async function handleStart(body) {
  if (!body.reference || !body.application) throw new Error('reference and application are required')
  const app = body.application
  const tempFiles = []
  const passportImagePath = writeDataUrlToTemp(app.passportImage, body.reference)
  if (passportImagePath) tempFiles.push(passportImagePath)

  const browser = await launchBrowser()
  const context = await browser.newContext({ locale: 'en-US' })
  const page = await context.newPage()
  await page.goto(config.portalUrl, { waitUntil: 'networkidle', timeout: 60000 })

  // Fill everything and stop before Submit (the customer's final consent step).
  const res = await driveWizard(page, { application: app, reference: body.reference, passportImagePath }, { submit: false })

  const formPreview = await pageShot(page)
  const sessionId = randomUUID()
  sessions.set(sessionId, { browser, context, page, reference: body.reference, createdAt: Date.now(), tempFiles })

  return { ok: true, sessionId, filled: res.filled, total: res.total, missed: res.missed, formPreview }
}

async function endSession(sessionId) {
  const s = sessions.get(sessionId)
  if (!s) return
  sessions.delete(sessionId)
  for (const f of s.tempFiles || []) fs.rm(f, { force: true }, () => {})
  await s.browser.close().catch(() => {})
}

// /confirm: the customer has reviewed and given consent. Click the final Submit,
// then capture the official receipt (QR) to deliver back. This final step IS the
// customer's legal attestation — nothing is submitted without it.
async function handleConfirm(body) {
  const s = sessions.get(body.sessionId)
  if (!s) throw new Error('session not found or expired')
  const { page } = s

  const { confirmation, receiptImage } = await submitWizard(page, {
    confirmationSelector: config.confirmationSelector,
    receiptSelector: config.receiptSelector,
  })

  if (confirmation) {
    await endSession(body.sessionId)
    return { ok: true, status: 'completed', confirmation, receiptImage: receiptImage || (await pageShot(page)), portal: config.portalMode }
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
