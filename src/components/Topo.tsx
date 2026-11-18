import { useMemo } from 'react'

// Deterministic contour rings that read as a topographic map.
function ring(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = []
  const n = 120
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const wob =
      1 +
      0.16 * Math.sin(3 * t + seed) +
      0.09 * Math.sin(5 * t + seed * 1.7) +
      0.05 * Math.sin(9 * t + seed * 0.6)
    const x = cx + Math.cos(t) * r * wob * 1.15
    const y = cy + Math.sin(t) * r * wob
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ') + 'Z'
}

const PEAKS = [
  { cx: 280, cy: 320, rings: 14, step: 34, seed: 0.6 },
  { cx: 820, cy: 760, rings: 12, step: 38, seed: 2.3 },
  { cx: 900, cy: 140, rings: 7, step: 30, seed: 4.1 },
]

export default function Topo({ className = '' }: { className?: string }) {
  const paths = useMemo(
    () =>
      PEAKS.flatMap((p, pi) =>
        Array.from({ length: p.rings }, (_, k) => ({
          key: `${pi}-${k}`,
          d: ring(p.cx, p.cy, 30 + k * p.step, p.seed + k * 0.12),
          strong: k % 4 === 3,
        })),
      ),
    [],
  )
  return (
    <svg
      className={className}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" stroke="#fff" strokeLinejoin="round">
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            strokeWidth={p.strong ? 1.6 : 1}
            opacity={p.strong ? 0.13 : 0.07}
          />
        ))}
      </g>
    </svg>
  )
}
