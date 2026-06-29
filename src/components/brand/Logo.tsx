import { cn } from '@/lib/utils'

/**
 * iVisa Portal brand lockup — an emblem (globe + verified check inside a
 * passport-blue rounded square) paired with the "iVisa Portal" wordmark and
 * a "China Arrival Card" service descriptor. Pure SVG/markup so it stays
 * crisp at any size and themes for light/dark backgrounds.
 *
 * Drop-in replacement: swap the <Emblem/> markup for the official asset
 * if/when you have the licensed logo file.
 */
export function Logo({
  className,
  variant = 'dark',
  showService = true,
}: {
  className?: string
  variant?: 'dark' | 'light'
  showService?: boolean
}) {
  const light = variant === 'light'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Emblem />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-0.5">
          <span
            className={cn(
              'font-display text-[1.28rem] font-extrabold tracking-tight',
              light ? 'text-white' : 'text-navy',
            )}
          >
            iVisa
          </span>
          <span className="font-display text-[1.28rem] font-extrabold tracking-tight text-brand-500">
            Portal
          </span>
        </span>
        {showService && (
          <span
            className={cn(
              'mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em]',
              light ? 'text-white/70' : 'text-ink-muted',
            )}
          >
            China Arrival Card
          </span>
        )}
      </span>
    </span>
  )
}

function Emblem() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="ivp-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f43e0" />
          <stop offset="1" stopColor="#0b1f4d" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#ivp-grad)" />
      {/* globe */}
      <circle cx="20" cy="19" r="10" stroke="white" strokeOpacity="0.85" strokeWidth="1.6" />
      <path
        d="M10 19h20M20 9c3.2 3 3.2 17 0 20M20 9c-3.2 3-3.2 17 0 20"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* verified check badge */}
      <circle cx="29" cy="28.5" r="6.4" fill="#d8232a" stroke="white" strokeWidth="1.8" />
      <path
        d="M26.4 28.6l1.7 1.7 3.1-3.4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
