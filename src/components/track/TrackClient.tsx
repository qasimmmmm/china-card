'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle2, Clock, FileSearch, Send, XCircle } from 'lucide-react'
import { STATUS_LABELS, type OrderStatus } from '@/lib/types'
import { formatUSD, cn } from '@/lib/utils'

interface PublicOrder {
  reference: string
  plan: string
  amount: number
  status: OrderStatus
  contactName: string
  arrivalDate: string | null
  entryPort: string | null
  createdAt: string
  updatedAt: string
  events: { at: string; status: OrderStatus; note?: string }[]
}

const STATUS_STYLE: Record<OrderStatus, { color: string; icon: React.ElementType }> = {
  submitted: { color: 'bg-brand-50 text-brand-700', icon: Send },
  in_review: { color: 'bg-warn-light text-warn', icon: FileSearch },
  action_required: { color: 'bg-accent/10 text-accent-dark', icon: AlertCircle },
  processing: { color: 'bg-brand-50 text-brand-700', icon: Clock },
  completed: { color: 'bg-success-light text-success-dark', icon: CheckCircle2 },
  cancelled: { color: 'bg-line text-ink-muted', icon: XCircle },
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function TrackClient({ initialRef = '' }: { initialRef?: string }) {
  const [ref, setRef] = useState(initialRef)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<PublicOrder | null>(null)

  const lookup = useCallback(async (reference: string) => {
    const value = reference.trim()
    if (!value) {
      setError('Please enter your order reference.')
      return
    }
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(value)}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'We couldn’t find that order.')
      } else {
        setOrder(json.order)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialRef) lookup(initialRef)
  }, [initialRef, lookup])

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          lookup(ref)
        }}
        className="card p-5 sm:p-6"
      >
        <label htmlFor="ref" className="field-label">
          Order reference
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="ref"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            placeholder="e.g. CAC-7F3K-9Q2D"
            className="input font-mono uppercase tracking-wider"
            autoComplete="off"
          />
          <button type="submit" disabled={loading} className="btn-primary btn-md shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Track order
          </button>
        </div>
        <p className="field-hint">Your reference was shown on the confirmation screen and emailed to you.</p>
      </form>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-accent-dark">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {order && (
        <div className="mt-6 card overflow-hidden">
          <div className="border-b border-line bg-surface-soft p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Order</p>
                <p className="font-mono text-lg font-bold text-navy">{order.reference}</p>
              </div>
              <StatusPill status={order.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-ink-muted">Traveler</dt>
                <dd className="font-semibold text-navy">{order.contactName}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Service</dt>
                <dd className="font-semibold capitalize text-navy">{order.plan}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Arrival</dt>
                <dd className="font-semibold text-navy">{order.arrivalDate || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Fee</dt>
                <dd className="font-semibold text-navy">{formatUSD(order.amount)}</dd>
              </div>
            </dl>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-sm font-semibold text-navy">Status timeline</p>
            <ol className="mt-4 space-y-0">
              {order.events
                .slice()
                .reverse()
                .map((ev, i) => {
                  const style = STATUS_STYLE[ev.status]
                  const Icon = style.icon
                  const isLatest = i === 0
                  return (
                    <li key={ev.at + i} className="flex gap-3 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            isLatest ? style.color : 'bg-line text-ink-muted',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {i < order.events.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                      </div>
                      <div className="pb-1">
                        <p className={cn('text-sm font-semibold', isLatest ? 'text-navy' : 'text-ink-soft')}>
                          {STATUS_LABELS[ev.status]}
                        </p>
                        {ev.note && <p className="text-sm text-ink-soft">{ev.note}</p>}
                        <p className="mt-0.5 text-xs text-ink-muted">{fmtDate(ev.at)}</p>
                      </div>
                    </li>
                  )
                })}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLE[status]
  const Icon = style.icon
  return (
    <span className={cn('pill', style.color)}>
      <Icon className="h-3.5 w-3.5" />
      {STATUS_LABELS[status]}
    </span>
  )
}
