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
 * portal — that turns this best-effort mapper into a precise one.
 */

export function mapApplication(order) {
  const a = order.application || {}
  const purpose = a.purpose === 'Other' && a.purposeOther ? a.purposeOther : a.purpose

  /** @type {{key:string,label:string,value:any,type:string,hints:string[]}[]} */
  const fields = [
    { key: 'surname', label: 'Surname', value: a.surname, type: 'text', hints: ['surname', 'last name', 'family name', '姓'] },
    { key: 'givenNames', label: 'Given names', value: a.givenNames, type: 'text', hints: ['given name', 'first name', '名'] },
    { key: 'sex', label: 'Sex', value: a.sex, type: 'select', hints: ['sex', 'gender', '性别'] },
    { key: 'dob', label: 'Date of birth', value: a.dob, type: 'date', hints: ['birth', 'date of birth', '出生'] },
    { key: 'nationality', label: 'Nationality', value: a.nationality, type: 'select', hints: ['nationality', 'citizenship', '国籍'] },
    { key: 'countryOfBirth', label: 'Country of birth', value: a.countryOfBirth, type: 'select', hints: ['country of birth', 'place of birth', '出生国'] },
    { key: 'docType', label: 'Document type', value: a.docType, type: 'select', hints: ['document type', 'passport type', '证件类型'] },
    { key: 'passportNumber', label: 'Passport number', value: a.passportNumber, type: 'text', hints: ['passport no', 'document number', 'passport number', '证件号'] },
    { key: 'passportExpiry', label: 'Passport expiry', value: a.passportExpiry, type: 'date', hints: ['expiry', 'expiration', 'valid until', '有效期'] },
    { key: 'passportIssueCountry', label: 'Issuing country', value: a.passportIssueCountry, type: 'select', hints: ['issuing', 'issue country', '签发'] },
    { key: 'visaNumber', label: 'Visa number', value: a.visaNumber, type: 'text', hints: ['visa no', 'visa number', '签证号'] },
    { key: 'transportMode', label: 'Transport mode', value: a.transportMode, type: 'select', hints: ['transport', 'mode of', '交通'] },
    { key: 'carrierNumber', label: 'Flight/train/vessel number', value: a.carrierNumber, type: 'text', hints: ['flight', 'vessel', 'train no', 'carrier', '航班'] },
    { key: 'arrivalDate', label: 'Arrival date', value: a.arrivalDate, type: 'date', hints: ['arrival', 'date of entry', '入境日期'] },
    { key: 'entryPort', label: 'Port of entry', value: a.entryPort, type: 'text', hints: ['port of entry', 'port', '口岸'] },
    { key: 'entryCity', label: 'City of entry', value: a.entryCity, type: 'select', hints: ['city of entry', 'entry city', '入境城市'] },
    { key: 'purpose', label: 'Purpose of visit', value: purpose, type: 'select', hints: ['purpose', 'reason', '目的'] },
    { key: 'destinationCity', label: 'Destination city', value: a.destinationCity, type: 'select', hints: ['destination', 'intended', '目的地'] },
    { key: 'addressInChina', label: 'Address in China', value: a.addressInChina, type: 'text', hints: ['address', 'accommodation', 'hotel', '住址', '地址'] },
    { key: 'phone', label: 'Phone', value: a.phone, type: 'text', hints: ['phone', 'mobile', 'tel', '电话'] },
    { key: 'email', label: 'Email', value: a.email, type: 'text', hints: ['email', 'e-mail', '邮箱'] },
    { key: 'inviterName', label: 'Inviting party', value: a.inviterName, type: 'text', hints: ['inviting', 'inviter', '邀请'] },
    { key: 'departureDetails', label: 'Departure details', value: a.departureDetails, type: 'text', hints: ['departure', 'onward', '离境'] },
  ]

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
