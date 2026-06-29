/** Decorative QR-style glyph (not a scannable code) for confirmation mockups. */
export function QrMock({ size = 92, className }: { size?: number; className?: string }) {
  // Deterministic pseudo-random pattern so it looks like a real QR.
  const n = 11
  const cells: boolean[] = []
  let seed = 7
  for (let i = 0; i < n * n; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    cells.push((seed >> 8) % 100 < 48)
  }
  const finder = (cx: number, cy: number) => (
    <g key={`f${cx}-${cy}`}>
      <rect x={cx} y={cy} width="3" height="3" fill="#0f172a" />
      <rect x={cx + 0.6} y={cy + 0.6} width="1.8" height="1.8" fill="#fff" />
      <rect x={cx + 1.1} y={cy + 1.1} width="0.8" height="0.8" fill="#0f172a" />
    </g>
  )
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} className={className} aria-hidden="true">
      <rect x="0" y="0" width={n} height={n} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        if ((x < 4 && y < 4) || (x > n - 5 && y < 4) || (x < 4 && y > n - 5)) return null
        return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null
      })}
      {finder(0, 0)}
      {finder(n - 3, 0)}
      {finder(0, n - 3)}
    </svg>
  )
}
