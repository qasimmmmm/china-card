// Worker configuration, read from environment with sensible defaults.
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Default to the bundled MOCK portal so the automation is a complete, runnable,
// testable working model out of the box. Set WORKER_PORTAL_MODE=official (and
// OFFICIAL_PORTAL_URL) to point the very same code at the real NIA form.
const mode = (process.env.WORKER_PORTAL_MODE || 'mock').toLowerCase()
const mockPortalUrl = pathToFileURL(path.join(__dirname, 'mock-portal', 'index.html')).href
const officialUrl = process.env.OFFICIAL_PORTAL_URL || 'https://s.nia.gov.cn/ArrivalCardFillingPC/'

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
  submitHints: ['Submit declaration', 'Submit', '提交申报', '提交', '确认提交', 'Confirm'],
  confirmationSelector: process.env.WORKER_CONFIRM_SELECTOR || '#confirmationCode',
}
