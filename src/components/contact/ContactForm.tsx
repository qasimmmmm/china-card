'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react'

type Fields = { name: string; email: string; orderRef: string; subject: string; message: string }
const empty: Fields = { name: '', email: '', orderRef: '', subject: '', message: '' }

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrors({})
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrors(json.fieldErrors || {})
        setMessage(json.error || 'Please check the form.')
        setStatus('error')
        return
      }
      setMessage(json.message)
      setStatus('sent')
      setValues(empty)
    } catch {
      setMessage('Something went wrong. Please email us directly.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
          <CheckCircle2  className="h-8 w-8 text-success" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-navy">Message sent</h3>
        <p className="mt-2 text-ink-soft">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">Your name *</label>
          <input id="c-name" className="input" value={values.name} onChange={set('name')} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">Email *</label>
          <input id="c-email" type="email" className="input" value={values.email} onChange={set('email')} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-ref" className="field-label">Order reference (optional)</label>
          <input id="c-ref" className="input font-mono uppercase" value={values.orderRef} onChange={set('orderRef')} placeholder="CAC-••••-••••" />
        </div>
        <div>
          <label htmlFor="c-subject" className="field-label">Subject *</label>
          <input id="c-subject" className="input" value={values.subject} onChange={set('subject')} />
          {errors.subject && <p className="field-error">{errors.subject}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="field-label">Message *</label>
        <textarea id="c-message" rows={5} className="textarea" value={values.message} onChange={set('message')} />
        {errors.message && <p className="field-error">{errors.message}</p>}
      </div>

      {status === 'error' && message && (
        <div className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm text-accent-dark">
          <AlertCircle  className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {message}
        </div>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-primary btn-lg w-full sm:w-auto">
        {status === 'sending' ? <Loader2  className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send  className="h-4 w-4" aria-hidden="true" />}
        Send message
      </button>
    </form>
  )
}
