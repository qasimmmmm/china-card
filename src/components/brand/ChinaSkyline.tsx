import { cn } from '@/lib/utils'

/**
 * Original decorative skyline silhouette — a stylized Great Wall + pagoda +
 * modern-tower motif evoking China. Drawn from scratch (no third-party assets)
 * so there are no licensing concerns. Purely ornamental.
 */
export function ChinaSkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={cn('w-full', className)}
    >
      {/* far hills (Great Wall ridge) */}
      <path
        d="M0 170 C 120 120, 220 150, 320 130 C 430 108, 520 150, 640 132 C 760 114, 860 156, 980 138 C 1100 120, 1200 152, 1320 134 L1440 140 V220 H0 Z"
        fill="currentColor"
        opacity="0.18"
      />
      {/* wall crenellations along the ridge */}
      <g fill="currentColor" opacity="0.28">
        {Array.from({ length: 36 }).map((_, i) => (
          <rect key={i} x={i * 40} y={138 - ((i * 7) % 18)} width="10" height="12" />
        ))}
        {[120, 440, 760, 1080, 1340].map((x, i) => (
          <rect key={`t${i}`} x={x} y={120 - (i % 2) * 6} width="22" height="34" />
        ))}
      </g>
      {/* skyline buildings + pagoda */}
      <g fill="currentColor" opacity="0.42">
        <rect x="90" y="120" width="46" height="100" />
        <rect x="150" y="96" width="30" height="124" />
        <rect x="196" y="140" width="40" height="80" />
        {/* pagoda */}
        <g>
          <path d="M300 96 l34 18 h-68 z" />
          <rect x="276" y="114" width="48" height="14" />
          <path d="M286 128 l28 14 h-56 z" />
          <rect x="284" y="142" width="32" height="16" />
          <path d="M290 158 l20 12 h-40 z" />
          <rect x="292" y="170" width="16" height="50" />
        </g>
        <rect x="360" y="110" width="34" height="110" />
        <rect x="402" y="84" width="26" height="136" />
        <rect x="700" y="118" width="40" height="102" />
        {/* twisted-tower hint */}
        <path d="M756 60 q 30 80 6 160 h-30 q -10 -80 8 -160 z" />
        <rect x="812" y="104" width="34" height="116" />
        <rect x="980" y="126" width="44" height="94" />
        <rect x="1034" y="98" width="28" height="122" />
        <rect x="1090" y="138" width="36" height="82" />
        <rect x="1300" y="116" width="40" height="104" />
        <rect x="1352" y="92" width="26" height="128" />
      </g>
    </svg>
  )
}
