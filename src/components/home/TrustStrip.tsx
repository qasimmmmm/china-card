import { trustStrip } from '@/content/marketing'
import { Icon } from '@/components/ui/Icon'

export function TrustStrip() {
  return (
    <section className="border-b border-line bg-white" aria-label="Trust and security">
      <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 sm:gap-x-12">
        {trustStrip.map((t) => (
          <div key={t.label} className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <Icon name={t.icon} className="h-4.5 w-4.5 text-success" />
            {t.label}
          </div>
        ))}
      </div>
    </section>
  )
}
