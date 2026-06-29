import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow justify-center">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg text-ink-soft">{description}</p>}
    </div>
  )
}
