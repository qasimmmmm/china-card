import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'China Arrival Card | iVisa Portal',
    short_name: 'China Arrival Card',
    description:
      'Apply for your China Digital Arrival Card online — guided application, expert review, and a scannable QR code. Independent service.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b1f4d',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
