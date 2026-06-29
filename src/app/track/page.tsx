import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TrackClient } from '@/components/track/TrackClient'

export const metadata: Metadata = {
  title: 'Track your order',
  description: 'Check the status of your China Arrival Card application with your order reference.',
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams
  return (
    <>
      <section className="bg-hero-soft">
        <div className="container py-10 text-center sm:py-12">
          <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Track your order</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            Enter your order reference to see the latest status of your China Arrival Card application.
          </p>
        </div>
      </section>
      <section className="section pt-10">
        <div className="container">
          <Suspense fallback={null}>
            <TrackClient initialRef={ref || ''} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
