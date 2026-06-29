export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <section className="bg-hero-soft">
      <div className="container py-12 sm:py-14">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-[2.6rem] sm:leading-[1.1]">{title}</h1>
          {description && <p className="mt-4 text-lg text-ink-soft">{description}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
