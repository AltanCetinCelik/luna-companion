import { useMemo } from 'react'
import { PALETTE } from '../pixelart'

interface PixelArtProps {
  map: string[]
  className?: string
  pixel?: number
  alt?: string
  style?: React.CSSProperties
}

/** Renders a character map (see src/pixelart) as a crisp, scalable SVG. */
export function PixelArt({ map, className, pixel = 2, alt = '', style }: PixelArtProps) {
  const rows = map.length
  const cols = map[0]?.length ?? 0

  const rects = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let y = 0; y < rows; y++) {
      const row = map[y]
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]
        if (ch === '.' || ch === ' ') continue
        const fill = PALETTE[ch]
        if (!fill) continue
        out.push(
          <rect key={`${x}-${y}`} x={x * pixel} y={y * pixel} width={pixel} height={pixel} fill={fill} />,
        )
      }
    }
    return out
  }, [map, pixel, rows])

  return (
    <svg
      viewBox={`0 0 ${cols * pixel} ${rows * pixel}`}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={alt}
      style={{ width: '100%', height: 'auto', ...style }}
    >
      {rects}
    </svg>
  )
}
