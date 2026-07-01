/**
 * China Digital Arrival Card — application field schema.
 *
 * Field set, order, control types and dropdown options mirror the REAL NIA PC
 * portal (s.nia.gov.cn/ArrivalCardFillingPC), mapped field-by-field from the
 * portal's own JavaScript bundle. This single source of truth drives:
 *   1. the multi-step application UI (src/components/apply/*)
 *   2. validation (src/lib/applicationSchema.ts)
 *   3. the operator automation worker's field mapping (worker/*)
 *
 * NOTE: the last "Customs & health" step is a SEPARATE customs/quarantine
 * declaration — it is NOT part of the NIA Arrival Card — and is optional here.
 */

export type PlanId = 'standard' | 'priority' | 'express'

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'select'
  | 'country'
  | 'radio'
  | 'checkboxes'
  | 'textarea'
  | 'file'
  | 'consent'

export interface FieldDef {
  id: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  hint?: string
  /** Render at half column width on desktop. */
  half?: boolean
  /** Only show (and require) this field when another field's value is in `in`. */
  showIf?: { field: string; in: string[] }
  /** Max length for text/textarea. */
  max?: number
}

export interface StepDef {
  id: string
  title: string
  subtitle?: string
  icon: string
  fields: FieldDef[]
}

// ── Option sets (verbatim from the real NIA portal dictionaries) ─────────────
export const TRANSPORT_MODES = ['Flight', 'Train', 'Automobile', 'Vessel', 'On Foot', 'Automobile and On Foot']

export const PURPOSES = [
  'Conference/Business',
  'Visit',
  'Sightseeing/Leisure',
  'Visiting Friends/Relatives',
  'Work',
  'Study',
  'Permanent Residence',
  'Return to Country of Residence',
  'Service (Employee)',
  'Other',
]

export const DOC_TYPES = [
  'Ordinary Passport',
  'Diplomatic Passport',
  'Service Passport',
  'Passport for Public Affairs',
  "Seaman's Book",
]

export const VISA_TYPES = [
  'Tourism (L)',
  'Business (M)',
  'Visiting relatives (Q1/Q2)',
  'Family reunion / private (S1/S2)',
  'Work (Z)',
  'Study (X1/X2)',
  'Journalist (J1/J2)',
  'Transit (G)',
  'Crew (C)',
  'Talent (R)',
  'Other / Residence permit',
]

export const ENTRY_BASIS = [
  'Visa',
  'Visa-free (240-hour transit)',
  'Visa-free (bilateral / unilateral policy)',
  'Residence permit',
  'Other entry permit',
]

export const YES_NO = ['Yes', 'No']

/** NIA exempt categories — travelers matching these generally don't need the card. */
export const EXEMPT_CATEGORIES = [
  'I hold a PRC Foreign Permanent Resident ID Card',
  'I hold a Mainland Travel Permit for HK/Macao residents (non-Chinese)',
  'I am entering on a group visa / group visa-free tour',
  'I am in direct transit under 24 hours and staying airside',
  'I am on a round-trip on the same cruise ship',
  'I use the e-channel / fast lane',
  'I am crew of a cross-border transport vehicle',
  'None of these apply to me',
]

export const SYMPTOMS = [
  'Fever',
  'Cough',
  'Difficulty breathing',
  'Sore throat',
  'Headache',
  'Fatigue',
  'Nausea / vomiting',
  'Diarrhea',
  'None of the above',
]

