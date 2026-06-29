import data from './guides.data.json'

export interface GuideSection {
  heading: string
  body: string[]
  bullets?: string[]
}
export interface Guide {
  slug: string
  title: string
  description: string
  readingTime: string
  sections: GuideSection[]
  keyTakeaways?: string[]
}

const raw = data as Record<string, Omit<Guide, 'slug'>>

/** Ordered list of guides for index pages / navigation. */
export const GUIDE_ORDER = [
  'china-entry-requirements',
  '240-hour-visa-free-transit',
  'customs-health-declaration',
] as const

export const guides: Guide[] = GUIDE_ORDER.filter((s) => raw[s]).map((slug) => ({
  slug,
  ...raw[slug],
}))

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

/** Short blurbs for the footer / cross-links. */
export const guideCards = guides.map((g) => ({
  slug: g.slug,
  title: g.title,
  description: g.description,
  readingTime: g.readingTime,
}))
