/**
 * Central site configuration — brand, navigation, contact, and the
 * disclaimer text reused across the app. Keeping it here makes the
 * "not a government website" messaging consistent on every page,
 * which is required for ad-network and consumer-protection compliance.
 */

export const site = {
  name: 'China Arrival Card',
  brand: 'iVisa Portal',
  legalEntity: 'iVisa Portal',
  domain: 'china.ivisaportal.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://china.ivisaportal.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@ivisaportal.com',
  description:
    'Apply for your China Digital Arrival Card online. A fast guided English application, expert human review, and 24/7 support from iVisa Portal — an independent application-assistance service. Not a government website.',
  tagline: 'Your China Arrival Card, prepared and checked — so you breeze through immigration.',
  officialPortalName: 'China National Immigration Administration (NIA)',
  officialPortalUrl: 'https://s.nia.gov.cn/ArrivalCardFillingPC/',
} as const

/** Official government channels — linked transparently for compliance. */
export const officialChannels = [
  { label: 'NIA Arrival Card portal (desktop)', href: 'https://s.nia.gov.cn/ArrivalCardFillingPC/' },
  { label: 'NIA Arrival Card portal (mobile)', href: 'https://s.nia.gov.cn/ArrivalCardFillingPhone/' },
  { label: 'National Immigration Administration (English)', href: 'https://en.nia.gov.cn/' },
] as const

export const primaryNav = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Requirements', href: '/requirements' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Track order', href: '/track' },
  { label: 'Contact', href: '/contact' },
] as const

export const footerNav: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Service',
    links: [
      { label: 'Apply now', href: '/apply' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Requirements', href: '/requirements' },
      { label: 'Track your order', href: '/track' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'China entry guide', href: '/guide/china-entry-requirements' },
      { label: '240-hour visa-free transit', href: '/guide/240-hour-visa-free-transit' },
      { label: 'Customs Health Declaration', href: '/guide/customs-health-declaration' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Refund policy', href: '/legal/refund-policy' },
      { label: 'Terms of service', href: '/legal/terms' },
      { label: 'Privacy policy', href: '/legal/privacy' },
    ],
  },
]

export const legalNav = [
  { label: 'Disclaimer & non-affiliation', href: '/legal/disclaimer' },
  { label: 'Terms of service', href: '/legal/terms' },
  { label: 'Privacy policy', href: '/legal/privacy' },
  { label: 'Refund & cancellation', href: '/legal/refund-policy' },
  { label: 'Cookie policy', href: '/legal/cookies' },
  { label: 'Official government links', href: '/official-links' },
] as const

/** The compliance disclaimer, in several lengths, reused site-wide. */
export const disclaimer = {
  short:
    'This is a private, independent service and is not affiliated with, endorsed by, or operated by the Chinese government or the National Immigration Administration (NIA).',
  banner:
    'Not a government website. This is a private, independent service and is NOT affiliated with the Chinese government or the National Immigration Administration (NIA). The China Arrival Card is free directly from the NIA.',
  hero:
    'Independent application-assistance service — not a government website. The official China Arrival Card is free at the NIA; our separate service fee covers help completing, reviewing and submitting your form.',
  pricing:
    'Our fee is a service charge for assistance and review only. It is separate from, and in addition to, any government fee. The official China Arrival Card is free of charge at the NIA — you are paying for our optional assistance, not for the document itself.',
  checkout:
    'By paying you are purchasing an optional third-party assistance service, not a government product. We are not affiliated with the Chinese government. The total price shown includes all mandatory service fees. See our Refund & Cancellation Policy.',
  full:
    'china.ivisaportal.com is operated by iVisa Portal, a private and independent company. We are NOT affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with the government of the People’s Republic of China, the National Immigration Administration (NIA), the General Administration of Customs, or any of their agencies or officials. The China Arrival Card / China Digital Arrival Card can be obtained free of charge directly from the official NIA channels (the official NIA website, the “NIA 12367” app, and the WeChat/Alipay mini-programs). The fee we charge is an optional service fee for application assistance — including reviewing your information for errors, completing the form on your behalf, and customer support — and is separate from and in addition to any government fee. We do not guarantee approval or entry; all immigration decisions are made solely by the relevant government authorities. By using this site you confirm you understand you may apply yourself, for free, directly with the NIA.',
}
