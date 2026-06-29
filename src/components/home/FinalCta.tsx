import Link from 'next/link'
import { ChevronRight, ShieldCheck } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="section">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-hero px-6 py-14 text-center text-white sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to clear China immigration the easy way?
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Start your guided application now. Expert review, a scannable QR code, and 24/7 support —
              with a money-back guarantee on every order.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/apply" className="btn-lg bg-white !text-brand-700 hover:bg-white/90">
                Start my application
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link href="/track" className="btn btn-lg border border-white/30 bg-white/5 text-white hover:bg-white/12">
                Track an existing order
              </Link>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
              <ShieldCheck className="h-4 w-4" />
              Independent service · Not affiliated with the Chinese government
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
