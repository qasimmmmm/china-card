# Processing a real customer

**Operator runbook — filing a China Arrival Card on the official NIA portal**

> Read this end to end once before you touch a real customer. This is the first live filing. Go slow. The whole job is: pre-fill the official form to save typing, then have a human check every character against the source documents and submit. Nothing here is automatic. You are responsible for accuracy.

---

## Verified reality of the live NIA portal (checked 2026-07 — re-verify; it can change)

Static analysis of the official PC portal (`s.nia.gov.cn/ArrivalCardFillingPC`) found:

- **No account/login and no SMS/OTP** required. (An optional login only lets a traveler save a draft.)
- **No CAPTCHA / slider / reCAPTCHA** in the current build. The only human gate at submit is a **consent checkbox** — "I have read and agree to the above statements." So wherever this runbook says "solve the CAPTCHA," for the *current* portal that means **tick the consent box and click submit** as a human. The CAPTCHA steps are kept as a **safety net** in case NIA adds one.
- **A passport data-page image upload** feeds an OCR step that pre-fills name/number/nationality/DOB — all still **manually editable**. Have the passport image ready and verify every OCR'd field against the physical passport.
- **Possible invisible server-side protection** (WAF, IP reputation, a per-request `X-Device-Id` fingerprint). Datacenter IPs and headless automation may be flagged. **Run headed, on a normal residential/office connection, one customer at a time** — never batch or run many in parallel.
- **The submit is a legal declaration the traveler attests to.** Keep the customer in the loop to review and consent — you are re-keying, they are declaring.

Because there is currently no CAPTCHA, the customer-solves-CAPTCHA relay is **optional insurance**, not required. The core model stands: **the bot pre-fills, a human verifies every field, the customer consents, and a human clicks submit.**

---

## What this service actually is (read first)

- The China Arrival Card on the **official NIA portal is free.** The traveler can fill it themselves in a few minutes.
- **NIA has publicly warned against paid "agent" services.** You are selling convenience and hand-holding, not access. Be honest about that in your marketing and to the customer.
- Your tool **pre-fills** the official form. A **human must verify every field, solve the CAPTCHA, and click submit.** There is no headless auto-submit and there must never be one.
- **You cannot guarantee approval or acceptance.** Never promise it. Only the customer's real documents and NIA decide that.
- **Accuracy is the operator's responsibility** the moment you click submit on someone's behalf. A typo in a passport number is your typo.

---

## Pre-flight checklist

Do not start until every box is true.

- [ ] Customer has **paid / agreed** and has seen the disclaimer (card is free on the official site; you charge for assistance; no guarantee of approval).
- [ ] You have the customer's **source documents in hand**: passport photo/scan, flight/ticket confirmation, and their China accommodation address. Verify against these, never against memory or chat.
- [ ] Customer data is in the **Next.js site**, entered through the form — **not** pasted into any chat window, AI assistant, terminal, ticket, email body, or this runbook.
- [ ] You have a **screen-share or phone line to the customer** for the review + CAPTCHA step (or explicit written confirmation they authorize you to review and submit).
- [ ] You have the **real official portal URL** confirmed today (bookmark it from a known-good source; NIA has changed paths before). Set `OFFICIAL_PORTAL_URL` to it.
- [ ] `worker/` env is set: `WORKER_PORTAL_MODE=official` and `OFFICIAL_PORTAL_URL=<the real NIA arrival card URL>`.
- [ ] A **headed browser** works on this machine (you must be able to see and click).
- [ ] You have a way to **capture the confirmation** (screenshot tool + PDF print) and a secure channel to deliver it.
- [ ] You have **time**. Do not rush a live filing between other tasks.

---

## Step 1 — Get the customer's real details into the site

