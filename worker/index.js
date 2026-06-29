#!/usr/bin/env node
/**
 * China Arrival Card — automation worker.
 *
 * Pulls submitted orders from your app and fills the official Arrival Card form.
 * By default it runs FULLY AUTOMATICALLY against the bundled mock portal:
 * fill → submit → capture the confirmation number → mark the order completed and
 * push the confirmation back to your app (which surfaces it on the tracking page).
 *
 * Modes:
 *   node index.js --watch     # default (npm start): loop forever, auto-process new orders
 *   node index.js --auto      # process the current queue once, fully automatically
 *   node index.js --review    # headed, human verifies & submits each order
 *   node index.js --list      # show the queue and exit
 *   node index.js --dry-run   # show the field mapping per order (no browser)
 *   node index.js --once CAC-XXXX   # process a single order
 *
 * Portal: WORKER_PORTAL_MODE=mock (default, runnable demo) | official (real NIA).
 * Compliance: this re-keys data the traveler already provided. It never bypasses
 * CAPTCHAs. For the real government site, keep a human in the loop (--review).
 */
import readline from 'node:readline'
import { config } from './config.js'
import { pullQueue, getOrder, setStatus } from './api.js'
import { mapApplication, summarize } from './mapping.js'

const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const valueOf = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((res) => rl.question(q, (a) => { rl.close(); res(a.trim()) }))
}

async function getOrders() {
  const once = valueOf('--once')
  if (once) { const o = await getOrder(once); return o ? [o] : [] }
  return pullQueue()
}

function banner() {
  console.log(`\n🛂  China Arrival Card automation worker`)
  console.log(`   API:    ${config.apiBase}`)
  console.log(`   Portal: ${config.portalMode.toUpperCase()} → ${config.portalUrl}`)
  console.log(`   Mode:   ${has('--review') ? 'review (human-in-the-loop)' : 'AUTOMATIC' + (config.autoSubmit ? ' (auto-submit)' : ' (fill only)')}\n`)
}

