#!/usr/bin/env node
/**
 * China Arrival Card — operator automation worker.
 *
 * Pulls submitted orders from your app, then (in browser mode) opens the
 * official NIA Arrival Card portal and pre-fills the traveler's details so a
 * human operator can verify, complete any CAPTCHA, and submit. The worker
 * deliberately stops before final submission — a person is always in the loop.
 *
 * Usage:
 *   node index.js --list          # show the queue and exit (no browser)
 *   node index.js --dry-run       # show the field mapping per order (no browser)
 *   node index.js                 # process the queue in a headed browser
 *   node index.js --once CAC-XXXX # process a single order
 *
 * Compliance: this tool re-keys data the traveler already provided, exactly as
 * the traveler would themselves. It does not bypass anti-bot measures. You are
 * responsible for operating it lawfully and for the accuracy of each submission.
 */
import readline from 'node:readline'
import { config } from './config.js'
import { pullQueue, getOrder, setStatus } from './api.js'
import { mapApplication, summarize } from './mapping.js'

const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const valueOf = (f) => {
  const i = args.indexOf(f)
  return i >= 0 ? args[i + 1] : undefined
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()) }))
}

async function getOrders() {
  const once = valueOf('--once')
  if (once) {
    const order = await getOrder(once)
    return order ? [order] : []
  }
  return pullQueue()
}

async function main() {
  console.log(`\n🛂  China Arrival Card worker`)
  console.log(`   API:    ${config.apiBase}`)
  console.log(`   Portal: ${config.portalUrl}\n`)

  let orders
  try {
    orders = await getOrders()
  } catch (err) {
    console.error(`✖ Could not reach the operator API: ${err.message}`)
    console.error(`  Is the app running, and is OPERATOR_API_KEY correct?`)
    process.exit(1)
  }

  if (!orders.length) {
    console.log('✓ No orders in the queue. Nothing to do.')
    return
  }

  console.log(`Found ${orders.length} order(s) in status "${config.pullStatus}":\n`)
  for (const o of orders) console.log(summarize(o) + '\n' + '─'.repeat(48))

  if (has('--list')) return

  if (has('--dry-run')) {
    for (const o of orders) {
      console.log(`\n▶ ${o.reference} — field mapping:`)
      for (const f of mapApplication(o)) {
        console.log(`   ${f.label.padEnd(28)} = ${f.value}`)
      }
    }
    console.log('\n(dry run — no browser launched)')
    return
  }

  // ── Browser mode ──────────────────────────────────────────
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    console.error('✖ Playwright is not installed. Run:  npm install && npm run install-browser')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: config.headless })
  const context = await browser.newContext({ locale: 'en-US' })

  for (const order of orders) {
    console.log(`\n══════════════════════════════════════════════`)
    console.log(`Processing ${order.reference}`)
    console.log(summarize(order))

    const page = await context.newPage()
    try {
      await page.goto(config.portalUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    } catch (err) {
      console.error(`  ⚠ Could not open portal: ${err.message}`)
    }

    console.log('\n  The portal is open. If there is an intro/consent screen, click through to the form,')
    await ask('  then press Enter here to auto-fill the traveler details… ')

    const { fillAll } = await import('./fill.js')
    const results = await fillAll(page, mapApplication(order))
    const ok = results.filter((r) => r.ok).map((r) => r.key)
    const missed = results.filter((r) => !r.ok)
    console.log(`  ✓ Filled ${ok.length} field(s): ${ok.join(', ') || '—'}`)
    if (missed.length) {
      console.log(`  ⚠ Please complete by hand: ${missed.map((m) => m.key).join(', ')}`)
    }

    console.log('\n  ▸ REVIEW every field, complete anything missing, solve any CAPTCHA, and SUBMIT manually.')
    const outcome = await ask('  After submitting, type: done / action / skip … ')

    try {
      if (outcome === 'done') {
        await setStatus(order.reference, 'completed', 'Submitted to the NIA portal and confirmed by operator.')
        console.log('  ✓ Marked completed.')
      } else if (outcome === 'action') {
        await setStatus(order.reference, 'action_required', 'Operator needs more info from the traveler.')
        console.log('  ✓ Marked action required.')
      } else {
        console.log('  ↷ Skipped — status unchanged.')
      }
    } catch (err) {
      console.error(`  ✖ Status update failed: ${err.message}`)
    }

    await page.close().catch(() => {})
  }

  await browser.close()
  console.log('\n✓ Queue processed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
