# Official CDAC portal — flow & automation notes

> **Source & status.** This document is derived from **static analysis of the official
> NIA portal's own JavaScript bundle** (`s.nia.gov.cn/ArrivalCardFillingPC/js/app.*.js`)
> and corroborating 2025–2026 embassy/traveler sources, captured during this build.
> It was **not** produced by a live headed Playwright walkthrough (that must be run by
> the operator from a machine that can reach the portal — see “Live verification pass”
> at the end). Treat selectors as a **starting map to confirm against the live DOM**,
> not final. Field labels, option lists, value codes, and the no‑login/no‑CAPTCHA
> findings below are high‑confidence (read straight from the bundle).

- **Product:** China Digital Arrival Card (CDAC), launched 20 Nov 2025 by the NIA.
- **URLs:** desktop `https://s.nia.gov.cn/ArrivalCardFillingPC/` · mobile `https://s.nia.gov.cn/ArrivalCardFillingPhone`. Automate the **PC** URL.
- **72‑hour rule:** the card can only be filed within **72 h (3 days) before arrival**. The date-of-entry picker disables dates before "yesterday"; submitting outside the window is rejected. Our scheduler must hold orders until `arrival − 72h` (Asia/Shanghai).

## Access / security (high confidence — from the bundle)

- **No account or login required.** Registration/login exists but is *optional* (only to save a draft). The submit call carries **no auth token / cookie gating**.
- **No SMS/OTP** verification of the phone number anywhere in the code.
- **No CAPTCHA / slider / reCAPTCHA / hCaptcha / geetest** in the current build (0 hits across the SPA and vendor libs). The only human gate at submit is a **declaration consent + signature**.
- The only anti‑abuse signal is a **client‑generated `X-Device-Id` fingerprint header** on requests (not a server challenge). Datacenter IPs / headless fingerprints *may* be flagged by an undocumented WAF — behave like one careful human, residential‑style IP, one submission at a time. **This is the main automation risk and can only be confirmed with a real run.**

## Screen flow (in order)

