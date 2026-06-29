import { ChevronDown } from 'lucide-react'

export interface QA {
  q: string
  a: string
}

/** Accessible accordion built on native <details>/<summary> — works without JS. */
export function Accordion({ items }: { items: QA[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-navy transition-colors hover:bg-surface-soft sm:px-6">
            <span>{item.q}</span>
            <ChevronDown className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink-soft sm:px-6">{item.a}</div>
        </details>
      ))}
    </div>
  )
}
