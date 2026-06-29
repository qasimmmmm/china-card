// Worker configuration, read from environment with sensible defaults.
// Set these in your shell or a .env you source before running.

export const config = {
  // Base URL of your deployed (or local) China Arrival Card app.
  apiBase: process.env.WORKER_API_BASE || 'http://localhost:3000',

  // Shared operator secret — must match OPERATOR_API_KEY on the server.
  // In local dev the server accepts "dev-operator-key" by default.
  operatorKey: process.env.OPERATOR_API_KEY || 'dev-operator-key',

  // Official NIA Arrival Card portal the operator fills on the traveler's behalf.
  // Desktop: https://s.nia.gov.cn/ArrivalCardFillingPC/
  portalUrl:
    process.env.OFFICIAL_PORTAL_URL || 'https://s.nia.gov.cn/ArrivalCardFillingPC/',

  // Run headed (false) so the operator can watch, complete any CAPTCHA, verify,
  // and submit manually. Headless is for mapping/inspection only.
  headless: String(process.env.WORKER_HEADLESS || 'false').toLowerCase() === 'true',

  // Status the worker pulls from the queue.
  pullStatus: process.env.WORKER_PULL_STATUS || 'submitted',
}