export const steps: StepDef[] = [
  {
    id: 'identity',
    title: 'Passport & identity',
    subtitle: 'Enter your details exactly as they appear in your passport.',
    icon: 'book',
    fields: [
      { id: 'passportFile', label: 'Passport data-page photo', type: 'file', required: false, hint: 'Optional but recommended — the official portal reads your passport photo to pre-fill these fields (JPG/PNG/PDF, max 8 MB).' },
      { id: 'docType', label: 'Type of ID document', type: 'select', required: true, options: DOC_TYPES, half: true },
      { id: 'passportNumber', label: 'Passport / document number', type: 'text', required: true, placeholder: 'e.g. E12345678', half: true, max: 24 },
      { id: 'surname', label: 'Last name (surname)', type: 'text', required: true, placeholder: 'As shown in passport', half: true, max: 60 },
      { id: 'givenNames', label: 'First name (given names)', type: 'text', required: true, placeholder: 'As shown in passport', half: true, max: 80 },
      { id: 'otherName', label: 'Other name / alias', type: 'text', required: false, half: true, max: 80, hint: 'Optional — former or alternative name, if any.' },
      { id: 'chineseName', label: 'Chinese name', type: 'text', required: false, half: true, max: 60, hint: 'Optional — for travelers of Chinese origin.' },
      { id: 'sex', label: 'Gender', type: 'radio', required: true, options: ['Male', 'Female'], half: true },
      { id: 'dob', label: 'Date of birth', type: 'date', required: true, half: true },
      { id: 'nationality', label: 'Country / region of citizenship', type: 'country', required: true, half: true },
      { id: 'countryOfBirth', label: 'Country / region of birth', type: 'country', required: false, half: true },
      { id: 'cityOfBirth', label: 'City of birth', type: 'text', required: false, half: true, max: 60 },
      { id: 'passportExpiry', label: 'Passport expiry date', type: 'date', required: true, half: true, hint: 'Should be valid for your whole stay.' },
      { id: 'passportLostStolen', label: 'Has this passport ever been lost or stolen?', type: 'radio', required: false, options: YES_NO, half: true },
    ],
  },
  {
    id: 'trip',
    title: 'Trip & arrival',
    subtitle: 'How and when you’re arriving in mainland China.',
    icon: 'plane',
    fields: [
      { id: 'transportMode', label: 'Entry transportation mode', type: 'select', required: true, options: TRANSPORT_MODES, half: true },
      { id: 'carrierNumber', label: 'Arrival flight / train / vessel number', type: 'text', required: true, placeholder: 'e.g. CA938', half: true, max: 40, hint: 'Required for air arrivals.' },
      { id: 'arrivalDate', label: 'Date of entry', type: 'date', required: true, half: true, hint: 'The card can be filed within 3 days before arrival.' },
      { id: 'entryCity', label: 'City of entry', type: 'select', required: true, options: [], half: true },
      { id: 'entryPort', label: 'Port / channel of entry', type: 'select', required: true, options: [], half: true },
      { id: 'purpose', label: 'Purpose of entry', type: 'select', required: true, options: PURPOSES, half: true },
      { id: 'purposeOther', label: 'Please specify your purpose', type: 'text', required: true, showIf: { field: 'purpose', in: ['Other'] }, half: true, max: 80 },
      { id: 'destinationCity', label: 'Main destination city in China', type: 'select', required: true, options: [], half: true },
      { id: 'additionalCities', label: 'Other destination / transit cities', type: 'text', required: false, half: true, max: 160, hint: 'Optional — separate multiple cities with commas.' },
      { id: 'addressInChina', label: 'Address in China (hotel name & full address, or host address)', type: 'textarea', required: true, placeholder: 'Hotel name, street, district, city', max: 240, hint: 'Address of your first night’s stay. Required by immigration.' },
      { id: 'beenToOtherCountries', label: 'Have you been to other countries/regions in the past 2 years?', type: 'radio', required: true, options: YES_NO, half: true },
      { id: 'otherCountries', label: 'Which countries / regions?', type: 'text', required: true, showIf: { field: 'beenToOtherCountries', in: ['Yes'] }, half: true, max: 160 },
    ],
  },
  {
    id: 'visa',
    title: 'Visa & entry basis',
    subtitle: 'Your basis for entering China.',
    icon: 'clipboard',
    fields: [
      { id: 'hasVisa', label: 'Do you hold a valid Chinese visa or entry permit?', type: 'radio', required: true, options: YES_NO, half: true },
      { id: 'entryBasis', label: 'Basis for entry', type: 'select', required: true, options: ENTRY_BASIS, half: true },
      { id: 'visaType', label: 'Visa type', type: 'select', required: true, options: VISA_TYPES, showIf: { field: 'hasVisa', in: ['Yes'] }, half: true },
      { id: 'visaNumber', label: 'Visa / permit number', type: 'text', required: true, placeholder: 'As shown on your visa', showIf: { field: 'hasVisa', in: ['Yes'] }, half: true, max: 24 },
      { id: 'exemptCheck', label: 'Do any of these apply to you?', type: 'checkboxes', required: false, options: EXEMPT_CATEGORIES, hint: 'These NIA categories usually don’t need an Arrival Card. Most travelers pick “None of these apply to me”.' },
    ],
  },
  {
    id: 'contact',
    title: 'Departure & contact',
    subtitle: 'Your onward plan and how we send your confirmation.',
    icon: 'mail',
    fields: [
      { id: 'departurePlanned', label: 'Do you have a confirmed departure itinerary?', type: 'radio', required: true, options: YES_NO, half: true, hint: 'Required for 240-hour visa-free transit.' },
      { id: 'departureDate', label: 'Date of departure', type: 'date', required: true, showIf: { field: 'departurePlanned', in: ['Yes'] }, half: true },
      { id: 'departureTransportMode', label: 'Departure transportation mode', type: 'select', required: true, options: TRANSPORT_MODES, showIf: { field: 'departurePlanned', in: ['Yes'] }, half: true },
      { id: 'departureCarrierNumber', label: 'Departure flight / train / vessel number', type: 'text', required: false, showIf: { field: 'departurePlanned', in: ['Yes'] }, half: true, max: 40 },
      { id: 'phoneAreaCode', label: 'Phone area code', type: 'select', required: true, options: [], half: true },
      { id: 'phone', label: 'Contact number', type: 'tel', required: true, placeholder: '555 123 4567', half: true },
      { id: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'you@example.com', half: true, hint: 'Your confirmation & QR code are sent here.' },
      { id: 'inviterPresent', label: 'Do you have an inviting person or organisation in China?', type: 'radio', required: true, options: YES_NO, half: true },
      { id: 'inviterName', label: 'Inviting entity / person name', type: 'text', required: true, showIf: { field: 'inviterPresent', in: ['Yes'] }, half: true, max: 120 },
      { id: 'inviterContact', label: 'Inviting party contact info', type: 'text', required: false, showIf: { field: 'inviterPresent', in: ['Yes'] }, half: true, max: 120 },
    ],
  },
  {
    id: 'declaration',
    title: 'Customs & health',
    subtitle: 'A separate customs/quarantine declaration — not part of the Arrival Card. Only declare what genuinely applies; most travelers select “No”.',
    icon: 'clipboard',
    fields: [
      { id: 'symptoms', label: 'Do you currently have any of these symptoms?', type: 'checkboxes', required: false, options: SYMPTOMS, hint: 'Select all that apply (or “None of the above”).' },
      { id: 'infectiousContact', label: 'Contact with a confirmed/suspected infectious-disease case in the past 14 days?', type: 'radio', required: false, options: ['No', 'Yes'], half: true },
      { id: 'carryingCurrency', label: 'Carrying cash over RMB 20,000 or USD 5,000 (or equivalent)?', type: 'radio', required: false, options: ['No', 'Yes'], half: true },
      { id: 'carryingGoods', label: 'Carrying goods above the duty-free allowance, or restricted/commercial items?', type: 'radio', required: false, options: ['No', 'Yes'], half: true },
      { id: 'declaredItems', label: 'Briefly describe the items you need to declare', type: 'textarea', required: true, showIf: { field: 'carryingGoods', in: ['Yes'] }, max: 240 },
    ],
  },
]

