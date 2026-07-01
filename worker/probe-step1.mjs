/** Focused probe: is the step-1 passport upload mandatory to advance? (read-only) */
import { chromium } from 'playwright'
import fs from 'node:fs'
const OUT = '/tmp/nia-recon'; fs.mkdirSync(OUT, { recursive: true })
const log = (...a) => console.log('[probe]', ...a)

const toasts = async (page) => page.evaluate(() =>
  Array.from(document.querySelectorAll('.el-message, .el-message-box, .el-notification, .el-form-item__error'))
    .map((e) => (e.textContent || '').trim()).filter(Boolean))
const stepTitle = async (page) => page.evaluate(() =>
  (document.querySelector('.el-step.is-process .el-step__title, .is-process .el-step__title')?.textContent || '').trim())

const run = async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: false })
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })).newPage()
  try {
    await page.goto('https://s.nia.gov.cn/ArrivalCardFillingPC/', { waitUntil: 'networkidle', timeout: 45000 })
    await page.getByText('Entry Declaration', { exact: true }).first().click()
    await page.waitForTimeout(1500)
    await page.locator('button:has-text("I AGREE"), .el-button:has-text("I AGREE")').first().click().catch(() => {})
    await page.waitForTimeout(1500)
    log('at step:', JSON.stringify(await stepTitle(page)))

    // select Ordinary Passport, DO NOT upload
    const docItem = page.locator('.el-form-item', { hasText: 'Document' }).first()
    await docItem.locator('.el-select').first().click()
    await page.waitForTimeout(400)
    await page.locator('.el-select-dropdown__item:visible', { hasText: 'Ordinary Passport' }).first().click()
    await page.waitForTimeout(400)

    log('clicking Next with NO upload…')
    await page.locator('button:has-text("Next"), .el-button:has-text("Next")').first().click().catch((e) => log('next fail', e.message))
    await page.waitForTimeout(1500)
    log('toasts/errors:', JSON.stringify(await toasts(page)))
    log('step after Next:', JSON.stringify(await stepTitle(page)))
    // is there any "fill manually / skip" affordance on step 1?
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a,span,button,.el-link'))
      .map((e) => (e.textContent || '').trim()).filter((t) => /manual|skip|fill in|enter manually|手动|跳过/i.test(t)))
    log('manual/skip affordances:', JSON.stringify(links))
    await page.screenshot({ path: OUT + '/probe-step1-noupload.png', fullPage: true })
    await page.waitForTimeout(2500)
  } catch (e) { log('ERR', e.message); await page.screenshot({ path: OUT + '/probe-err.png', fullPage: true }).catch(() => {}) }
  finally { await b.close() }
}
run()
