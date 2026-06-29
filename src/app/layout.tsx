import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { site } from '@/lib/site'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { JsonLd } from '@/components/seo/JsonLd'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'China Arrival Card | Online Application & Customs Health Declaration',
    template: '%s | China Arrival Card',
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'China Arrival Card',
    'China Digital Arrival Card',
    'China Customs Health Declaration',
    'China entry card',
    'China visa-free transit',
    'apply China arrival card online',
  ],
  openGraph: {
    type: 'website',
    url: site.url,
    title: 'China Arrival Card | Online Application Service',
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'China Arrival Card | Online Application Service',
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: site.url },
}

export const viewport: Viewport = {
  themeColor: '#0b1f4d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <JsonLd />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
