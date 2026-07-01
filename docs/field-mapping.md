# Field mapping — our `/apply` → official CDAC form

Our form values are the **source of truth**. Any transformation below (uppercasing,
value‑code, name→code) must be applied by the worker **and previewed to the customer on
the Review step** so what they confirm is what gets submitted.

## Direct mappings

| Our field (`formSchema.ts`) | Official field (i18n) | Transformation |
|---|---|---|
| `passportFile` | Passport OCR upload | upload for OCR, then overwrite all fields from DB |
| `docType` | Type of ID Document | text → **value code** (Ordinary Passport→`14`, Diplomatic→`11`, Service→`12`, Public Affairs→`13`, Seaman's Book→`17`) |
| `passportNumber` | Passport Number | **UPPERCASE** |
| `surname` | Last Name (ywx) | **UPPERCASE** |
| `givenNames` | First Name (ywm) | **UPPERCASE** |
| `otherName` | Other Name (qtxm) | UPPERCASE |
| `chineseName` | Chinese Name (zwxm) | as‑is |
| `sex` | Gender | Male→`1`, Female→`2` |
| `dob` | Date of Birth | `YYYY-MM-DD` |
| `nationality` | Country/Region of Citizenship (nation) | name → official dict code; **exclude China** (foreign nationals only) |
| `countryOfBirth` | Country/Region of Birth (csd) | name → dict code |
| `cityOfBirth` | City of Birth (csdcs) | as‑is |
| `passportLostStolen` | Passport lost/stolen (zjsfcysbd) | Yes→`1`, No→`0` |
| `transportMode` | Entry Transportation Mode (rjjtfsdm) | Flight→`2`, Train→`3`, Automobile→`4`, Vessel→`1`, On Foot→`5`, Automobile and On Foot→`9` |
| `carrierNumber` | Arrival Flight/Train/Vessel No (rjjtbc) | UPPERCASE |
| `arrivalDate` | Date of Entry (rjrq) | `YYYY-MM-DD`, must be within 72 h window |
| `entryCity` | City of Entry (rjcsdm) | name → city code; **select before port** |
| `entryPort` | Port/Channel of Entry (rjkadm2) | strip our `"(PVG)"` IATA suffix → match official port name; wait for dynamic list |
| `purpose` / `purposeOther` | Purpose of Entry (rjsydm) | labels already match 1:1 ✓ (Other → free text) |
| `destinationCity` (+`additionalCities`) | Destination Cities (mdcsdm, **multi**) | split our single + comma list → multiselect |
| `addressInChina` | Address (zhzzxzqhdm district + zhxxzz street) | split district vs street if the live form requires two inputs |
| `beenToOtherCountries` (+`otherCountries`) | Been to other countries 2y (cqwgjdqdm) | Yes→`1`/No→`0`; free‑text follow‑up |
| `hasVisa` | Hold valid visa? (sfmq) | Yes→`1`, No→`0` |
| `entryBasis` | ~ Entry Policy (rjzcxz) | **server‑computed** on the portal (getAllowRules) — worker picks the matching option; if ambiguous → `needs_review` |
| `visaType` | Visa Type (qzzldm) | map to their visa‑type dict |
| `visaNumber` | Visa Number (qzhm) | UPPERCASE |
| `departurePlanned` | Confirmed Departure (isChuJingInfo) | Yes→`1`/No→`0` |
| `departureDate` | Date of Departure (jhcjrq) | `YYYY-MM-DD` |
| `departureTransportMode` | Departure Transport (jhcjjtfsdm) | same codes as entry |
| `departureCarrierNumber` | Departure Carrier No (jhcjjtbc) | UPPERCASE |
| `phoneAreaCode` | Phone Area Code (areaCode2) | our `"+44 (United Kingdom)"` → dialing code `44` |
| `phone` | Contact Number (jwdhNo) | digits only |
| `email` | Email | as‑is |
| `inviterPresent` | Have inviter? | Yes→`1`/No→`0` |
| `inviterName` | Entity Name / Inviter's Name (zfyqdw) | as‑is |
| `inviterContact` | Entity/Inviter Contact (zfyqlxdh1/2) | as‑is |

## Fields our form collects but the official form does NOT submit

- `passportExpiry` — not a CDAC field; keep for our records/expiry checks only, do **not** submit.
- Step 5 **Customs & health** (`symptoms`, `infectiousContact`, `carryingCurrency`, `carryingGoods`, `declaredItems`) — **separate China Customs system, OUT OF SCOPE**. Store for support; never submit to the CDAC portal.

## Official fields we do NOT yet collect (decide per below)

- `contactNumberInChina` (jndh) — recommended add (optional on portal).
- `transitCities` (jtcs, multi) — optional; add only if you want to support transit routing.
- `departureCity` / `departurePort` (jhcjcsdm / jhcjkamc2) — we collect departure date/mode/carrier but not city/port. Add two selects to step 4 **or** let the worker leave them blank (they're optional).
- `entryPolicy` (rjzcxz) — server‑computed; not a free input. Worker selects the matching policy; can't be pre‑filled from our form.

## Required `/apply` changes (Phase 1 depends on these — these are the "gaps")

1. **Signature pad** (step 4 or a new step 5.5) → save PNG to `signatures/`. The official declaration step needs a signature; without it the bot cannot complete.
2. **Authorization checkbox** on Review: *"I authorize iVisa Portal to complete, sign, and submit my China Arrival Card on my behalf using the information and signature I provide."* Block payment until checked; store consent timestamp.
3. **72‑hour copy** by the arrival‑date field: *"The official system only issues cards within 72 hours of arrival — we submit the moment your window opens and email your card immediately."*
4. **Exemption warning** after step 3: if answers match an exempt category (permanent‑resident‑ID holder, HK/Macao permit holder, group‑visa tourist, <24 h airside transit, same‑cruise round trip, e‑channel user, transport crew) → modal warning they may not need the paid service.
5. **Split/normalize** at Review so the customer sees the exact submitted values: UPPERCASE names/passport/carrier, dialing code parsed from area‑code, dates as `YYYY-MM-DD`, destination cities as a list.
6. (Optional) add `contactNumberInChina`; consider making `destinationCity` a true multiselect to match `mdcsdm`.

## Exemption detection logic (pre‑payment)

Flag as potentially exempt (show warning, allow proceed) when the form indicates any of:
permanent‑resident ID · Mainland Travel Permit (non‑Chinese) · group visa / group visa‑free ·
direct transit < 24 h staying airside · same‑cruise round trip · e‑channel user · cross‑border
transport crew. These aren't all captured by the current form — add a short "Do any of these
apply to you?" checklist in step 3 to drive the warning.
