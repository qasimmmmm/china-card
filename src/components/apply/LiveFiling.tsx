'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, ShieldCheck, CheckCircle2, AlertCircle, Send, Clock } from 'lucide-react'
import { QrMock } from '@/components/ui/QrMock'

type Phase = 'starting' | 'captcha' | 'solving' | 'completed' | 'unavailable' | 'error'

/**
 * Live government-filing step: the filing service enters the customer's details
 * on the official portal and relays its CAPTCHA here. The customer solves their
 * own CAPTCHA, we submit, and the confirmation comes straight back.
 * If the filing service isn't available, we fall back to assisted (staff) filing.
 */
export function LiveFiling({ reference }: { reference: string }) {
  const [phase, setPhase] = useState<Phase>('starting')
  const [sessionId, setSessionId] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [debugAnswer, setDebugAnswer] = useState('') // test-mode only
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
      if (!res.ok || !json.captcha?.image) {
        setMessage(json.error || 'We could not open the portal.')
        return setPhase('error')
      }
      setSessionId(json.sessionId)
      setCaptcha(json.captcha.image)
      if (json.debugAnswer) setDebugAnswer(json.debugAnswer)
      setPhase('captcha')
    } catch {
      setPhase('unavailable')
    }
  }, [reference])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
  }, [start])

  async function solve(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim()) return
    setPhase('solving')
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
        return setPhase('completed')
      }
      if (json.status === 'captcha') {
        setCaptcha(json.captcha.image)
        if (json.debugAnswer) setDebugAnswer(json.debugAnswer)
        setAnswer('')
        setMessage(json.message || 'That code was incorrect — please try again.')
        return setPhase('captcha')
      }
      setMessage(json.error || 'Submission did not complete. Our team will finish it for you.')
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
        <p className="font-semibold text-navy">Complete your official submission</p>
      </div>

      {phase === 'starting' && (
        <Center>
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink-soft">Securely opening the official portal and entering your details…</p>
        </Center>
      )}

      {phase === 'captcha' && (
        <form onSubmit={solve} className="pt-4">
          <p className="text-sm text-ink-soft">
            One quick step only you can do: enter the security code from the official portal to authorize your submission.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <span className="field-label">Security code</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={captcha}
                alt="Security verification code from the official portal"
                className="h-14 rounded-lg border border-line bg-surface-soft"
              />
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
          {message && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-accent-dark">
              <AlertCircle className="h-4 w-4" aria-hidden="true" /> {message}
            </p>
          )}
          <button type="submit" className="btn-primary btn-md mt-4">
            <Send className="h-4 w-4" aria-hidden="true" /> Submit to authorities
          </button>
        </form>
      )}

      {phase === 'solving' && (
        <Center>
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink-soft">Submitting your Arrival Card…</p>
        </Center>
      )}

      {phase === 'completed' && (
        <div className="pt-4">
          <div className="flex items-center gap-4 rounded-xl border border-success/30 bg-success-light/60 p-4">
            <div className="rounded-lg border border-success/30 bg-white p-1.5">
              <QrMock size={64} />
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-bold text-success-dark">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Arrival Card filed
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Official confirmation{' '}
                <span className="font-mono font-semibold text-navy">{confirmation}</span>. A copy has been sent to
                your email — present your passport and QR code at immigration.
              </p>
            </div>
          </div>
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
