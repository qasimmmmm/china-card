/**
 * LIVE RECON of the real NIA CDAC portal (read-only; NEVER submits).
 *
 * Walks landing -> Entry Declaration -> notice/I AGREE -> the 5-step wizard and
 * dumps each step's real Element-UI structure (label -> control kind -> a stable
 * selector) to JSON + screenshots so worker/official mode can be calibrated.
 *
 * Fills only what's needed to advance a step, and HARD-STOPS before the final
 * submit. Run:  node worker/recon-live.mjs
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const URL = 'https://s.nia.gov.cn/ArrivalCardFillingPC/'
const OUT = '/tmp/nia-recon'
fs.mkdirSync(OUT, { recursive: true })

const log = (...a) => console.log('[recon]', ...a)
const save = (name, obj) => fs.writeFileSync(path.join(OUT, name), typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2))

// In-page: describe every Element-UI form-item (label + control kind + selector),
// whether or not it's currently visible, plus wizard steps and key controls.
function domProbe() {
  const vis = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
  }
  const cssPath = (el) => {
    if (!el) return null
    const parts = []
    let n = el
    for (let depth = 0; n && n.nodeType === 1 && depth < 5; depth++) {
      let sel = n.tagName.toLowerCase()
      if (n.id) { sel += `#${n.id}`; parts.unshift(sel); break }
      const cls = (n.className || '').toString().trim().split(/\s+/).filter(Boolean).slice(0, 3)
      if (cls.length) sel += '.' + cls.join('.')
      const sibs = n.parentNode ? Array.from(n.parentNode.children).filter((c) => c.tagName === n.tagName) : []
      if (sibs.length > 1) sel += `:nth-of-type(${sibs.indexOf(n) + 1})`
      parts.unshift(sel)
      n = n.parentNode
    }
    return parts.join(' > ')
  }
  const kindOf = (item) => {
    if (item.querySelector('.el-select')) return 'select'
    if (item.querySelector('.el-radio-group, .el-radio')) return 'radio'
    if (item.querySelector('.el-checkbox')) return 'checkbox'
    if (item.querySelector('.el-date-editor, input[placeholder*="ate"]')) return 'date'
    if (item.querySelector('.el-upload, input[type=file]')) return 'upload'
    if (item.querySelector('textarea')) return 'textarea'
    if (item.querySelector('input')) return 'text'
    return 'unknown'
  }
  const items = Array.from(document.querySelectorAll('.el-form-item')).map((it) => {
    const labelEl = it.querySelector('.el-form-item__label')
    const label = (labelEl?.textContent || '').trim()
    const ph = it.querySelector('input,textarea')?.getAttribute('placeholder') || null
    const required = !!it.querySelector('.el-form-item__label.is-required, .is-required') || (labelEl?.textContent || '').includes('*')
    const radios = Array.from(it.querySelectorAll('.el-radio')).map((r) => (r.textContent || '').trim()).filter(Boolean)
    return { label, kind: kindOf(it), placeholder: ph, required, visible: vis(it), radios: radios.length ? radios : undefined, selector: cssPath(it) }
  })
  const steps = Array.from(document.querySelectorAll('.el-step, .el-steps .el-step__title')).map((s) => (s.textContent || '').trim()).filter(Boolean)
  const buttons = Array.from(document.querySelectorAll('button')).map((b) => (b.textContent || '').trim()).filter(Boolean)
  const uploads = Array.from(document.querySelectorAll('input[type=file]')).map((u) => ({ name: u.getAttribute('name'), accept: u.getAttribute('accept'), cls: u.className }))
  const canvases = document.querySelectorAll('canvas').length
  return { url: location.href, title: document.title, stepTitle: (document.querySelector('.el-step.is-process .el-step__title, .is-process .el-step__title')?.textContent || '').trim(), steps, items, buttons, uploads, canvases }
}

async function dump(page, tag) {
  await page.waitForTimeout(600)
  const probe = await page.evaluate(domProbe)
  save(`${tag}.json`, probe)
  await page.screenshot({ path: path.join(OUT, `${tag}.png`), fullPage: true }).catch(() => {})
  const visItems = probe.items.filter((i) => i.visible)
  log(`${tag}: step="${probe.stepTitle}" | ${visItems.length} visible form-items | canvases=${probe.canvases}`)
  for (const i of visItems) log(`    [${i.kind}${i.required ? '*' : ''}] ${i.label || '(no label)'}${i.radios ? ' {' + i.radios.join(', ') + '}' : ''}`)
  return probe
}

// click any element whose exact text matches (cards are plain divs, not buttons)
async function clickExact(page, text) {
  const el = page.getByText(text, { exact: true }).first()
  await el.waitFor({ state: 'visible', timeout: 15000 })
  await el.click()
}
// click a button/link by substring text
async function clickByText(page, text) {
  const el = page.locator(`button:has-text("${text}"), a:has-text("${text}"), .el-button:has-text("${text}")`).first()
  await el.waitFor({ state: 'visible', timeout: 15000 })
  await el.click()
}

// --- field-aware throwaway values (recon only; NEVER submitted) ---
function valueFor(label) {
  const L = label.toLowerCase()
  if (/(last name|surname|family)/.test(L)) return 'SMITH'
  if (/(first name|given)/.test(L)) return 'JOHN'
  if (/other name|alias/.test(L)) return ''
  if (/chinese name/.test(L)) return ''
  if (/passport (number|no)|document number|证件号/.test(L)) return 'E12345678'
  if (/city of birth/.test(L)) return 'LONDON'
  if (/(flight|train|vessel|carrier|班次|航班)/.test(L)) return 'CA123'
  if (/address|accommodation|hotel|住址/.test(L)) return 'BEIJING HOTEL, DONGCHENG DISTRICT'
  if (/email|邮箱/.test(L)) return 'traveler@example.com'
  if (/(contact number in china|中国境内)/.test(L)) return '13800000000'
  if (/(contact number|phone|mobile|tel|电话)/.test(L)) return '2025550123'
  if (/(entity|inviter|invit)/.test(L)) return ''
  return 'TEST'
}
const DATE_FOR = (label) => {
  const L = label.toLowerCase()
  if (/birth/.test(L)) return '1990-01-01'
  if (/expiry|expiration|valid/.test(L)) return '2030-01-01'
  if (/entry|arrival/.test(L)) return '2026-07-03' // within a near window; adjust if picker rejects
  if (/departure|离境/.test(L)) return '2026-07-10'
  return '2026-07-03'
}

// Read the options of an OPEN el-select dropdown.
async function openSelectOptions(page) {
  await page.waitForTimeout(350)
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.el-select-dropdown:not([style*="display: none"]) .el-popper:not([style*="display: none"]) .el-select-dropdown__item, .el-select-dropdown[style*="display: none"] ~ * , body > .el-select-dropdown .el-select-dropdown__item'))
      .map((o) => (o.textContent || '').trim()).filter(Boolean),
  )
}

// Fill every visible form-item on the current step; capture select options.
async function fillVisibleStep(page, tag) {
  const items = page.locator('.el-form-item:visible')
  const n = await items.count()
  const captured = {}
  for (let i = 0; i < n; i++) {
    const it = items.nth(i)
    const label = (await it.locator('.el-form-item__label').first().textContent().catch(() => '') || '').trim()
    const hasSelect = await it.locator('.el-select').count()
    const hasRadio = await it.locator('.el-radio').count()
    const hasFile = await it.locator('input[type=file]').count()
    const hasDate = await it.locator('.el-date-editor, input[placeholder*="ate"], input[placeholder*="日期"]').count()
    const hasText = await it.locator('input.el-input__inner, textarea').count()
    try {
      if (hasFile) {
        // satisfy the upload gate with a tiny valid JPEG (OCR may find nothing; fields stay editable)
        await it.locator('input[type=file]').first().setInputFiles(DUMMY_JPEG).catch(() => {})
        await page.waitForTimeout(1200)
      } else if (hasSelect) {
        await it.locator('.el-select').first().click()
        const opts = await page.evaluate(() =>
          Array.from(document.querySelectorAll('.el-select-dropdown__item'))
            .filter((o) => o.offsetParent !== null).map((o) => (o.textContent || '').trim()).filter(Boolean))
        captured[label] = opts
        // pick a sensible option
        const L = label.toLowerCase()
        let pick = opts[0]
        if (/document/.test(L)) pick = opts.find((o) => /ordinary passport/i.test(o)) || pick
        if (/gender|sex/.test(L)) pick = opts.find((o) => /^male$/i.test(o)) || pick
        if (/nationality|citizenship/.test(L)) pick = opts.find((o) => /united states|united kingdom/i.test(o)) || pick
        if (/transportation|transport/.test(L)) pick = opts.find((o) => /flight/i.test(o)) || pick
        if (pick) await page.locator('.el-select-dropdown__item:visible', { hasText: pick }).first().click().catch(async () => { await page.keyboard.press('Escape') })
        await page.waitForTimeout(500)
      } else if (hasRadio) {
        await it.locator('.el-radio').first().click().catch(() => {})
      } else if (hasDate) {
        const inp = it.locator('input').first()
        await inp.click().catch(() => {})
        await inp.fill(DATE_FOR(label)).catch(() => {})
        await page.keyboard.press('Enter').catch(() => {})
        await page.waitForTimeout(300)
      } else if (hasText) {
        const v = valueFor(label)
        if (v) await it.locator('input.el-input__inner, textarea').first().fill(v).catch(() => {})
      }
    } catch (e) { log(`  fill "${label}" failed: ${e.message}`) }
  }
  if (Object.keys(captured).length) save(`${tag}.options.json`, captured)
  return captured
}

async function currentErrors(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.el-form-item__error')).map((e) => (e.textContent || '').trim()).filter(Boolean))
}

// 1x1 JPEG written to disk to satisfy required file inputs.
const DUMMY_JPEG = path.join(OUT, 'dummy.jpg')
fs.writeFileSync(DUMMY_JPEG, Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AvwA//9k=',
  'base64'))

const run = async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const page = await ctx.newPage()
  const netlog = []
  page.on('request', (r) => { if (/\/(save|doOcr|getKA|Rules|entryCountry|dict)/i.test(r.url())) netlog.push(`${r.method()} ${r.url()}`) })

  try {
    log('open portal…')
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 })
    await dump(page, '00-landing')

    log('click Entry Declaration card (exact)…')
    await clickExact(page, 'Entry Declaration')
    await page.waitForTimeout(1500)

    log('accept notice (I AGREE)…')
    await clickByText(page, 'I AGREE').catch(() => log('  no I AGREE; maybe already on form'))
    await page.waitForTimeout(1500)

    // Adaptive walk: fill visible step -> Next -> dump, up to 6 iterations.
    // HARD-STOP before any final submit.
    for (let step = 1; step <= 6; step++) {
      const probe = await dump(page, `step-${step}`)
      const title = (probe.stepTitle || '').toLowerCase()
      const isFinal = /accompany|submit|confirm/.test(title) || probe.buttons.some((b) => /^submit$|提交|确认/i.test(b))
      log(`--- step ${step}: "${probe.stepTitle}" (final=${isFinal}) ---`)

      log('  filling visible fields (throwaway)…')
      await fillVisibleStep(page, `step-${step}`)
      const errs = await currentErrors(page)
      if (errs.length) { save(`step-${step}.errors.json`, errs); log('  validation errors:', JSON.stringify(errs)) }

      if (isFinal) { log('  >>> FINAL step reached — STOPPING before submit (recon only).'); break }

      // advance
      const next = page.locator('button:has-text("Next"), .el-button:has-text("Next"), button:has-text("下一步"), .el-button--primary').last()
      const before = page.url() + '|' + (probe.stepTitle || '')
      await next.click().catch((e) => log('  Next click failed:', e.message))
      await page.waitForTimeout(1800)
      const afterTitle = await page.evaluate(() => (document.querySelector('.el-step.is-process .el-step__title, .is-process .el-step__title')?.textContent || '').trim())
      if (before === page.url() + '|' + afterTitle) {
        const e2 = await currentErrors(page)
        log('  step did NOT advance. errors:', JSON.stringify(e2))
        save(`step-${step}.blocked.json`, { errors: e2, note: 'did not advance' })
        break
      }
    }

    save('network.json', netlog)
    log('DONE. Artifacts in', OUT)
    await page.waitForTimeout(3000)
  } catch (e) {
    log('ERROR:', e.message)
    await page.screenshot({ path: path.join(OUT, 'error.png'), fullPage: true }).catch(() => {})
    save('network.json', netlog)
  } finally {
    await browser.close()
  }
}

run()
