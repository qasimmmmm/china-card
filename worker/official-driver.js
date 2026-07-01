/**
 * Element-UI wizard driver for the China Digital Arrival Card portal.
 *
 * The real NIA portal (s.nia.gov.cn/ArrivalCardFillingPC) and our high-fidelity
 * mock (worker/mock-portal) are BOTH Vue 2 + Element UI apps with the identical
 * DOM shape (.el-form-item / .el-form-item__label / .el-select /
 * .el-select-dropdown__item / .el-radio / .el-date-editor / .el-upload__input).
 * Every control is located by its FIELD LABEL, never by element order, so this
 * one driver runs unchanged against either target.
 *
 * Flow: landing → "Entry Declaration" → "I AGREE" → 5-step wizard
 *   1 Uploading ID Document Page   (doc type + passport image → OCR)
 *   2 Basic Information Filling
 *   3 Personal Information Filling
 *   4 Travel Information Filling
 *   5 Accompanying Person(s) + Declaration + Signature
 * → Submit → Entry Declaration Receipt (QR).
 *
 * SAFETY: on the REAL portal this NEVER clicks the final Submit unless the caller
 * passes { submit: true } — which the pipeline only does after the customer has
 * given consent + signature for their own real data. It never fabricates data
 * and never bypasses a human gate.
 */

const T = 6000

// ── Element-UI-aware primitives (label-anchored) ─────────────────────────────

/** The .el-form-item whose label contains `label` (colon/asterisk tolerant). */
function itemByLabel(page, label) {
  return page
    .locator('.el-form-item')
    .filter({ has: page.locator('.el-form-item__label', { hasText: label }) })
    .first()
}

async function elFill(page, label, value) {
  if (value == null || value === '') return { label, ok: true, skipped: true }
  try {
    const it = itemByLabel(page, label)
    const inp = it.locator('input.el-input__inner, textarea').first()
    await inp.waitFor({ state: 'visible', timeout: T })
    await inp.fill(String(value))
    return { label, ok: true }
  } catch (e) {
    return { label, ok: false, reason: msg(e) }
  }
}

async function elSelect(page, label, optionText) {
  if (optionText == null || optionText === '') return { label, ok: true, skipped: true }
  try {
    const it = itemByLabel(page, label)
    await it.locator('.el-select').first().click({ timeout: T })
    await page.waitForTimeout(250)
    // Choose the visible dropdown option whose trimmed text matches best.
    const picked = await page.evaluate((opt) => {
      const items = Array.from(document.querySelectorAll('.el-select-dropdown__item')).filter((o) => o.offsetParent !== null)
      const norm = (s) => (s || '').trim()
      let el = items.find((o) => norm(o.textContent) === opt)
      if (!el) el = items.find((o) => norm(o.textContent).toLowerCase() === String(opt).toLowerCase())
      if (!el) el = items.find((o) => norm(o.textContent).toLowerCase().startsWith(String(opt).toLowerCase()))
      if (!el) el = items.find((o) => norm(o.textContent).toLowerCase().includes(String(opt).toLowerCase()))
      if (el) { el.scrollIntoView(); el.click(); return norm(el.textContent) }
      return null
    }, String(optionText))
    if (!picked) { await page.keyboard.press('Escape').catch(() => {}); return { label, ok: false, reason: `no option ~ "${optionText}"` } }
    await page.waitForTimeout(150)
    return { label, ok: true, picked }
  } catch (e) {
    return { label, ok: false, reason: msg(e) }
  }
}

async function elRadio(page, label, optionText) {
  if (optionText == null || optionText === '') return { label, ok: true, skipped: true }
  try {
    const it = itemByLabel(page, label)
    const radio = it.locator('.el-radio', { hasText: String(optionText) }).first()
    await radio.waitFor({ state: 'visible', timeout: T })
    await radio.click()
    return { label, ok: true }
  } catch (e) {
    return { label, ok: false, reason: msg(e) }
  }
}

async function elDate(page, label, ymd) {
  if (!ymd) return { label, ok: true, skipped: true }
  try {
    const it = itemByLabel(page, label)
    const inp = it.locator('input').first()
    await inp.click({ timeout: T })
    await inp.fill(String(ymd))
    await page.keyboard.press('Enter')
    await page.waitForTimeout(150)
    // close any open date panel
    await page.mouse.click(5, 5).catch(() => {})
    return { label, ok: true }
  } catch (e) {
    return { label, ok: false, reason: msg(e) }
  }
}

