# Automation worker — fills the official Arrival Card automatically

A standalone tool that turns each submitted order on your website into a filed
Arrival Card on the official portal — **fully automatically** by default. It runs
wherever you want (a small VM/container), not on Vercel.

```
Customer fills YOUR form  →  order queued  →  worker pulls it  →  opens the portal,
fills every field, submits, reads the confirmation number  →  marks the order
"completed" and pushes the confirmation back (shown on your /track page).
```

## Two portals, one code path

| `WORKER_PORTAL_MODE` | Target | Use |
|---|---|---|
| `mock` (default) | a bundled, realistic stand-in form (`mock-portal/index.html`) | a complete, runnable, testable demo — works out of the box |
| `official` | the real NIA portal (`OFFICIAL_PORTAL_URL`) | production, after you refine selectors against the live form |

The mock portal is clearly labelled "DEMO / MOCK" so it can never be mistaken for the
real government site. The exact same fill/submit code drives both.

## Setup

```bash
cd worker
npm install
npm run install-browser   # downloads Chromium for Playwright
```

Environment (must match your app's server):

```bash
export WORKER_API_BASE="http://localhost:3000"     # or your deployed URL
export OPERATOR_API_KEY="dev-operator-key"          # match the server's key
export WORKER_PORTAL_MODE="mock"                    # mock (demo) | official
export OFFICIAL_PORTAL_URL="https://s.nia.gov.cn/ArrivalCardFillingPC/"  # for official mode
export WORKER_AUTO_SUBMIT="true"                    # auto-submit (true) or fill-only (false)
export WORKER_HEADLESS="true"                       # true unattended, false to watch
```

## Run it

```bash
npm start          # WATCH: loop forever, auto-process new orders as they arrive (fully automatic)
npm run auto       # process the current queue once, fully automatically
npm run review     # headed: bot fills, a human verifies & submits each order
npm run queue      # list the queue (no browser)
npm run dry-run    # show the field mapping per order (no browser)
node index.js --once CAC-7F3K-9Q2D   # process a single order
```

The end-to-end demo: start your app, run `npm start` here, submit an application on
the website, and watch the order get filed on the mock portal within seconds — its
confirmation number then appears on the site's tracking page.

## Live customer-CAPTCHA filing (the recommended model)

Instead of a bot solving the CAPTCHA, **the customer solves their own** — in real
time, on your website. Run the filing service:

```bash
npm run serve      # starts the filing service on :4100 (uses system Chrome via WORKER_BROWSER_CHANNEL=chrome)
```

Then point the site at it (`FILING_SERVICE_URL=http://localhost:4100` in the app's
env). The flow:

```
Customer finishes YOUR form → the service opens the portal in a live session and
fills every field → it screenshots the portal's CAPTCHA and your site shows it to
the customer → the customer types the code → it's entered into the same session and
submitted → the official confirmation comes straight back to the customer.
```

Endpoints (the app calls these server-side with `x-filing-key`): `POST /start`
`{reference, application}` → `{sessionId, captcha:{image}}`; `POST /solve`
`{sessionId, answer}` → `{status:"completed", confirmation}` or a fresh
`{status:"captcha"}` on a wrong code. `GET /health` for readiness.

This is legitimate: a real human completes the human-verification step for their own
application. It works when the portal uses a **simple image/text CAPTCHA**. If the
real NIA form uses reCAPTCHA/hCaptcha/behavioral checks, an image can't be relayed —
use the customer's-own-browser variant instead (a browser extension that autofills
the official form in the customer's genuine session).

## What it will and won't do

- ✅ Re-keys exactly the data the traveler already provided.
- ✅ Reads back the official confirmation number and syncs it to your app.
- ❌ Never solves CAPTCHAs or defeats bot-detection. If the **real** portal blocks an
  automated submit, the worker stops cleanly and flags the order `action_required` so a
  human can finish it (`npm run review`).

## Going to production (official mode)

The NIA portal is a localized SPA without published selectors. `mapping.js` locates
fields by **label hints**; refine those hints (or add precise selectors) against the
live form, set `WORKER_PORTAL_MODE=official`, and decide your `WORKER_AUTO_SUBMIT`
policy. For a government site, keeping a human in the loop (`npm run review`) is the
safest, most compliant choice. You are responsible for operating this lawfully, with
the traveler's authorization, and for the accuracy of every submission.
