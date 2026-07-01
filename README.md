# China Arrival Card — iVisa Portal

A conversion-focused, **fully working** website for an **independent** service that
helps travelers complete the **China Digital Arrival Card (CDAC)** — the immigration
entry declaration launched by China's National Immigration Administration (NIA) on
20 November 2025.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, deployable to
**Vercel** in minutes.

> **⚠️ Important compliance note.** The official China Arrival Card is **free** on the
> NIA's own channels, and the NIA warns against paid third‑party "arrival card" sites.
> This project is built as a **transparent, independent assistance service** — every
> page states it is **not a government website**, links to the free official channels,
> and explains exactly what the optional service fee covers. Keep these disclaimers
> prominent. See **Before you go live** below.

---

## ✨ What's included

- **Polished marketing site** — hero, trust strip, "what is it", 4‑step process,
  requirements, features, sample confirmation, pricing, eligibility, FAQ, final CTA.
- **Multi‑step application form** matching the official CDAC fields, with conditional
  logic, inline validation, a review step, and a confirmation screen with order
  reference. (No reviews/testimonials, by request.)
- **Order API + tracking** — submissions are stored, given a reference, and trackable
  by the customer; an operator queue + status API powers fulfillment.
- **Operator automation worker** (`/worker`) — a separate, **human‑in‑the‑loop**
  Playwright tool that pre‑fills the official NIA portal for an operator to review and
  submit. It never bypasses CAPTCHAs and never auto‑submits.
- **Legal & ads‑policy pages** — Disclaimer/non‑affiliation, Terms, Privacy, Refund,
  Cookies, and an "Official government links" page, plus a cookie‑consent banner.
- **3 SEO guide articles**, JSON‑LD structured data, sitemap, robots, manifest, and a
  generated favicon.

## 🧱 Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Forms | react‑hook‑form + zod |
| Icons | lucide‑react |
| Hosting | Vercel (zero‑config) |
| Automation | Playwright (operator worker, separate package) |

## 📁 Project structure

```
src/
  app/                    # routes (App Router)
    api/                  #   orders, operator, contact endpoints
    apply/ track/ faq/ …  #   pages
    legal/ guide/         #   legal pages & guide articles
  components/             # UI: home sections, apply form, layout, brand, legal…
  content/                # marketing copy, form schema, guide articles (data)
  lib/                    # site config, store, orders, validation, utils
worker/                   # operator automation (Playwright) — NOT deployed to Vercel
```

## 🚀 Getting started

**Prerequisites:** Node.js 18.18+ (Node 20/22/24 recommended).

```bash
npm install
cp .env.example .env.local   # optional — sensible defaults are built in
npm run dev                  # http://localhost:3000
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |

## ⚙️ Configuration

All env vars are **optional** — the app runs out of the box. See `.env.example`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (SEO, sitemap) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email shown in UI |
| `ORDER_STORE_DRIVER` | `file` (default) · `memory` · `postgres` |
| `DATABASE_URL` | Connection string when using a DB driver |
| `OPERATOR_API_KEY` | Shared secret for the operator API + worker |
| `OFFICIAL_PORTAL_URL` | Official NIA Arrival Card URL the worker opens |
| `WORKER_HEADLESS` | Run the worker headless (`true`) or headed (`false`) |
| `FILING_SERVICE_URL` | URL of the live CAPTCHA-relay filing service (blank = assisted fallback) |
| `FILING_SERVICE_KEY` | Shared secret between the site and the filing service |

### Order storage

Out of the box, orders are stored on disk (`./.data/orders.json` in dev). On Vercel
the filesystem is **ephemeral**, so for production connect a database (Vercel
Postgres, Neon, Supabase, etc.) and implement the `postgres` driver branch in
`src/lib/store.ts` (the interface is already async and pluggable).

## 🤖 Automation worker — fully automatic filing

The `worker/` folder is a standalone tool (excluded from the web build) that turns each
submitted order into a filed Arrival Card **automatically**:

```
Customer submits YOUR form → order queued → worker pulls it → opens the portal,
fills every field, submits, reads the confirmation number → marks the order
"completed" and pushes the confirmation back (shown on /track).
```

It ships with a bundled **mock NIA portal** so the whole pipeline is a complete,
runnable, testable working model out of the box — the same code targets the real NIA
form by setting `WORKER_PORTAL_MODE=official`.

```bash
cd worker && npm install && npm run install-browser
# (or, if the bundled Chromium download is blocked, drive an installed browser:)
#   export WORKER_BROWSER_CHANNEL=chrome
npm start          # WATCH: auto-process new orders as they arrive (fully automatic)
npm run auto       # process the current queue once, automatically
npm run review     # headed: bot fills, a human verifies & submits
npm run dry-run    # show the field mapping (no browser)
```

It never solves CAPTCHAs or bypasses bot-detection; if the real portal blocks an
automated submit, the order is flagged `action_required` for a human. See
[`worker/README.md`](worker/README.md) for details. For a government site, the
human-in-the-loop `--review` mode is the safest, most compliant choice.

### Live customer-CAPTCHA filing (recommended)

The most compliant "hands-off for you" model: **the customer solves their own
CAPTCHA** during checkout. Run the filing service (`cd worker && npm run serve`) and
set `FILING_SERVICE_URL`. After the customer submits your form, the service opens the
portal, fills every field, and **relays the CAPTCHA image to the customer on your
site**; they type the code, it's submitted, and the official confirmation comes
straight back — shown on their success screen and `/track`. If the service isn't
configured/reachable, the site gracefully falls back to assisted (staff) filing.

Verified end-to-end against the bundled mock: form → live fill (21/21 fields) →
CAPTCHA relayed → wrong code retries → correct code → confirmation synced to the
order. Works on real portals that use a simple image CAPTCHA; reCAPTCHA/behavioral
portals need the customer's-own-browser variant.

## ▲ Deploy to Vercel

1. Push this repo to GitHub (below).
2. In Vercel → **New Project** → import the repo. Framework auto‑detects as **Next.js**.
3. Add env vars from `.env.example` (set a strong `OPERATOR_API_KEY`).
4. Deploy. Add your custom domain `china.ivisaportal.com` in **Project → Domains**.

Or with the CLI:

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

## 🐙 Push to GitHub

```bash
git init && git add -A && git commit -m "Initial commit"   # already done for you
gh repo create china-arrival-card --private --source=. --push
# or, manually:
git remote add origin https://github.com/<you>/china-arrival-card.git
git branch -M main && git push -u origin main
```

## ✅ Before you go live

- [ ] Replace the `[Your Registered Company Name] / [Business Registration No.] /
      [Registered Address]` placeholders in `src/app/legal/terms/page.tsx` with real
      details (also surface them in the footer).
- [ ] Keep the **"not a government website"** banner, hero line, pricing note, and
      footer disclaimer prominent (required for Google Ads "government documents and
      services" policy and consumer‑protection law).
- [ ] Connect a **database** for orders (the file store is ephemeral on Vercel).
- [ ] Wire **payments** (Stripe keys are stubbed in `.env.example`) and connect the
      submit step to checkout.
- [ ] Connect **email/SMS** delivery for confirmations (e.g. Resend, Twilio).
- [ ] Verify the **official NIA portal URL** and refine the worker field mapping
      against the live form.
- [ ] Complete **Google Advertiser Identity Verification** and the Government‑documents
      certification before running ads.

## 📄 Disclaimer

This software is provided as a template for a **lawful, transparent** assistance
service. iVisa Portal is **not** affiliated with the Chinese government or the NIA. The
China Arrival Card is free directly from the NIA. You are responsible for operating any
deployment lawfully and truthfully.