/** Major mainland-China entry cities (used for entry & destination dropdowns). */
export const CHINA_CITIES = [
  'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Chongqing', 'Hangzhou', 'Xi’an', 'Kunming',
  'Xiamen', 'Nanjing', 'Qingdao', 'Wuhan', 'Changsha', 'Zhengzhou', 'Tianjin', 'Dalian', 'Shenyang',
  'Harbin', 'Guilin', 'Sanya', 'Zhuhai', 'Fuzhou', 'Ningbo', 'Wuxi', 'Suzhou', 'Jinan', 'Urumqi',
  'Lhasa', 'Hohhot', 'Nanning', 'Haikou', 'Other',
]

/** Major China ports of entry (airports, plus key land/sea crossings). */
export const CHINA_PORTS = [
  'Beijing Capital International Airport (PEK)',
  'Beijing Daxing International Airport (PKX)',
  'Shanghai Pudong International Airport (PVG)',
  'Shanghai Hongqiao International Airport (SHA)',
  'Guangzhou Baiyun International Airport (CAN)',
  'Shenzhen Bao’an International Airport (SZX)',
  'Chengdu Tianfu International Airport (TFU)',
  'Chengdu Shuangliu International Airport (CTU)',
  'Chongqing Jiangbei International Airport (CKG)',
  'Hangzhou Xiaoshan International Airport (HGH)',
  'Xi’an Xianyang International Airport (XIY)',
  'Kunming Changshui International Airport (KMG)',
  'Xiamen Gaoqi International Airport (XMN)',
  'Nanjing Lukou International Airport (NKG)',
  'Qingdao Jiaodong International Airport (TAO)',
  'Wuhan Tianhe International Airport (WUH)',
  'Changsha Huanghua International Airport (CSX)',
  'Zhengzhou Xinzheng International Airport (CGO)',
  'Tianjin Binhai International Airport (TSN)',
  'Dalian Zhoushuizi International Airport (DLC)',
  'Shenyang Taoxian International Airport (SHE)',
  'Harbin Taiping International Airport (HRB)',
  'Guilin Liangjiang International Airport (KWL)',
  'Sanya Phoenix International Airport (SYX)',
  'Haikou Meilan International Airport (HAK)',
  'Fuzhou Changle International Airport (FOC)',
  'Ningbo Lishe International Airport (NGB)',
  'Jinan Yaoqiang International Airport (TNA)',
  'Urumqi Diwopu International Airport (URC)',
  'Nanning Wuxu International Airport (NNG)',
  'Hong Kong–Zhuhai–Macao Bridge (Zhuhai)',
  'Shenzhen Bay Port (land)',
  'Luohu Port, Shenzhen (land)',
  'Futian Port, Shenzhen (land)',
  'West Kowloon Station (Guangzhou–Shenzhen–HK rail)',
  'Shanghai Port (cruise/sea)',
  'Other',
]

