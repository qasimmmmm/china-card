import Link from 'next/link'
import { Mail, ShieldCheck, Lock, Clock } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { footerNav, site, disclaimer } from '@/lib/site'

export function Footer() {
  const year = 2025
  return (
    <footer className="mt-auto border-t border-line bg-navy text-white/80">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Lock, title: 'Secure & encrypted', desc: 'SSL-protected application & data handling' },
            { icon: ShieldCheck, title: 'Expert review', desc: 'Every submission checked before processing' },
            { icon: Clock, title: '24/7 support', desc: 'Real people, every step of the way' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <f.icon className="h-5 w-5 text-gold" />
              </span>
              <div>
                <p className="font-semibold text-white">{f.title}</p>
                <p className="text-sm text-white/65">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container grid gap-10 py-12 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">{site.tagline}</p>
          <a
            href={`mailto:${site.supportEmail}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gold"
          >
            <Mail className="h-4 w-4" />
            {site.supportEmail}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerNav.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/75 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer + copyright */}
      <div className="border-t border-white/10 bg-navy/60">
        <div className="container py-7">
          <p className="text-xs leading-relaxed text-white/55">{disclaimer.full}</p>
          <div className="mt-5 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/55 sm:flex-row sm:items-center">
            <p>
              © {year} {site.brand}. All rights reserved.
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
              <Link href="/legal/terms" className="hover:text-white">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/legal/refund-policy" className="hover:text-white">Refunds</Link>
              <Link href="/legal/cookies" className="hover:text-white">Cookies</Link>
              <Link href="/legal/disclaimer" className="hover:text-white">Disclaimer</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