1. Send the customer your Next.js intake form link. Have **them** type their data, or type it yourself **directly from the passport/ticket in front of you** into the form fields.
2. **Never** paste real passport numbers, full names, DOB, or document numbers into a chat, an AI assistant, a support ticket, or any log. The intake form is the only place this data belongs.
3. Enter data exactly as printed on the document:
   - **Name** in the Latin/MRZ spelling from the passport (surname vs given-name split matters — copy the passport's split, not what "looks right").
   - **Passport number** character by character (watch 0/O, 1/I, 5/S).
   - **Nationality / country code**, **sex**, **date of birth**, **passport expiry** — from the passport data page.
   - **Flight number, arrival date, port of entry**, and **address in China** — from the ticket and booking.
4. Save the record. Note the record ID the site assigns; you'll use that to load it into the worker.
5. Do a **first read-through inside the site** and correct obvious entry mistakes before you ever open the portal.

---

## Step 2 — Calibrate field selectors against the live form (first time only)

The live NIA form's field names/IDs may differ from what the worker was built against. Do this once, before the first real run, ideally with **dummy/test data** — not the customer's data.

1. Open the **real** portal manually in a normal browser: navigate to `OFFICIAL_PORTAL_URL`.
2. For each form field, inspect the actual selector (right-click → Inspect; note the `id`, `name`, or a stable attribute). Write down the current mapping:
   - portal field label → real selector → worker field name.
3. Update the worker's selector map/config to match what you saw. Save it.
4. Re-run the review flow (Step 3) against the **live form with dummy data** and confirm every field lands in the right box and nothing overflows or gets truncated. **Do not submit the dummy run** — close it before CAPTCHA/submit.
5. Only once the dummy run pre-fills cleanly do you proceed to a real customer.

> Selectors drift. If a filing "looks weird" weeks later (fields blank or shifted), your first suspicion is that the portal changed and selectors need re-calibrating — repeat this step.

---

## Step 3 — Run headed review mode against the real NIA URL

1. Confirm env one more time: `WORKER_PORTAL_MODE=official`, `OFFICIAL_PORTAL_URL` = the real URL.
2. From `worker/`, run the human-in-the-loop review flow with the customer's record loaded:

   ```
   npm run review
   ```

   This opens a **headed** browser, navigates to the official portal, and pre-fills the fields from the saved record. It stops and waits for you — it does **not** submit.
3. Watch it fill. If it errors, hangs, or a field is obviously in the wrong box, **stop** and go to Step 8 (mapping issues).
4. Leave this browser window open and in front of you (and shared with the customer) for verification.

> If you're relaying the CAPTCHA to a remote customer, use the live relay service instead/in addition:
>
> ```
> npm run serve
> ```
>
> This exposes the CAPTCHA/relay so the customer can solve it on their side while you drive the form. Same rule: a human still verifies every field and a human still clicks submit.

---

## Step 4 — Verify every field against the passport and ticket

This is the step that matters. Do it with the **actual documents**, not the intake data (the intake could contain a typo you're about to catch).

Go field by field on the live form and compare to the source:

- [ ] **Surname** — matches passport exactly (spelling, spacing, hyphens).
- [ ] **Given name(s)** — matches passport exactly.
- [ ] **Passport number** — every character, read aloud with the customer if possible.
- [ ] **Nationality / issuing country** — matches passport.
- [ ] **Sex** — matches passport.
- [ ] **Date of birth** — correct value **and correct date format** (watch DD/MM vs MM/DD on the portal).
- [ ] **Passport expiry / issue date** — matches passport, correct format.
- [ ] **Flight / vessel number** — matches ticket.
- [ ] **Date of arrival** — matches ticket; correct format; not a past date.
- [ ] **Port of entry** — matches ticket.
- [ ] **Purpose of visit** — matches what the customer stated.
- [ ] **Address / accommodation in China** — matches booking.
- [ ] **Any contact fields** — correct and reachable.

If **anything** is wrong: fix it in the field directly if the portal allows, but also **correct it in the Next.js record** so your source of truth stays accurate. If a value is ambiguous, ask the customer — do not guess.

Do not proceed until every box is checked against a physical/scanned document.

---

## Step 5 — Solve the CAPTCHA

- The CAPTCHA must be solved by a **real human** in real time — you or the customer. Never attempt to bypass, automate, or farm out CAPTCHA solving; that can violate the portal's terms and undermines the whole "human verifies" premise.
- **Standard image/text CAPTCHA:** solve it in the headed browser (or have the customer solve it via the `npm run serve` relay).
- **If it's reCAPTCHA ("I'm not a robot" / image challenges):** see Step 8 — you generally should not relay these; have the customer complete it on their own device, or complete the whole submit step on a screen-share with them present.
- Solve the CAPTCHA **immediately before** submitting; they expire.

---

## Step 6 — Submit and capture the confirmation

1. With every field verified and the CAPTCHA solved, **a human clicks submit.** If the customer is present, ideally they click it, or they verbally authorize you to click while watching.
2. Wait for the portal's **real confirmation page** — the arrival card confirmation, reference number, and/or **QR code**.
3. Capture it **immediately and redundantly**:
   - Full-page **screenshot**.
   - **Print to PDF** of the confirmation page.
   - Copy any **reference/confirmation number** into the customer's record (this number is fine to store as it's the card reference, not raw passport data — follow your data policy).
4. If submit fails or errors: read the portal's error, fix the flagged field, re-verify it against the document, re-solve the CAPTCHA, and resubmit. Do not resubmit blindly.

> Do not close the browser until you have confirmed the capture is saved and readable.

---

## Step 7 — Deliver to the customer

1. Send the customer the **confirmation and QR code** (PDF + image) over your secure delivery channel — the same channel you use for their documents, not an open chat.
2. Include, in plain language:
   - Their **arrival card reference number**.
   - **What to present at the border** (the QR / confirmation) and to **keep it accessible on arrival**.
   - The reminder that **you filed the free official card on their behalf** and that **acceptance is decided by NIA/border control, not by you** — you can't guarantee entry.
3. Log internally: record ID, timestamp, who solved the CAPTCHA, who clicked submit, and where the confirmation is stored. Keep raw passport data only as long as your policy allows, then purge it.

---

## Step 8 — When a field won't map, or the CAPTCHA is reCAPTCHA

**A field doesn't pre-fill or lands in the wrong box:**
1. Stop. Do not submit.
2. Fill that one field **manually** in the live form, verified against the document — a manual fill is always acceptable; the tool is only a convenience.
3. Note which field failed. After the customer is done, **re-run Step 2 calibration** to fix the selector so it doesn't happen again.
4. If many fields are wrong, the portal has likely changed — do the whole filing manually for this customer and re-calibrate before the next one.

**A value doesn't map to any portal option** (e.g., a nationality, port, or purpose not in the dropdown):
- Do not force a "close enough" option. Pick the portal's own correct value if one exists; if genuinely none fits, pause and check the customer's documents and the portal's guidance. Never invent data to make a field submit.

**The CAPTCHA is reCAPTCHA (checkbox or image challenge):**
- Do **not** try to relay or automate it. reCAPTCHA is designed to detect exactly that and it may flag the session.
- Preferred: put the customer in front of the challenge — either they complete the whole submit on a screen-share while you talk them through the verified fields, or they finish it on their own device.
- If reCAPTCHA consistently blocks the automated pre-fill session, treat this filing as **manual**: open the portal normally, use your verified data as a checklist, and have the customer/you fill and submit by hand. The value you provided is still the careful verification.

---

## Hard rules (never break these)

- Never auto-submit. A human verifies and a human clicks submit — every time.
- Never paste real passport data into a chat, AI, ticket, or log.
- Never guess a field value. Verify against the document or ask the customer.
- Never bypass or automate a CAPTCHA/reCAPTCHA.
- Never promise approval or entry.
- Always keep the disclaimer visible: the card is free on the official NIA portal; you charge for assistance; NIA warns against paid services; accuracy is your responsibility.

---

## Quick command reference

| Purpose | Command (from `worker/`) |
|---|---|
| Headed review — pre-fill, human verifies & submits | `npm run review` |
| Live CAPTCHA-relay service (customer solves remotely) | `npm run serve` |
| Required env | `WORKER_PORTAL_MODE=official`, `OFFICIAL_PORTAL_URL=<real NIA URL>` |
