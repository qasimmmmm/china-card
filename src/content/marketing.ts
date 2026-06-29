/**
 * Marketing copy bank — sourced from competitive + conversion research and
 * tuned for the China Digital Arrival Card (CDAC), launched by China's
 * National Immigration Administration on 20 November 2025.
 *
 * Reviews/testimonials are intentionally omitted.
 */

export const hero = {
  headline: 'Your China Arrival Card, filed right the first time',
  sub: 'China now requires every foreign traveler to submit a Digital Arrival Card. We turn the official form into one simple English application, check every detail, and deliver your confirmation QR code — so you clear immigration in minutes.',
  primaryCta: 'Start my application',
  secondaryCta: 'See how it works',
  stats: [
    { value: '~5 min', label: 'to complete' },
    { value: '256-bit', label: 'SSL encrypted' },
    { value: '24/7', label: 'human support' },
  ],
}

export const trustStrip = [
  { icon: 'lock', label: '256-bit SSL encrypted' },
  { icon: 'badge-check', label: 'Expert human review' },
  { icon: 'shield', label: 'Privacy protected' },
  { icon: 'headset', label: '24/7 customer support' },
  { icon: 'refresh', label: 'Money-back guarantee' },
]

export const whatIsIt = {
  title: 'What is the China Digital Arrival Card?',
  lead: 'A mandatory immigration entry declaration for foreign travelers — replacing the old paper card handed out on the plane.',
  body: [
    'Since 20 November 2025, China’s National Immigration Administration (NIA) requires foreign nationals entering mainland China by air, land, or sea to complete a Digital Arrival Card. It records your passport details, travel and flight information, accommodation in China, and the purpose of your trip.',
    'After submission, the system produces a QR code that immigration officers scan at the border. It applies even to visa-free travelers — including those using the 30-day visa-free entry and the 240-hour visa-free transit policy — unless they fall into one of the NIA’s seven exempt categories.',
    'The Arrival Card is not a visa and does not by itself grant entry: you still need a valid visa or a qualifying visa-free status. It must be filed within 72 hours (3 days) before you arrive.',
  ],
  facts: [
    { k: 'Who needs it', v: 'Foreign nationals entering mainland China (incl. visa-free & transit)' },
    { k: 'When to file', v: 'Within 3 days (72 hours) before arrival' },
    { k: 'Result', v: 'A QR code scanned by immigration at the border' },
    { k: 'Not a visa', v: 'A valid visa or visa-free status is still required' },
  ],
}

export const howItWorks = [
  {
    title: 'Complete the simple form',
    desc: 'Answer a short guided questionnaire in plain English — passport, travel and trip details. Most applicants finish in under five minutes on any phone or computer.',
  },
  {
    title: 'We review and verify',
    desc: 'Our team checks your information for accuracy and completeness, confirms your entry eligibility, and contacts you if anything needs correcting before submission.',
  },
  {
    title: 'Receive your confirmation',
    desc: 'We deliver your completed Arrival Card confirmation and scannable QR code by email (and SMS on faster tiers), ready to present at the immigration checkpoint.',
  },
  {
    title: 'Arrive and scan',
    desc: 'At the border, simply show your passport and QR code. The officer scans it, verifies your details, and waves you through — no last-minute forms.',
  },
]

export const requirements = [
  'A passport valid for the full duration of your stay in China',
  'Your inbound travel details (flight, train, ferry, or land crossing and arrival date)',
  'Your address or accommodation details in China (hotel or host address)',
  'The purpose and dates of your trip',
  'Onward or return ticket details if you are entering under visa-free transit',
  'A valid email address and mobile number to receive your confirmation and QR code',
]

export const features = [
  {
    icon: 'languages',
    title: 'Plain-English guidance',
    desc: 'We turn China’s official immigration form into a simple guided questionnaire — no decoding government terminology or translating fields yourself.',
  },
  {
    icon: 'search-check',
    title: 'Expert human review',
    desc: 'A trained agent checks every application for errors, mismatches, and missing details before submission — catching the small mistakes that cause big delays.',
  },
  {
    icon: 'zap',
    title: 'Faster border clearance',
    desc: 'Arrive with your Arrival Card already prepared and a scannable QR code in hand, instead of filling forms at the airport.',
  },
  {
    icon: 'clock',
    title: 'Around-the-clock service',
    desc: 'Apply anytime from any device, with a support team reachable 24/7 by email and chat across every time zone, weekends and holidays included.',
  },
  {
    icon: 'lock',
    title: 'Secure & encrypted',
    desc: 'Your passport and personal data are protected with bank-grade encryption, handled only by our processing team, and never sold to third parties.',
  },
  {
    icon: 'mail-check',
    title: 'One clear confirmation',
    desc: 'You receive a single, easy-to-read confirmation with your QR code — ready to show at immigration without hunting through multiple websites.',
  },
]

