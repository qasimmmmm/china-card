/**
 * Maps a customer's submitted application (our field ids) onto the official
 * NIA Arrival Card form.
 *
 * The official portal is a Chinese-language single-page app, so exact field
 * selectors are not published and can change. We therefore describe each value
 * with a set of LABEL HINTS (substrings that are likely to appear near the
 * field, in English or pinyin). The fill engine (fill.js) locates inputs by
 * these hints and fills them. After each run a human operator verifies every
 * field, handles any CAPTCHA, and performs the final submission.
 *
 * Refine `hints` with the real labels/selectors once you've inspected the live
 * portal — that turns this best-effort mapper into a precise one. In official
 * mode you can do this without editing code via worker/selectors.official.json
 * (see selectors.official.example.json).
 */
import { config } from './config.js'

export function mapApplication(order) {
  const a = order.application || {}
  const purpose = a.purpose === 'Other' && a.purposeOther ? a.purposeOther : a.purpose

  // Default hints include the REAL NIA PC-portal English labels (verified from the
  // portal's JS bundle) so official mode fills better out of the box.
  /** @type {{key:string,label:string,value:any,type:string,hints:string[],selector?:string}[]} */
  const fields = [
    { key: 'surname', label: 'Surname', value: a.surname, type: 'text', hints: ['last name', 'surname', 'family name', '姓'] },
    { key: 'givenNames', label: 'Given names', value: a.givenNames, type: 'text', hints: ['first name', 'given name', '名'] },
    { key: 'sex', label: 'Sex', value: a.sex, type: 'select', hints: ['gender', 'sex', '性别'] },
    { key: 'dob', label: 'Date of birth', value: a.dob, type: 'date', hints: ['date of birth', 'birth', '出生'] },
    { key: 'nationality', label: 'Nationality', value: a.nationality, type: 'select', hints: ['nationality', 'citizenship', '国籍'] },
    { key: 'countryOfBirth', label: 'Country of birth', value: a.countryOfBirth, type: 'select', hints: ['country/region of birth', 'country of birth', 'place of birth', '出生国'] },
    { key: 'docType', label: 'Document type', value: a.docType, type: 'select', hints: ['passport type', 'document type', '证件类型'] },
    { key: 'passportNumber', label: 'Passport number', value: a.passportNumber, type: 'text', hints: ['passport number', 'passport no', 'document number', '证件号'] },
    { key: 'passportExpiry', label: 'Passport expiry', value: a.passportExpiry, type: 'date', hints: ['expiry', 'expiration', 'valid until', '有效期'] },
    { key: 'passportIssueCountry', label: 'Issuing country', value: a.passportIssueCountry, type: 'select', hints: ['issuing', 'issue country', '签发'] },
    { key: 'visaNumber', label: 'Visa number', value: a.visaNumber, type: 'text', hints: ['visa no', 'visa number', '签证号'] },
    { key: 'transportMode', label: 'Transport mode', value: a.transportMode, type: 'select', hints: ['entry transportation mode', 'transportation mode', 'transport', '交通'] },
    { key: 'carrierNumber', label: 'Flight/train/vessel number', value: a.carrierNumber, type: 'text', hints: ['arrival flight', 'flight/train/vessel', 'vessel number', 'flight', 'carrier', '航班'] },
    { key: 'arrivalDate', label: 'Arrival date', value: a.arrivalDate, type: 'date', hints: ['date of entry', 'arrival', '入境日期'] },
    { key: 'entryPort', label: 'Port of entry', value: a.entryPort, type: 'text', hints: ['port/channel of entry', 'port of entry', 'port', '口岸'] },
    { key: 'entryCity', label: 'City of entry', value: a.entryCity, type: 'select', hints: ['city of entry', 'entry city', '入境城市'] },
    { key: 'purpose', label: 'Purpose of visit', value: purpose, type: 'select', hints: ['purpose of entry', 'purpose', 'reason', '目的'] },
    { key: 'destinationCity', label: 'Destination city', value: a.destinationCity, type: 'select', hints: ['destination cities', 'destination', 'intended', '目的地'] },
    { key: 'addressInChina', label: 'Address in China', value: a.addressInChina, type: 'text', hints: ['address in china', 'address', 'accommodation', 'hotel', '住址', '地址'] },
    { key: 'phone', label: 'Phone', value: a.phone, type: 'text', hints: ['contact number', 'phone', 'mobile', 'tel', '电话'] },
    { key: 'email', label: 'Email', value: a.email, type: 'text', hints: ['email', 'e-mail', '邮箱'] },
    { key: 'inviterName', label: 'Inviting party', value: a.inviterName, type: 'text', hints: ['entity name', 'inviting', 'inviter', '邀请'] },
    { key: 'departureDetails', label: 'Departure details', value: a.departureDetails, type: 'text', hints: ['departure flight', 'date of departure', 'departure', 'onward', '离境'] },
  ]

  // Official-mode operators can override selectors/hints/type per field without
  // editing code (worker/selectors.official.json). Precedence: explicit CSS
  // selector wins in fill.js; hints are the fallback.
  const ov = config.fieldOverrides || {}
  for (const f of fields) {
    const o = ov[f.key]
    if (!o) continue
    if (o.selector) f.selector = o.selector
    if (Array.isArray(o.hints) && o.hints.length) f.hints = o.hints
    if (o.type) f.type = o.type
  }

  // Only attempt fields that actually have a value.
  return fields.filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== '')
}

/** A compact, human-readable summary for the operator console. */
export function summarize(order) {
  const a = order.application || {}
  return [
    `Reference : ${order.reference}`,
    `Plan      : ${order.plan} ($${order.amount})`,
    `Traveler  : ${a.givenNames || ''} ${a.surname || ''}`.trim(),
    `Passport  : ${a.passportNumber || '—'} (${a.nationality || '—'})`,
    `Arrival   : ${a.arrivalDate || '—'} via ${a.carrierNumber || '—'} → ${a.entryPort || a.entryCity || '—'}`,
    `Purpose   : ${a.purpose || '—'}`,
    `Stay at   : ${a.addressInChina || '—'}`,
  ].join('\n')
}
