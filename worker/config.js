// Worker configuration, read from environment with sensible defaults.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Default to the bundled MOCK portal so the automation is a complete, runnable,
// testable working model out of the box. Set WORKER_PORTAL_MODE=official (and
// OFFICIAL_PORTAL_URL) to point the very same code at the real NIA form.
const mode = (process.env.WORKER_PORTAL_MODE || 'mock').toLowerCase()
const mockPortalUrl = pathToFileURL(path.join(__dirname, 'mock-portal', 'index.html')).href
const officialUrl = process.env.OFFICIAL_PORTAL_URL || 'https://s.nia.gov.cn/ArrivalCardFillingPC/'

// In official mode, an operator can map the real form WITHOUT editing code by
// dropping a worker/selectors.official.json file (see selectors.official.example.json).
// Precedence for every selector: env var > JSON override > built-in default.
function loadOverride() {
  if (mode !== 'official') return {}
  const p = process.env.WORKER_SELECTORS_FILE || path.join(__dirname, 'selectors.official.json')
  try {
    if (!fs.existsSync(p)) return {}
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (e) {
    console.warn(`⚠ selectors override ${p} ignored: ${e.message}`)
    return {}
  }
}
const override = loadOverride()

export const config = {
  apiBase: process.env.WORKER_API_BASE || 'http://localhost:3000',
  operatorKey: process.env.OPERATOR_API_KEY || 'dev-operator-key',

  portalMode: mode, // 'mock' | 'official'
  portalUrl: mode === 'official' ? officialUrl : mockPortalUrl,

  // Fully automatic by default (fill + submit + capture confirmation, no human).
  autoSubmit: String(process.env.WORKER_AUTO_SUBMIT ?? 'true').toLowerCase() !== 'false',
  // Headless by default for unattended automation; headed if you want to watch.
  headless: String(process.env.WORKER_HEADLESS ?? 'true').toLowerCase() !== 'false',
  // Use an installed browser instead of Playwright's bundled Chromium, e.g.
  // WORKER_BROWSER_CHANNEL=chrome  (handy when the bundled download is blocked).
  browserChannel: process.env.WORKER_BROWSER_CHANNEL || '',

  // Watch mode polling interval.
  pollMs: Number(process.env.WORKER_POLL_MS || 6000),
  pullStatus: process.env.WORKER_PULL_STATUS || 'submitted',

  // How to submit + where to read the resulting confirmation number.
  submitHints:
    (process.env.WORKER_SUBMIT_HINTS ? process.env.WORKER_SUBMIT_HINTS.split('|') : override.submitHints) ||
    ['Submit declaration', 'Submit', '提交申报', '提交', '确认提交', 'Confirm'],
  confirmationSelector: process.env.WORKER_CONFIRM_SELECTOR || override.confirmationSelector || '#confirmationCode',

  // Per-field selector/hint overrides for official mode (empty otherwise).
  fieldOverrides: override.fields || {},

  // ── Live CAPTCHA-relay filing service ──────────────────────
  // The customer solves the portal's CAPTCHA themselves, in real time, on your
  // site. These selectors point at the CAPTCHA image, the answer input, and the
  // "wrong code" error on the portal (defaults match the bundled mock).
  filingPort: Number(process.env.FILING_SERVICE_PORT || 4100),
  serviceKey: process.env.FILING_SERVICE_KEY || 'dev-filing-key',
  captchaImageSelector: process.env.WORKER_CAPTCHA_IMAGE || override.captchaImageSelector || '#captcha-image',
  captchaInputSelector: process.env.WORKER_CAPTCHA_INPUT || override.captchaInputSelector || '#captcha-input',
  captchaErrorSelector: process.env.WORKER_CAPTCHA_ERROR || override.captchaErrorSelector || '#captcha-error',
  sessionTtlMs: Number(process.env.FILING_SESSION_TTL_MS || 300000),
  // TEST ONLY: reveal the mock's answer so an automated test can play the human.
  // Never enable in production — the whole point is that a real person solves it.
  testReveal: process.env.FILING_TEST_REVEAL === 'true',
}
