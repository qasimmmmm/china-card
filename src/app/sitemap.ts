import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { GUIDE_ORDER } from '@/content/guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-06-29')
  const routes = [
    '',
    '/apply',
    '/requirements',
    '/faq',
    '/about',
    '/contact',
    '/track',
    '/guide',
    '/official-links',
    '/legal/disclaimer',
    '/legal/terms',
    '/legal/privacy',
    '/legal/refund-policy',
    '/legal/cookies',
    ...GUIDE_ORDER.map((s) => `/guide/${s}`),
  ]
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/apply' ? 0.9 : 0.6,
  }))
}