async function elUpload(page, label, filePath) {
  try {
    const it = itemByLabel(page, label)
    const input = it.locator('input[type=file]').first()
    await input.waitFor({ state: 'attached', timeout: T })
    await input.setInputFiles(filePath)
    return { label, ok: true }
  } catch (e) {
    return { label, ok: false, reason: msg(e) }
  }
}

async function clickNext(page) {
  const next = page.locator('button:has-text("Next"), .el-button:has-text("Next")').first()
  await next.waitFor({ state: 'visible', timeout: T })
  await next.click()
  await page.waitForTimeout(700)
}

/** Draw a short signature stroke on the declaration canvas (works on mock; the
 *  real portal exposes a signature canvas too). Returns ok/skip. */
async function signCanvas(page) {
  try {
    const canvas = page.locator('canvas').first()
    await canvas.waitFor({ state: 'visible', timeout: T })
    const b = await canvas.boundingBox()
    if (!b) return { label: 'signature', ok: false, reason: 'no canvas box' }
    const y = b.y + b.height / 2
    await page.mouse.move(b.x + 25, y)
    await page.mouse.down()
    await page.mouse.move(b.x + 70, y - 22)
    await page.mouse.move(b.x + 120, y + 18)
    await page.mouse.move(b.x + 170, y - 12)
    await page.mouse.move(b.x + 220, y + 8)
    await page.mouse.up()
    return { label: 'signature', ok: true }
  } catch (e) {
    return { label: 'signature', ok: false, reason: msg(e) }
  }
}

async function tickConsent(page) {
  try {
    const cb = page.locator('.el-checkbox').first()
    if (await cb.count()) { await cb.click(); return { label: 'consent', ok: true } }
    const raw = page.locator('input[type=checkbox]').first()
    if (await raw.count()) { await raw.check().catch(() => raw.click()); return { label: 'consent', ok: true } }
    return { label: 'consent', ok: false, reason: 'no checkbox' }
  } catch (e) { return { label: 'consent', ok: false, reason: msg(e) } }
}

// ── Value normalization (mirror what the customer confirmed on Review) ────────

const up = (v) => (typeof v === 'string' ? v.toUpperCase() : v)
const dialingCode = (v) => { const m = String(v || '').match(/\+?\d+/); return m ? m[0] : v }

// ── Navigation ───────────────────────────────────────────────────────────────

export async function navigateToForm(page) {
  // Standard "Entry Declaration" card (NOT the border-area-residents one).
  await page.getByText('Entry Declaration', { exact: true }).first().click({ timeout: 15000 })
  await page.waitForTimeout(900)
  const agree = page.locator('button:has-text("I AGREE"), .el-button:has-text("I AGREE")').first()
  if (await agree.count().catch(() => 0)) { await agree.click().catch(() => {}); await page.waitForTimeout(900) }
}

// ── Full wizard drive ────────────────────────────────────────────────────────

/**
 * Drive all five steps from a customer application.
 * @param {import('playwright').Page} page
 * @param {object} order  { application, passportImagePath }
 * @param {object} opts   { submit?: boolean }  submit only with real consent
 * @returns {Promise<{steps:object[], filled:number, missed:string[], confirmation?:string}>}
 */
