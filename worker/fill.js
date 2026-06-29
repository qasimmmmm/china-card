/**
 * Best-effort, label-driven form filling for the official portal.
 *
 * Because the NIA portal is a localized SPA without published selectors, we
 * locate fields by trying several strategies per value (accessible label,
 * placeholder, name/id, nearby label text). Every attempt is wrapped so one
 * missing field never aborts the run, and we report exactly what was filled and
 * what wasn't so the operator can complete the rest by hand.
 *
 * This module NEVER clicks a final "submit" and NEVER attempts to solve a
 * CAPTCHA. A human operator always reviews and submits.
 */

const FIELD_TIMEOUT = 2500

async function firstVisible(locator) {
  const count = await locator.count().catch(() => 0)
  for (let i = 0; i < count; i++) {
    const el = locator.nth(i)
    if (await el.isVisible().catch(() => false)) return el
  }
  return null
}

async function locate(page, hints) {
  for (const hint of hints) {
    // 1) accessible label
    let el = await firstVisible(page.getByLabel(new RegExp(escapeRe(hint), 'i')))
    if (el) return el
    // 2) placeholder
    el = await firstVisible(page.locator(`input[placeholder*="${cssEsc(hint)}" i], textarea[placeholder*="${cssEsc(hint)}" i]`))
    if (el) return el
    // 3) name / id attribute
    el = await firstVisible(page.locator(`input[name*="${cssEsc(hint)}" i], input[id*="${cssEsc(hint)}" i], select[name*="${cssEsc(hint)}" i]`))
    if (el) return el
    // 4) a <label> whose text contains the hint → its associated control
    const lbl = await firstVisible(page.locator(`label:has-text("${cssEsc(hint)}")`))
    if (lbl) {
      const control = lbl.locator('xpath=following::*[self::input or self::select or self::textarea][1]')
      const c = await firstVisible(control)
      if (c) return c
    }
  }
  return null
}

export async function fillField(page, field) {
  try {
    const el = await locate(page, field.hints)
    if (!el) return { key: field.key, ok: false, reason: 'not found' }

    const tag = (await el.evaluate((n) => n.tagName.toLowerCase()).catch(() => '')) || ''

    if (tag === 'select') {
      try {
        await el.selectOption({ label: String(field.value) }, { timeout: FIELD_TIMEOUT })
      } catch {
        await el.selectOption(String(field.value), { timeout: FIELD_TIMEOUT }).catch(() => {})
      }
      return { key: field.key, ok: true }
    }

    if (field.type === 'select' || field.type === 'radio') {
      // Custom dropdown / radio rendered as div: type then pick a matching option.
      await el.click({ timeout: FIELD_TIMEOUT }).catch(() => {})
      const opt = await firstVisible(page.locator(`text="${cssEsc(String(field.value))}"`))
      if (opt) {
        await opt.click({ timeout: FIELD_TIMEOUT }).catch(() => {})
        return { key: field.key, ok: true }
      }
    }

    await el.fill(String(field.value), { timeout: FIELD_TIMEOUT })
    return { key: field.key, ok: true }
  } catch (err) {
    return { key: field.key, ok: false, reason: String(err?.message || err).slice(0, 80) }
  }
}

export async function fillAll(page, fields) {
  const results = []
  for (const f of fields) {
    results.push(await fillField(page, f))
  }
  return results
}

/** Tick the truthfulness/declaration checkbox if the form has one. */
export async function tickDeclaration(page) {
  try {
    const cb = await firstVisible(page.locator('input[type="checkbox"]'))
    if (cb && !(await cb.isChecked().catch(() => false))) {
      await cb.check({ timeout: 2000 }).catch(() => cb.click({ timeout: 2000 }))
    }
  } catch {
    /* optional */
  }
}

/**
 * Click the submit control and read back the official confirmation number.
 * Returns { ok, code } on success or { ok:false, reason } otherwise.
 * Never solves CAPTCHAs — if the portal blocks automated submit, this fails
 * cleanly and the operator handles it.
 */
export async function submitAndConfirm(page, { submitHints, confirmationSelector }) {
  // Find and click the submit button by any of the hint texts.
  let clicked = false
  for (const hint of submitHints) {
    const byRole = await firstVisible(page.getByRole('button', { name: new RegExp(escapeRe(hint), 'i') }))
    const btn = byRole || (await firstVisible(page.locator(`button:has-text("${cssEsc(hint)}"), [role="button"]:has-text("${cssEsc(hint)}")`)))
    if (btn) {
      await btn.click({ timeout: 4000 }).catch(() => {})
      clicked = true
      break
    }
  }
  if (!clicked) return { ok: false, reason: 'submit button not found' }

  // Wait for a confirmation number to appear.
  try {
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel)
        const t = el && el.textContent ? el.textContent.trim() : ''
        return t && t !== '—'
      },
      confirmationSelector,
      { timeout: 12000 },
    )
    const code = (await page.locator(confirmationSelector).first().textContent())?.trim()
    if (code && code !== '—') return { ok: true, code }
    return { ok: false, reason: 'confirmation empty' }
  } catch {
    return { ok: false, reason: 'no confirmation detected (CAPTCHA or different layout?)' }
  }
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function cssEsc(s) {
  return s.replace(/"/g, '\\"')
}
