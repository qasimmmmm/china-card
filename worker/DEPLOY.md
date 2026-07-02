# Deploying the filing service (so your site files the REAL Arrival Card)

Your **website** runs on Vercel. The **filing service** cannot — it drives a real
browser (Playwright/Chromium) with a long-lived session, which Vercel's serverless
functions don't provide. So it runs as a small always-on container elsewhere, and
Vercel talks to it over HTTPS.

```
[ customer fills /apply ] ─> [ your site on Vercel ] ─HTTPS─> [ filing service container ]
   (passport photo, data,                                        └─ drives the real 5-step
    signature, consent)                                             NIA Element-UI wizard
                                                                    → returns the QR receipt
```

**How the real filing works (no CAPTCHA).** The live NIA portal has **no CAPTCHA**
(verified from its JS bundle and a live run). Its only human gate is a **passport-photo
OCR upload** on step 1 and a **declaration + signature** at the end. So the flow is:

1. `/start` — the service opens the portal, uploads the customer's passport photo (OCR),
   and fills all five Element-UI steps from the customer's confirmed data, **stopping
   before Submit**. It returns a screenshot of the completed form.
2. The customer reviews that screenshot on your site and clicks **Confirm & submit** —
   their legal attestation.
3. `/confirm` — the service clicks Submit and returns the **official receipt (QR) +
   confirmation number**, which your site shows and emails.

The driver ([`official-driver.js`](official-driver.js)) locates every field by its
**label**, so it needs **no hand-mapped selectors** — the same code runs against the
bundled mock and the real portal. It **never** clicks the final Submit without the
customer's consent, and never fabricates data.

## 1. Deploy the filing service (pick one)

The repo ships a `Dockerfile` (Chromium is baked in). Keep `WORKER_PORTAL_MODE=mock`
first to prove the flow end-to-end on your live site, then switch to `official`.

### Railway / Render (easiest)
1. New service → **Deploy from repo** → root directory `worker/` (it has the Dockerfile).
2. Set env vars:
   - `FILING_SERVICE_KEY` = a long random string (must match Vercel, below)
   - `WORKER_PORTAL_MODE` = `mock` (later: `official`)
   - `WORKER_HEADLESS` = `true`
3. Deploy. Note the public URL, e.g. `https://china-filing.up.railway.app`.
4. Health check: open `/health` → `{"ok":true,"portalMode":"mock",...}`.

### Fly.io
```bash
cd worker
fly launch --no-deploy            # generates fly.toml; set internal_port = 4100
fly secrets set FILING_SERVICE_KEY=<random> WORKER_PORTAL_MODE=mock WORKER_HEADLESS=true
fly deploy
```

### Any VPS with Docker
```bash
cd worker
docker build -t cac-filing .
docker run -d --restart=always -p 4100:4100 \
  -e FILING_SERVICE_KEY=<random> -e WORKER_PORTAL_MODE=mock -e WORKER_HEADLESS=true \
  --name cac-filing cac-filing
# put it behind HTTPS (Caddy/nginx/Cloudflare Tunnel)
```

## 2. Point Vercel at it

In your Vercel project → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `FILING_SERVICE_URL` | the service's public HTTPS URL (no trailing slash) |
| `FILING_SERVICE_KEY` | the **same** random string you set on the service |
| `ORDER_STORE_DRIVER` | `postgres` (so real confirmations persist, not `/tmp`) |
| `DATABASE_URL` | your Postgres/Neon/Supabase connection string |

Redeploy. Now a customer submission calls the service, the browser fills the portal,
the customer reviews + confirms, and gets their real confirmation. If the service is
down, the site auto-falls back to "our team will file it," so customers are never blocked.

## 3. Switching to the REAL NIA portal

On the **service** set:

| Key | Value |
|-----|-------|
| `WORKER_PORTAL_MODE` | `official` |
| `OFFICIAL_PORTAL_URL` | `https://s.nia.gov.cn/ArrivalCardFillingPC/` |
| `WORKER_HEADLESS` | `true` |

That's it for wiring — no selector mapping needed (the driver is label-anchored). Before
charging real customers, do one supervised run and confirm:

1. **Field coverage.** `/start` returns `missed: []`. If any label drifted, the driver
   reports it in `missed` — adjust the label string in `official-driver.js`.
2. **The 72-hour window.** The portal only accepts a Date of Entry within 3 days of
   arrival; schedule filings for `arrival − 72h` (Asia/Shanghai). Filing too early is
   rejected by the portal, not the driver.
3. **Datacenter-IP / WAF risk.** The portal *may* flag automated traffic from cloud IPs.
   Run one submission at a time, headful-like, ideally from a residential-egress proxy.
   If the portal blocks the run, `/confirm` returns `status:pending` and your operator
   finishes it manually (the site already falls back gracefully).
4. **Compliance.** Confirm filing on a traveler's behalf complies with the portal's terms
   and your local law before charging. The card is free on the official site; your fee is
   for the assisted service — keep that disclosure prominent (it already is on `/apply`).

Never run many bots in parallel against the government site, and never auto-submit
without the customer's consent + signature — that's enforced in `official-driver.js`
(`submit` is only passed after the customer confirms).
