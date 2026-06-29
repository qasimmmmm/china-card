/**
 * China Digital Arrival Card — application field schema.
 *
 * Mirrors the data the official NIA Arrival Card collects (corroborated across
 * embassy notices and multiple step-by-step walkthroughs), plus the optional
 * customs/health declaration items. This single source of truth drives:
 *   1. the multi-step application UI (src/components/apply/*)
 *   2. validation (src/lib/applicationSchema.ts)
 *   3. the operator automation worker's field mapping (worker/*)
 *
 * NOTE: We collect the same information the traveler would enter themselves on
 * the free official portal. We do not, and cannot, issue the card — only the
 * NIA does. See the disclaimers throughout the site.
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

export const TRANSPORT_MODES = ['Air / Flight', 'Land / Train', 'Land / Road', 'Sea / Ferry / Vessel']

export const PURPOSES = [
  'Tourism / Sightseeing',
  'Business',
  'Visiting relatives / friends',
  'Conference / Exchange',
  'Study',
  'Work / Employment',
  'Transit',
  'Official',
  'Other',
]

export const DOC_TYPES = [
  'Ordinary Passport',
  'Diplomatic Passport',
  'Service / Official Passport',
  'Travel Document',
  'Other',
]

export const ENTRY_BASIS = [
  'Visa',
  'Visa-free (240-hour transit)',
  'Visa-free (bilateral / unilateral policy)',
  'Residence permit',
  'Other entry permit',
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
    id: 'trip',
    title: 'Travel & arrival',
    subtitle: 'Tell us how and when you’re arriving in mainland China.',
    icon: 'plane',
    fields: [
      { id: 'transportMode', label: 'How are you entering China?', type: 'select', required: true, options: TRANSPORT_MODES, half: true },
      { id: 'carrierNumber', label: 'Flight / train / vessel number', type: 'text', required: true, placeholder: 'e.g. CA938', half: true, max: 24 },
      { id: 'arrivalDate', label: 'Expected arrival date', type: 'date', required: true, half: true, hint: 'The card can be filed within 3 days before arrival.' },
      { id: 'purpose', label: 'Purpose of your visit', type: 'select', required: true, options: PURPOSES, half: true },
      { id: 'purposeOther', label: 'Please specify your purpose', type: 'text', required: true, showIf: { field: 'purpose', in: ['Other'] }, max: 80 },
      { id: 'entryCity', label: 'City of entry (first city in China)', type: 'select', required: true, options: [], half: true },
      { id: 'entryPort', label: 'Port of entry', type: 'text', required: true, placeholder: 'Airport, station or seaport', half: true, hint: 'e.g. Beijing Capital International Airport (PEK)' },
      { id: 'destinationCity', label: 'Main destination city in China', type: 'select', required: true, options: [], half: true },
      { id: 'addressInChina', label: 'Accommodation in China (hotel name & full address, or host address)', type: 'textarea', required: true, placeholder: 'Hotel name, street, district, city', max: 240, hint: 'Address of your first night’s stay. Required by immigration.' },
    ],
  },
  {
    id: 'personal',
    title: 'Personal details',
    subtitle: 'Enter your details exactly as they appear in your passport.',
    icon: 'user',
    fields: [
      { id: 'surname', label: 'Surname / last name', type: 'text', required: true, placeholder: 'As shown in passport', half: true, max: 60 },
      { id: 'givenNames', label: 'Given name(s)', type: 'text', required: true, placeholder: 'As shown in passport', half: true, max: 80 },
      { id: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'], half: true },
      { id: 'dob', label: 'Date of birth', type: 'date', required: true, half: true },
      { id: 'nationality', label: 'Country / region of citizenship', type: 'country', required: true, half: true },
      { id: 'countryOfBirth', label: 'Country / region of birth', type: 'country', required: true, half: true },
    ],
  },
  {
    id: 'passport',
    title: 'Passport & visa',
    subtitle: 'Your travel document and basis for entering China.',
    icon: 'book',
    fields: [
      { id: 'docType', label: 'Document type', type: 'select', required: true, options: DOC_TYPES, half: true },
      { id: 'passportNumber', label: 'Passport / document number', type: 'text', required: true, placeholder: 'e.g. E12345678', half: true, max: 24 },
      { id: 'passportExpiry', label: 'Passport expiry date', type: 'date', required: true, half: true, hint: 'Should be valid for your whole stay.' },
      { id: 'passportIssueCountry', label: 'Country / authority that issued it', type: 'country', required: true, half: true },
      { id: 'hasVisa', label: 'Do you hold a valid Chinese visa or entry permit?', type: 'radio', required: true, options: ['Yes', 'No'], half: true },
      { id: 'entryBasis', label: 'Basis for entry', type: 'select', required: true, options: ENTRY_BASIS, half: true, showIf: { field: 'hasVisa', in: ['Yes', 'No'] } },
      { id: 'visaNumber', label: 'Visa / permit number', type: 'text', required: true, placeholder: 'As shown on your visa', half: true, showIf: { field: 'hasVisa', in: ['Yes'] }, max: 24 },
      { id: 'passportFile', label: 'Passport photo page', type: 'file', required: false, hint: 'Optional. Upload a clear photo of your passport data page so our team can verify details (JPG/PNG/PDF, max 8 MB).' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact details',
    subtitle: 'Where we send your confirmation and how immigration can reach you.',
    icon: 'mail',
    fields: [
      { id: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'you@example.com', half: true, hint: 'Your confirmation & QR code are sent here.' },
      { id: 'phone', label: 'Mobile phone number', type: 'tel', required: true, placeholder: '+1 555 123 4567', half: true, hint: 'Include your country code.' },
      { id: 'inviterPresent', label: 'Do you have an inviting person or organisation in China?', type: 'radio', required: true, options: ['Yes', 'No'], half: true },
      { id: 'inviterName', label: 'Name of inviting person / organisation', type: 'text', required: true, showIf: { field: 'inviterPresent', in: ['Yes'] }, half: true, max: 120 },
      { id: 'departurePlanned', label: 'Do you have a confirmed onward / departure plan?', type: 'radio', required: true, options: ['Yes', 'No'], half: true, hint: 'Required for 240-hour visa-free transit.' },
      { id: 'departureDetails', label: 'Departure date & transport number', type: 'text', required: true, showIf: { field: 'departurePlanned', in: ['Yes'] }, half: true, placeholder: 'e.g. 2026-07-12, CA937', max: 80 },
    ],
  },
  {
    id: 'declaration',
    title: 'Health & customs',
    subtitle: 'A short declaration. Most travelers select “No” to everything — only declare what genuinely applies.',
    icon: 'clipboard',
    fields: [
      { id: 'symptoms', label: 'Do you currently have any of these symptoms?', type: 'checkboxes', required: false, options: SYMPTOMS, hint: 'Select all that apply (or “None of the above”).' },
      { id: 'infectiousContact', label: 'Contact with a confirmed/suspected infectious-disease case in the past 14 days?', type: 'radio', required: true, options: ['No', 'Yes'], half: true },
      { id: 'carryingCurrency', label: 'Carrying cash over RMB 20,000 or USD 5,000 (or equivalent)?', type: 'radio', required: true, options: ['No', 'Yes'], half: true },
      { id: 'carryingGoods', label: 'Carrying goods above the duty-free allowance, or restricted/commercial items?', type: 'radio', required: true, options: ['No', 'Yes'], half: true },
      { id: 'declaredItems', label: 'Briefly describe the items you need to declare', type: 'textarea', required: true, showIf: { field: 'carryingGoods', in: ['Yes'] }, max: 240 },
    ],
  },
]

/** Major mainland-China entry cities (used for entry & destination dropdowns). */
export const CHINA_CITIES = [
  'Beijing',
  'Shanghai',
  'Guangzhou',
  'Shenzhen',
  'Chengdu',
  'Chongqing',
  'Hangzhou',
  'Xi’an',
  'Kunming',
  'Xiamen',
  'Nanjing',
  'Qingdao',
  'Wuhan',
  'Changsha',
  'Zhengzhou',
  'Tianjin',
  'Dalian',
  'Shenyang',
  'Harbin',
  'Guilin',
  'Sanya',
  'Zhuhai',
  'Other',
]

/** A practical citizenship/nationality list. "Other" lets anyone proceed. */
export const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Cambodia','Cameroon','Canada','Chile',
  'China','Colombia','Costa Rica','Croatia','Cuba','Cyprus','Czechia','Denmark','Dominican Republic','Ecuador',
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
