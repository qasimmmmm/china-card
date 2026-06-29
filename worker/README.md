# Operator automation worker

This is a **separate, operator-run tool** — it is *not* part of the website and is
never deployed to Vercel. It helps your processing team re-key a customer's
already-submitted details into the **official NIA China Arrival Card portal**,
with a **human always in the loop**.

## What it does

1. Pulls orders from your app's operator API (`/api/operator/queue`).
2. Opens the official portal in a real browser.
3. Pre-fills the traveler's details (best-effort, by field label).
4. **Stops.** The operator reviews every field, completes anything missing,
   solves any CAPTCHA, and clicks submit.
5. Updates the order status back in your app.

## What it deliberately does **not** do

- It does **not** bypass or solve CAPTCHAs or any anti-bot protection.
- It does **not** auto-submit — a person always verifies and submits.
- It does **not** invent data — it only enters what the traveler provided.

## Setup

```bash
cd worker
npm install
npm run install-browser   # downloads Chromium for Playwright
```

Set environment variables (must match your server):

```bash
export WORKER_API_BASE="http://localhost:3000"      # or your Vercel URL
export OPERATOR_API_KEY="dev-operator-key"           # match the server
export OFFICIAL_PORTAL_URL="https://s.nia.gov.cn/ArrivalCardFillingPC/"
export WORKER_HEADLESS="false"                        # headed so you can review
```

## Usage

```bash
npm run queue      # list the queue (no browser)
npm run dry-run    # show the field mapping per order (no browser)
npm start          # process the queue in a headed browser
node index.js --once CAC-7F3K-9Q2D   # process one order
```

## Tuning the field mapping

The portal is a localized single-page app without published selectors, so
`mapping.js` locates fields by **label hints**. After inspecting the live portal,
refine the `hints` (or add precise selectors) in `mapping.js` and `fill.js` to
make filling exact. Until then, the worker fills what it can and clearly tells the
operator which fields to complete by hand.

## Compliance

You are responsible for operating this tool lawfully, for having the traveler's
authorization to act on their behalf, and for the accuracy of every submission.
The official Arrival Card is free directly from the NIA; this service charges only
for optional assistance.