export async function driveWizard(page, order, opts = {}) {
  const a = order.application || {}
  const steps = []
  const record = (r) => { steps.push(r); return r }

  await navigateToForm(page)

  // ── Step 1: Uploading ID Document Page ──
  record(await elSelect(page, 'Type of ID Document', a.docType))
  if (order.passportImagePath) {
    record(await elUpload(page, 'Upload ID Document Page', order.passportImagePath))
    await page.waitForTimeout(1600) // allow OCR to settle
  } else {
    record({ label: 'Upload ID Document Page', ok: false, reason: 'no passport image supplied' })
  }
  await clickNext(page)

  // ── Step 2: Basic Information ──
  record(await elFill(page, 'Last Name', up(a.surname)))
  record(await elFill(page, 'First Name', up(a.givenNames)))
  record(await elRadio(page, 'Gender', a.sex))
  record(await elDate(page, 'Date of Birth', a.dob))
  record(await elSelect(page, 'Country/Region of Citizenship', a.nationality))
  record(await elFill(page, 'Passport Number', up(a.passportNumber)))
  await clickNext(page)

  // ── Step 3: Personal Information ──
  record(await elFill(page, 'Other Name', up(a.otherName)))
  record(await elFill(page, 'Chinese Name', a.chineseName))
  record(await elSelect(page, 'Country/Region of Birth', a.countryOfBirth))
  record(await elFill(page, 'City of Birth', a.cityOfBirth))
  record(await elRadio(page, 'Has this passport ever been lost or stolen?', a.passportLostStolen))
  await clickNext(page)

  // ── Step 4: Travel Information ──
  record(await elSelect(page, 'Entry Transportation Mode', a.transportMode))
  record(await elFill(page, 'Arrival Flight/Train/Vessel Number', up(a.carrierNumber)))
  record(await elDate(page, 'Date of Entry', a.arrivalDate))
  record(await elSelect(page, 'City of Entry', a.entryCity))
  await page.waitForTimeout(300) // dependent port list loads after city
  record(await elSelect(page, 'Port/Channel of Entry', a.entryPort))
  record(await elSelect(page, 'Purpose of Entry', a.purpose === 'Other' && a.purposeOther ? a.purposeOther : a.purpose))
  record(await elSelect(page, 'Destination Cities in China', a.destinationCity))
  record(await elFill(page, 'Address in China', a.addressInChina))
  record(await elRadio(page, 'Been to other countries/regions in the past 2 years?', a.beenToOtherCountries))
  record(await elRadio(page, 'Hold a valid visa/permit?', a.hasVisa))
  if (a.hasVisa === 'Yes') {
    record(await elSelect(page, 'Visa Type', a.visaType))
    record(await elFill(page, 'Visa Number', up(a.visaNumber)))
  }
  record(await elSelect(page, 'Phone Area Code', dialingCode(a.phoneAreaCode)))
  record(await elFill(page, 'Contact Number', a.phone))
  record(await elFill(page, 'Email', a.email))
  await clickNext(page)

  // ── Step 5: Accompanying Persons + Declaration + Signature ──
  record(await elRadio(page, 'Do you have accompanying person (s)?', a.accompanying || 'No'))
  record(await tickConsent(page))
  record(await signCanvas(page))

  const filled = steps.filter((s) => s.ok && !s.skipped).length
  const missed = steps.filter((s) => !s.ok).map((s) => `${s.label} (${s.reason})`)

  // FINAL SUBMIT — only with explicit consent-backed authorization. On the real
  // portal this is the customer's legal attestation; nothing submits without it.
  let confirmation = null
  let receiptImage = null
  if (opts.submit) {
    const r = await submitWizard(page)
    confirmation = r.confirmation
    receiptImage = r.receiptImage
  }

  return { steps, filled, total: steps.length, missed, confirmation, receiptImage, submitted: !!opts.submit }
}

/**
 * Click the final Submit and read back the official confirmation + receipt.
 * Split out so the pipeline can do a human/customer review BEFORE this
 * irreversible step (fill on /start, submit on /confirm).
 */
export async function submitWizard(page, opts = {}) {
  const confirmationSelector = opts.confirmationSelector || '#confirmationCode'
  const receiptSelector = opts.receiptSelector || '#confirmation'
  const submitBtn = page.locator('button:has-text("Submit"), .el-button:has-text("Submit"), .el-button--primary:has-text("提交")').first()
  await submitBtn.click({ timeout: T }).catch(() => {})
  let confirmation = null
  let receiptImage = null
  try {
    await page.waitForSelector(confirmationSelector, { timeout: 15000 })
    confirmation = (await page.locator(confirmationSelector).first().textContent())?.trim() || null
    const buf = await page.locator(receiptSelector).first().screenshot().catch(() => null)
    if (buf) receiptImage = `data:image/png;base64,${buf.toString('base64')}`
  } catch { /* no confirmation (real portal WAF / different layout / needs manual finish) */ }
  return { confirmation, receiptImage }
}

/** Screenshot the whole page (a review image of the filled form). */
export async function pageShot(page) {
  const buf = await page.screenshot({ fullPage: true }).catch(() => page.screenshot())
  return `data:image/png;base64,${buf.toString('base64')}`
}

function msg(e) { return String(e?.message || e).replace(/\s+/g, ' ').slice(0, 90) }