1. **Notice / eligibility** — read + accept the notice (`queryRjkRules`). Exempt categories are described here; we screen for these **before payment** (see field-mapping → exemptions).
2. **Entry transportation mode** — selecting it drives which Port/City lists load.
3. **Passport OCR upload (optional)** — upload the passport data‑page image → `POST /ocr/doOcr/v1` pre‑fills last name / first name / passport number / nationality / DOB / sex. **All fields stay editable.** Policy: our worker uploads the image for convenience but then **overwrites every field from our DB (the customer's confirmed Review data is source of truth)**.
4. **Personal & passport info** — see field list below.
5. **Trip / itinerary (travel‑in)** — date of entry, port/city of entry, arrival carrier no., purpose, destination cities, address in China.
6. **Travel‑out (optional)** — confirmed departure itinerary (date, port/city, carrier).
7. **Visa / entry policy** — hold‑visa Y/N, entry policy (computed server‑side via `getAllowRules`), visa type/number.
8. **Contact & invitation** — phone area code + contact number, contact number in China, email; inviting entity/inviter fields when applicable.
9. **Declaration + signature** — tick "I have read and agree to the above statements" and provide a **signature** (see below).
10. **Submit** — `POST /foreigner/entryCountry/save/v1` (form‑data only; no captcha/OTP/auth token). Success page renders the **Entry Declaration Receipt with a QR code** and offers **"Download to Local"** (`/receiptDownloadLocal/v1`) and **"Send to Email"** (`/receiptSendEmail/v1`). **The downloaded receipt is our deliverable.**

## Fields (label · type · required · i18n key)

| Group | Label | Type | Req | i18n key |
|---|---|---|---|---|
| Passport | Passport data page photo (OCR) | file | optional | — |
| Passport | Type of ID Document | select | ✔ | — |
| Passport | Passport Number | text (UPPERCASE) | ✔ | — |
| Passport | Last Name | text | ✔ | ywx |
| Passport | First Name | text | optional* | ywm |
| Passport | Other Name | text | optional | qtxm |
| Passport | Chinese Name | text | optional | zwxm |
| Passport | Gender | radio | ✔ | — |
| Passport | Date of Birth | date (YYYY‑MM‑DD) | ✔ | — |
| Passport | Country/Region of Citizenship | select | ✔ | nation |
| Passport | Country/Region of Birth | select | optional | csd |
| Passport | City of Birth | text | optional | csdcs |
| Passport | Passport ever lost/stolen | radio (Yes/No) | optional | zjsfcysbd |
| Entry | Entry Transportation Mode | select | ✔ | rjjtfsdm |
| Entry | Date of Entry | date | ✔ | rjrq |
| Entry | City of Entry | select (dynamic) | ✔ | rjcsdm |
| Entry | Port/Channel of Entry | select (dynamic) | ✔ | rjkadm2 |
| Entry | Arrival Flight/Train/Vessel Number | text (UPPERCASE) | ✔ if Flight | rjjtbc |
| Entry | Purpose of Entry | select | ✔ | rjsydm |
| Entry | Destination Cities in China | multiselect | ✔ | mdcsdm |
| Entry | Cities of Transit in China | multiselect | optional | jtcs |
| Entry | Been to other countries/regions in past 2 years? | radio | optional | cqwgjdqdm |
| Entry | Address in China (district select + street) | select + text | ✔ | zhzzxzqhdm + zhxxzz |
| Visa | Hold a valid visa/permit? | radio | ✔ | sfmq |
| Visa | Entry Policy Selection | select (server rules) | ✔ | rjzcxz |
| Visa | Visa Type | select | cond. | qzzldm |
| Visa | Visa Number | text | cond. | qzhm |
| Departure | Confirmed Departure Itinerary | radio | optional | isChuJingInfo |
| Departure | Date of Departure | date | cond. | jhcjrq |
| Departure | City of Departure | select | cond. | jhcjcsdm |
| Departure | Port/Channel of Departure | select | cond. | jhcjkamc2 |
| Departure | Departure Transportation Mode | select | cond. | jhcjjtfsdm |
| Departure | Departure Flight/Train/Vessel Number | text | cond. | jhcjjtbc |
| Contact | Phone Area Code | select | optional | areaCode2 |
| Contact | Contact Number | text | optional | jwdhNo |
| Contact | Contact Number in China | text | optional | jndh |
| Contact | Email | text | optional | — |
| Invitation | Have an inviting entity/inviter? | radio | optional | — |
| Invitation | Entity Name / Inviter's Name | text | cond. | zfyqdw |
| Invitation | Entity/Inviter Contact | text | cond. | zfyqlxdh1/2 |
| Declaration | Read & agree + **signature** | consent + signature | ✔ | — |

\* First Name is optional in the bundle to allow single‑name passports; we still collect it.

## Dropdown option lists + submit value codes

- **ID Document Type:** Diplomatic Passport `11`, Service Passport `12`, Passport for Public Affairs `13`, **Ordinary Passport `14`** (default), Seaman's Book `17`.
- **Transportation Mode:** Vessel `1`, **Flight `2`** (default), Train `3`, Automobile `4`, On Foot `5`, Automobile and On Foot `9`.
- **Gender:** Male `1`, Female `2`.
- **Yes/No radios:** Yes `1`, No `0`.
- **Purpose of Entry** (dict `type=9903`): Conference/Business, Visit, Sightseeing/Leisure, Visiting Friends/Relatives, Work, Study, Permanent Residence, Return to Country of Residence, Service (Employee), Other.
- **Nationality:** `nationalityDictWithoutChn` (full ISO country/region list, **China removed**). Country of Birth uses the full dict (China included).
- **Ports / Cities of Entry:** loaded dynamically via `getKA {cityCode, type=mode}` after City of Entry + Transport Mode are chosen — you must select City of Entry first, then the Port list populates. Major airports include PEK/PKX/PVG/SHA/CAN/SZX/TFU/CKG/HGH/XIY/KMG/XMN/… (full list is the standard port enumeration).

**Selector strategy (recommended order):** (1) accessible label / `getByLabel`; (2) the i18n key as a stable hook if it appears in `name`/`id`/`data-*`; (3) role + nearby text; (4) value **codes** above for `<select>` (`selectOption({value:'14'})` is more stable than option text). Avoid hashed CSS classes. Dynamic (City→Port) selects require waiting for the dependent list to populate before selecting.

## Formats & validation rules

- **Names/passport number:** stored/submitted **UPPERCASE**, Latin/MRZ spelling from the passport; keep the exact surname vs given‑name split shown on the passport. Passport number force‑uppercased in the bundle.
- **Dates:** `YYYY-MM-DD` in the UI; dashes stripped on submit. Date of Entry gated to the 72 h window.
- **Carrier number:** UPPERCASE, byte‑limit ~100; required only when transport = Flight.
- **Transliteration:** none performed by the portal — the customer's confirmed values are submitted verbatim, so any uppercasing/normalization we do must be shown on our Review step (see field‑mapping).

## Signature step

The declaration step requires a signature (consent + on‑screen signature). The exact
mechanism (HTML `<canvas>` vs image upload vs typed) needs **live confirmation**. Plan:
capture the customer's signature as a PNG on `/apply` (signature pad), and in the worker
reproduce it via `page.evaluate` drawing onto the signature canvas, **or** upload the PNG
if the step is an upload. Recon must record which.

## Live verification pass (operator TODO before first real submission)

Run `worker/recon.py` (Phase‑0 script, provided) **headed** against the PC URL with
throwaway data, walking every screen but **stopping before the final confirm**. Confirm/adjust:
selectors per field, the City→Port dynamic loading, the signature mechanism, whether any
WAF/slider/verification appears under automation, and the exact "Download to Local" file
type (PDF vs image). Update this doc + `field-mapping.md` + the worker selector map.
