'use client'

import { useEffect, useRef, useState } from 'react'
import { Eraser, Pen } from 'lucide-react'

/**
 * Canvas signature pad (mouse + touch). Emits a trimmed PNG data-URL via
 * onChange. The official CDAC declaration step requires a signature; this is
 * what the customer draws and authorizes us to reproduce on the portal.
 */
export function SignaturePad({
  value,
  onChange,
}: {
  value: string
  onChange: (dataUrl: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = useState(!!value)

  // Size the canvas to its container (retina-aware) once mounted.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#0f172a'
    }
  }, [])

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function start(e: React.PointerEvent) {
    e.preventDefault()
    drawing.current = true
    last.current = pos(e)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !last.current) return
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasInk) setHasInk(true)
  }

  function end() {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    const url = canvasRef.current?.toDataURL('image/png') || ''
    onChange(url)
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onChange('')
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-white">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          data-testid="signature-canvas"
        />
        {!hasInk && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-ink-muted">
            <Pen className="h-4 w-4" aria-hidden="true" /> Sign here with your mouse or finger
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-ink-muted">This signature is reproduced on your official Arrival Card.</p>
        <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-accent">
          <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> Clear
        </button>
      </div>
    </div>
  )
}