/** Common international dialing codes for the phone area-code dropdown. */
export const PHONE_AREA_CODES = [
  '+1 (United States / Canada)', '+7 (Russia / Kazakhstan)', '+20 (Egypt)', '+27 (South Africa)',
  '+31 (Netherlands)', '+32 (Belgium)', '+33 (France)', '+34 (Spain)', '+39 (Italy)', '+41 (Switzerland)',
  '+44 (United Kingdom)', '+45 (Denmark)', '+46 (Sweden)', '+47 (Norway)', '+48 (Poland)', '+49 (Germany)',
  '+52 (Mexico)', '+55 (Brazil)', '+60 (Malaysia)', '+61 (Australia)', '+62 (Indonesia)', '+63 (Philippines)',
  '+64 (New Zealand)', '+65 (Singapore)', '+66 (Thailand)', '+81 (Japan)', '+82 (South Korea)', '+84 (Vietnam)',
  '+86 (China)', '+90 (Turkey)', '+91 (India)', '+92 (Pakistan)', '+94 (Sri Lanka)', '+95 (Myanmar)',
  '+971 (United Arab Emirates)', '+966 (Saudi Arabia)', '+972 (Israel)', '+974 (Qatar)', '+880 (Bangladesh)',
  '+852 (Hong Kong)', '+853 (Macao)', '+886 (Taiwan)', '+351 (Portugal)', '+353 (Ireland)', '+420 (Czechia)',
  '+other',
]

/** A practical citizenship/nationality list. "Other" lets anyone proceed. */
export const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Cambodia','Cameroon','Canada','Chile',
  'Colombia','Costa Rica','Croatia','Cuba','Cyprus','Czechia','Denmark','Dominican Republic','Ecuador',
  'Egypt','El Salvador','Estonia','Ethiopia','Fiji','Finland','France','Georgia','Germany','Ghana',
  'Greece','Guatemala','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos',
  'Latvia','Lebanon','Libya','Liechtenstein','Lithuania','Luxembourg','Malaysia','Maldives','Malta','Mauritius',
  'Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Myanmar','Nepal','Netherlands','New Zealand',
  'Nigeria','North Macedonia','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Serbia','Singapore','Slovakia','Slovenia',
  'South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Taiwan','Tanzania','Thailand','Tunisia',
  'Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela',
  'Vietnam','Zambia','Zimbabwe','Other',
]
