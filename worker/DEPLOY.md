# Deploying the filing service (so the CAPTCHA shows on your live site)

Your **website** runs on Vercel. The **filing service** cannot — it needs a real
browser and a long-lived session, which Vercel's serverless functions don't provide.
So it runs as a small always-on container elsewhere, and Vercel talks to it.

```
[ customer ] ──> [ your site on Vercel ] ──HTTPS──> [ filing service container ]
                                                        └─ drives a real browser
                                                           → relays the CAPTCHA back
```

## 1. Deploy the filing service (pick one)

The repo ships a `Dockerfile` (Chromium is baked in). Point `WORKER_PORTAL_MODE=mock`
first to prove the flow end-to-end on your live site, then switch to `official`.

### Railway / Render (easiest)
1. New service → **Deploy from repo** → root directory `worker/` (it has the Dockerfile).
2. Set env vars:
   - `FILING_SERVICE_KEY` = a long random string (must match Vercel, below)
   - `WORKER_PORTAL_MODE` = `mock` (later: `official`)
   - `OFFICIAL_PORTAL_URL` = the real NIA URL (only for `official`)
3. Deploy. Note the public URL, e.g. `https://china-filing.up.railway.app`.
4. Health check: open `/health` → `{"ok":true,...}`.

### Fly.io
```bash
cd worker
fly launch --no-deploy            # generates fly.toml; set internal_port = 4100
fly secrets set FILING_SERVICE_KEY=<random> WORKER_PORTAL_MODE=mock
fly deploy
```

### Any VPS with Docker
```bash
cd worker
docker build -t cac-filing .
docker run -d --restart=always -p 4100:4100 \
  -e FILING_SERVICE_KEY=<random> -e WORKER_PORTAL_MODE=mock \
  --name cac-filing cac-filing
# put it behind HTTPS (Caddy/nginx/Cloudflare Tunnel)
```

## 2. Point Vercel at it

In your Vercel project → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `FILING_SERVICE_URL` | the service's public HTTPS URL (no trailing slash) |
| `FILING_SERVICE_KEY` | the **same** random string you set on the service |

Redeploy. Now when a customer submits, your site calls the service, the browser
fills the portal, and **the customer sees and solves the CAPTCHA on your site** —
then gets their confirmation. (If the service is down, the site auto-falls back to
"our team will file it," so customers are never blocked.)

## 3. Switching to the REAL NIA portal

Set on the service: `WORKER_PORTAL_MODE=official` and `OFFICIAL_PORTAL_URL=<real NIA url>`.
Then you must, against the live form (which we can't access from here):

1. **Map the fields** — refine the label hints / add precise selectors in `mapping.js`.
2. **Point the CAPTCHA selectors** — set `WORKER_CAPTCHA_IMAGE`, `WORKER_CAPTCHA_INPUT`,
   `WORKER_CAPTCHA_ERROR`, and `WORKER_CONFIRM_SELECTOR` to the real elements.
3. **Confirm the CAPTCHA is a simple image.** If the portal uses reCAPTCHA / hCaptcha /
   a slider / behavioral detection, the image relay will not work — use the
   customer's-own-browser variant instead (see README).
4. **Confirm it complies** with the portal's terms and your local law before charging.

Never set `WORKER_AUTO_SUBMIT` to bypass a human on a CAPTCHA-protected government
site, and never run many bots against it — that's exactly what its protections (and
the law) are there to stop.
