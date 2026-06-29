import Link from 'next/link'
import { Home, FileText, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container max-w-xl text-center">
        <p className="text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">We couldn’t find that page</h1>
        <p className="mt-3 text-ink-soft">
          The page you’re looking for may have moved or no longer exists. Let’s get you back on track.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary btn-md">
            <Home className="h-4 w-4" /> Go home
          </Link>
          <Link href="/apply" className="btn btn-outline btn-md">
            <FileText className="h-4 w-4" /> Start application
          </Link>
          <Link href="/track" className="btn btn-ghost btn-md">
            <Search className="h-4 w-4" /> Track an order
          </Link>
        </div>
      </div>
    </section>
  )
}
