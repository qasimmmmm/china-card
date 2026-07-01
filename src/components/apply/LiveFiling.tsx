'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, ShieldCheck, CheckCircle2, AlertCircle, Send, Clock, Download } from 'lucide-react'

type Phase = 'starting' | 'review' | 'submitting' | 'completed' | 'unavailable' | 'error'

/**
 * Live government-filing step. The filing service opens the official China
 * Arrival Card portal, enters the customer's details, and returns a screenshot
 * of the FILLED official form. The customer reviews it and gives the final
 * consent (their legal declaration); we then submit and deliver the official
 * receipt (QR). If the filing service isn't configured, we fall back to
 * assisted (staff) filing.
 */
export function LiveFiling({ reference }: { reference: string }) {
  const [phase, setPhase] = useState<Phase>('starting')
  const [sessionId, setSessionId] = useState('')
  const [formPreview, setFormPreview] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [receipt, setReceipt] = useState('')
  const [debugAnswer, setDebugAnswer] = useState('')
  const startedRef = useRef(false)

  const start = useCallback(async () => {
    setPhase('starting')
    setMessage('')
    try {
      const res = await fetch('/api/fill/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      const json = await res.json()
      if (json.available === false) return setPhase('unavailable')
      if (!res.ok || !json.formPreview) {
        setMessage(json.error || 'We could not open the official portal.')
        return setPhase('error')
      }
      setSessionId(json.sessionId)
      setFormPreview(json.formPreview)
      setCaptcha(json.captcha?.image || '')
      if (json.debugAnswer) setDebugAnswer(json.debugAnswer)
      setPhase('review')
    } catch {
      setPhase('unavailable')
    }
  }, [reference])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
  }, [start])

  async function confirmSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (captcha && !answer.trim()) {
      setMessage('Please enter the verification code shown on the official form.')
      return
    }
    setPhase('submitting')
    setMessage('')
    try {
      const res = await fetch('/api/fill/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, sessionId, answer: answer.trim() }),
      })
      const json = await res.json()
      if (json.status === 'completed') {
        setConfirmation(json.confirmation)
        setReceipt(json.receiptImage || '')
        return setPhase('completed')
      }
      if (json.status === 'captcha') {
        setCaptcha(json.captcha.image)
        if (json.debugAnswer) setDebugAnswer(json.debugAnswer)
        setAnswer('')
        setMessage(json.message || 'That verification code was incorrect — please try again.')
        return setPhase('review')
      }
      setMessage(json.error || 'The submission did not complete. Our team will finish it for you.')
      setPhase('error')
    } catch {
      setMessage('Connection issue. Our team will complete your filing.')
      setPhase('error')
    }
  }

  return (
    <div
      className="mt-6 rounded-2xl border border-line bg-white p-6 text-left shadow-card"
      data-testid="live-filing"
      data-phase={phase}
      {...(debugAnswer ? { 'data-debug-answer': debugAnswer } : {})}
    >
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />
        <p className="font-semibold text-navy">Your official China Arrival Card submission</p>
      </div>

      {phase === 'starting' && (
        <Center>
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink-soft">Opening the official portal and entering your details…</p>
        </Center>
      )}

      {phase === 'review' && (
        <form onSubmit={confirmSubmit} className="pt-4">
          <p className="text-sm text-ink-soft">
            We’ve entered your details on the official China Arrival Card portal. Please review the completed
            form below, then confirm to submit. <strong className="text-navy">Submitting is your official
            declaration that the information is true and accurate.</strong>
          </p>
          {formPreview && (
            <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-line bg-surface-soft p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={formPreview} alt="Your details on the official Arrival Card form" className="w-full rounded-lg" />
            </div>
          )}

          {captcha && (
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div>
                <span className="field-label">Verification code (from the form)</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={captcha} alt="Verification code shown on the official form" className="h-14 rounded-lg border border-line bg-white" />
              </div>
              <div className="flex-1" style={{ minWidth: 160 }}>
                <label htmlFor="captcha-answer" className="field-label">Enter the code</label>
                <input
                  id="captcha-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                  maxLength={8}
                  autoComplete="off"
                  className="input uppercase tracking-widest"
                />
              </div>
            </div>
          )}

          {message && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-accent-dark">
              <AlertCircle className="h-4 w-4" aria-hidden="true" /> {message}
            </p>
          )}

          <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-ink-soft">
            <input type="checkbox" required className="mt-0.5 h-4.5 w-4.5 rounded border-line text-brand-600 focus:ring-brand-500" />
            <span>I confirm the details above are correct and I authorize this submission to the Chinese authorities.</span>
          </label>

          <button type="submit" className="btn-primary btn-lg mt-4">
            <Send className="h-4 w-4" aria-hidden="true" /> Confirm &amp; submit to authorities
          </button>
        </form>
      )}

      {phase === 'submitting' && (
        <Center>
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink-soft">Submitting your Arrival Card to the authorities…</p>
        </Center>
      )}

      {phase === 'completed' && (
        <div className="pt-4">
          <div className="flex items-center gap-2 text-success-dark">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <p className="font-bold">Your China Arrival Card is filed</p>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Official confirmation <span className="font-mono font-semibold text-navy">{confirmation}</span>. Present
            this at immigration — a copy has also been emailed to you.
          </p>
          {receipt ? (
            <div className="mt-4 rounded-xl border border-success/30 bg-success-light/40 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={receipt} alt="Your official China Arrival Card receipt with QR code" className="mx-auto max-h-96 rounded-lg" />
              <a
                href={receipt}
                download={`china-arrival-card-${confirmation}.png`}
                className="btn-primary btn-md mt-3 w-full"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download my Arrival Card
              </a>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Your receipt is available on your tracking page.</p>
          )}
        </div>
      )}

      {(phase === 'unavailable' || phase === 'error') && (
        <div className="pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-soft p-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-navy">Our team will complete your official filing</p>
              <p className="mt-0.5 text-sm text-ink-soft">
                {message || 'We’ll file your Arrival Card and email your confirmation shortly. You can track progress anytime with your reference.'}
              </p>
              {phase === 'error' && (
                <button onClick={start} className="btn btn-outline btn-sm mt-3">
                  Try again now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center py-8 text-center">{children}</div>
}
