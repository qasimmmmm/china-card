import { site } from '@/lib/site'

/** Organization + WebSite structured data for richer search results. */
export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: `${site.brand} — China Arrival Card`,
        url: site.url,
        email: site.supportEmail,
        description: site.description,
        disambiguatingDescription:
          'Independent, privately-owned online application assistance service. Not affiliated with any government.',
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { '@id': `${site.url}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'Service',
        name: 'China Arrival Card & Customs Health Declaration application assistance',
        provider: { '@id': `${site.url}/#organization` },
        areaServed: 'CN',
        serviceType: 'Travel document application assistance',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