export const guarantees = [
  {
    icon: 'badge-check',
    title: 'Error-check guarantee',
    desc: 'Every application is reviewed by a trained agent. If we spot a problem with your details, we contact you to fix it before it reaches the border.',
  },
  {
    icon: 'clock',
    title: 'On-time or refunded',
    desc: 'We process within the timeframe of your chosen tier. If we miss that window because of us, we refund your service fee — no questions asked.',
  },
  {
    icon: 'shield',
    title: 'Your data stays protected',
    desc: 'Bank-grade encryption, access limited to our processing team, and a firm commitment to never sell your information to third parties.',
  },
]

export type PricingTier = {
  id: 'standard' | 'priority' | 'express'
  name: string
  price: number
  turnaround: string
  badge: string
  featured?: boolean
  features: string[]
}

export const pricing: PricingTier[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 49,
    turnaround: 'Processed within 24 hours',
    badge: '24 hours',
    features: [
      'Guided English-language application',
      'Expert human review of every detail',
      'Error-check before submission',
      'Confirmation with scannable QR code by email',
      'Email support included',
    ],
  },
  {
    id: 'priority',
    name: 'Priority',
    price: 79,
    turnaround: 'Processed within 4 hours',
    badge: '4 hours',
    featured: true,
    features: [
      'Everything in Standard',
      'Moved to the front of the review queue',
      'Confirmation by email and SMS',
      'Priority email & live-chat support',
      'Free corrections if your travel details change',
    ],
  },
  {
    id: 'express',
    name: 'Express',
    price: 119,
    turnaround: 'Processed within 1 hour',
    badge: '1 hour',
    features: [
      'Everything in Priority',
      'Fastest same-hour expert review',
      'Dedicated 24/7 phone & chat support',
      'Last-minute & late-night submissions welcome',
      'Backup resend of your confirmation on request',
    ],
  },
]

export const faqs = [
  {
    q: 'Is this the official government website?',
    a: 'No. We are an independent facilitation service operating under the iVisa Portal brand — not a government agency, and not affiliated with or endorsed by the National Immigration Administration of China or any government body. You can complete the Arrival Card yourself for free on the official NIA platform. Our paid service provides guided English-language assistance, expert review, error-checking, and 24/7 support for travelers who prefer help.',
  },
  {
    q: 'Why pay when I can do it for free?',
    a: 'You absolutely can file directly with the Chinese government at no cost. People choose us for the convenience: a simplified English questionnaire, a human review that catches errors before they reach the border, faster turnaround options, reminders, and round-the-clock support. You are paying for the service, time savings, and peace of mind — not for the card itself.',
  },
  {
    q: 'What is the China Digital Arrival Card?',
    a: 'It is a mandatory entry declaration that foreign travelers submit when entering mainland China by air, land, or sea. Since the online system launched on 20 November 2025, it can be completed in advance and presented as a QR code at immigration, replacing the old paper card filled out on arrival. It records your identity, travel, and trip details for the immigration authorities.',
  },
  {
    q: 'Who needs to complete an Arrival Card?',
    a: 'In general, all foreign nationals entering mainland China need to submit one — including visa-free and transit travelers. Limited exemptions exist for certain categories such as permanent-resident-card holders, 24-hour airside transit passengers, and e-channel users. If you are flying, driving, or sailing into mainland China on a foreign passport, you should plan to submit one. Hong Kong and Macao have separate entry procedures.',
  },
  {
    q: 'What is the 240-hour visa-free transit, and do I still need an Arrival Card?',
    a: 'China’s 240-hour (10-day) visa-free transit lets eligible travelers from 55+ countries pass through designated ports while traveling onward to a third country, provided they hold a valid onward ticket with a confirmed date and seat. Even if you qualify for visa-free transit, you still need to complete the Arrival Card. We help confirm whether your itinerary fits the transit rules.',
  },
  {
    q: 'How long does processing take?',
    a: 'It depends on the tier you choose: Standard within 24 hours, Priority within 4 hours, and Express within 1 hour. We recommend applying at least a day before departure when possible, but our Express option is built for last-minute and same-day travelers. Remember the card can only be filed within 72 hours before arrival.',
  },
  {
    q: 'What documents and information do I need?',
    a: 'A passport valid for your travel dates, your flight or transport details, your address or accommodation in China, and basic trip information such as purpose and dates. Having your itinerary and passport in front of you lets most people finish the form in just a few minutes.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes. If we have not yet begun reviewing your application, you are eligible for a full refund of our service fee. Because our fee covers the work our team performs, refunds are limited once review and processing have started. If we are unable to assist with your specific case, we refund you in full. Full terms are in our Refund & Cancellation Policy.',
  },
  {
    q: 'Is my personal and passport data secure?',
    a: 'Yes. We protect your information with bank-grade encryption in transit and at rest, restrict access to the processing team handling your application, and never sell your data to third parties. Your details are used only to prepare and verify your Arrival Card. See our Privacy Policy for specifics.',
  },
  {
    q: 'Will I get a QR code to scan at the airport?',
    a: 'Yes. Once your Arrival Card is prepared, we deliver a confirmation containing your scannable QR code by email — and by SMS on Priority and Express. At immigration you simply present your passport and QR code for the officer to scan.',
  },
]
