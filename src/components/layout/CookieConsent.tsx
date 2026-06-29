'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const KEY = 'cac-cookie-consent'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      /* ignore */
    }
  }, [])

  const choose = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="container">
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card-hover sm:flex-row sm:items-center sm:gap-5 sm:p-5">
          <Cookie  className="hidden h-6 w-6 shrink-0 text-brand-600 sm:block" aria-hidden="true" />
          <p className="flex-1 text-sm text-ink-soft">
            We use essential cookies to run this site and, with your consent, analytics cookies to improve it.
            See our{' '}
            <Link href="/legal/cookies" className="link-underline">
              Cookie Policy
            </Link>
            .
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => choose('declined')} className="btn btn-outline btn-sm">
              Decline
            </button>
            <button onClick={() => choose('accepted')} className="btn-primary btn-sm">
              Accept
            </button>
            <button
              onClick={() => choose('declined')}
              aria-label="Dismiss"
              className="ml-1 text-ink-muted hover:text-navy"
            >
              <X  className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
