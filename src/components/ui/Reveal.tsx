'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Lightweight scroll-into-view fade/slide. Respects reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'section'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const Comp = Tag as React.ElementType
  return (
    <Comp
      ref={ref}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(shown ? 'animate-fade-up' : 'opacity-0', className)}
    >
      {children}
    </Comp>
  )
}
