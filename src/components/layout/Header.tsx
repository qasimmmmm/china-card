'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShieldCheck, ChevronRight } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { primaryNav, disclaimer } from '@/lib/site'
import { cn } from '@/lib/utils'

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50">
      {/* Compliance micro-banner */}
      <div className="bg-navy text-white">
        <div className="container flex items-center justify-center gap-2 py-1.5 text-center text-[0.72rem] sm:text-xs">
          <ShieldCheck  className="hidden h-3.5 w-3.5 shrink-0 text-gold sm:block" aria-hidden="true" />
          <p className="leading-tight">
            <span className="font-semibold">Independent service.</span> Not a government website — {' '}
            <span className="text-white/80">official forms may be completed directly with the authorities.</span>
          </p>
        </div>
      </div>

      <div
        className={cn(
          'border-b transition-all duration-200',
          scrolled
            ? 'border-line bg-white/95 shadow-soft backdrop-blur'
            : 'border-transparent bg-white',
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Link href="/" aria-label="China Arrival Card — home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-soft hover:text-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/track" className="btn btn-outline btn-md">
              Track order
            </Link>
            <Link href="/apply" className="btn-primary btn-md">
              Start application
              <ChevronRight  className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-navy lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X  className="h-5 w-5" aria-hidden="true" /> : <Menu  className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 top-[calc(2rem+4rem)] z-40 lg:hidden">
          <div className="h-full overflow-y-auto bg-white px-4 pb-10 pt-4">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-navy hover:bg-surface-soft"
                >
                  {item.label}
                  <ChevronRight  className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/apply" onClick={() => setOpen(false)} className="btn-primary btn-lg w-full">
                Start application
              </Link>
              <Link href="/track" onClick={() => setOpen(false)} className="btn btn-outline btn-lg w-full">
                Track my order
              </Link>
            </div>
            <p className="mt-6 rounded-xl bg-surface-soft p-4 text-xs leading-relaxed text-ink-muted">
              {disclaimer.short}
            </p>
          </div>
        </div>
      )}
    </header>
  )
}