/** Fully automatic processing of one order against the portal. */
async function autoProcess(context, order) {
  console.log(`\n▶ ${order.reference}  (${order.contact?.name || ''})`)
  await setStatus(order.reference, 'processing', `Bot opened the ${config.portalMode} portal and is filling the Arrival Card.`).catch(() => {})

  const page = await context.newPage()
  const { fillAll, tickDeclaration, submitAndConfirm } = await import('./fill.js')
  try {
    await page.goto(config.portalUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    const results = await fillAll(page, mapApplication(order))
    const filled = results.filter((r) => r.ok).length
    const missed = results.filter((r) => !r.ok)
    await tickDeclaration(page)
    console.log(`   filled ${filled}/${results.length} fields${missed.length ? ` (missed: ${missed.map((m) => m.key).join(', ')})` : ''}`)

    const shotDir = process.env.WORKER_SHOT_DIR
    if (shotDir) await page.screenshot({ path: `${shotDir}/${order.reference}-filled.png`, fullPage: true }).catch(() => {})

    if (!config.autoSubmit) {
      await setStatus(order.reference, 'action_required', `Auto-filled ${filled} fields; awaiting operator review & submit.`)
      console.log(`   ⏸ filled only (auto-submit off) → action_required`)
      return
    }

    const conf = await submitAndConfirm(page, { submitHints: config.submitHints, confirmationSelector: config.confirmationSelector })
    if (conf.ok) {
      if (shotDir) await page.screenshot({ path: `${shotDir}/${order.reference}-confirmed.png`, fullPage: true }).catch(() => {})
      await setStatus(order.reference, 'completed', `Submitted to the ${config.portalMode} portal. Confirmation ${conf.code}.`, {
        reference: conf.code,
        portal: config.portalMode,
      })
      console.log(`   ✓ submitted — confirmation ${conf.code} → completed`)
    } else {
      await setStatus(order.reference, 'action_required', `Auto-fill done but submission needs a human: ${conf.reason}.`)
      console.log(`   ⚠ ${conf.reason} → action_required`)
    }
  } catch (err) {
    await setStatus(order.reference, 'action_required', `Automation error: ${String(err.message).slice(0, 120)}`).catch(() => {})
    console.log(`   ✖ error: ${err.message}`)
  } finally {
    await page.close().catch(() => {})
  }
}

async function runAutoPass(launchOpts) {
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch(launchOpts)
  const context = await browser.newContext({ locale: 'en-US' })
  try {
    const orders = await getOrders()
    if (!orders.length) { console.log('✓ Queue empty.'); return 0 }
    console.log(`Processing ${orders.length} order(s) automatically…`)
    for (const o of orders) await autoProcess(context, o)
    return orders.length
  } finally {
    await browser.close()
  }
}

async function loadPlaywright() {
  try { return await import('playwright') } catch {
    console.error('✖ Playwright not installed. Run:  npm install && npm run install-browser')
    process.exit(1)
  }
}

async function main() {
  banner()

  if (has('--list') || has('--dry-run')) {
    const orders = await getOrders().catch((e) => { console.error(`✖ API: ${e.message}`); process.exit(1) })
    if (!orders.length) { console.log('✓ No orders in the queue.'); return }
    for (const o of orders) console.log(summarize(o) + '\n' + '─'.repeat(48))
    if (has('--dry-run')) {
      for (const o of orders) {
        console.log(`\n▶ ${o.reference} — field mapping:`)
        for (const f of mapApplication(o)) console.log(`   ${f.label.padEnd(28)} = ${f.value}`)
      }
    }
    return
  }

  if (has('--review')) return reviewMode()

  // Watch (default) or single auto pass.
  const launchOpts = { headless: config.headless }
  if (config.browserChannel) launchOpts.channel = config.browserChannel
  if (has('--auto') && !has('--watch')) {
    await runAutoPass(launchOpts)
    return
  }

  // --watch (default): loop forever, picking up new submitted orders automatically.
  console.log(`👀 Watch mode — polling every ${config.pollMs / 1000}s. Submit an order on the site and watch it get filed automatically. Ctrl+C to stop.`)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const n = await runAutoPass(launchOpts)
      if (n === 0) process.stdout.write('.')
    } catch (err) {
      console.error(`\n⚠ pass error: ${err.message}`)
    }
    await sleep(config.pollMs)
  }
}

/** Human-in-the-loop mode (headed): bot fills, operator reviews & submits. */
async function reviewMode() {
  const { chromium } = await loadPlaywright()
  const orders = await getOrders()
  if (!orders.length) { console.log('✓ No orders in the queue.'); return }
  const reviewOpts = { headless: false }
  if (config.browserChannel) reviewOpts.channel = config.browserChannel
  const browser = await chromium.launch(reviewOpts)
  const context = await browser.newContext({ locale: 'en-US' })
  const { fillAll, tickDeclaration } = await import('./fill.js')
  for (const order of orders) {
    console.log(`\n${'═'.repeat(46)}\n${summarize(order)}`)
    const page = await context.newPage()
    await page.goto(config.portalUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
    await ask('  Click through any intro screen, then press Enter to auto-fill… ')
    const results = await fillAll(page, mapApplication(order))
    await tickDeclaration(page)
    console.log(`  ✓ filled ${results.filter((r) => r.ok).length}/${results.length}. Review, solve any CAPTCHA, and submit manually.`)
    const outcome = await ask('  After submitting type: done / action / skip … ')
    if (outcome === 'done') await setStatus(order.reference, 'completed', 'Submitted by operator.')
    else if (outcome === 'action') await setStatus(order.reference, 'action_required', 'Operator needs more info.')
    await page.close().catch(() => {})
  }
  await browser.close()
}

main().catch((err) => { console.error(err); process.exit(1) })
