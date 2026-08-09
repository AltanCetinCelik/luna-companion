import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { heartMap, sparkleMap, starMap } from '../pixelart'
import { PixelArt } from './PixelArt'

interface Drift {
  id: number
  left: number
  top: number
  dur: number
  delay: number
  size: number
  kind: 'heart' | 'star' | 'sparkle' | 'emoji'
  emoji?: string
}

const EMOJI = ['🎀', '🌸', '💫', '🌷', '🍓', '🫧']

/** Pastel blobs + drifting stickers. Pure decoration, no interaction. */
export function FloatingBackground() {
  const items = useMemo<Drift[]>(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: (i * 83) % 100,
        top: (i * 47) % 100,
        dur: 9 + (i % 5) * 3,
        delay: (i % 7) * 0.9,
        size: 14 + (i % 4) * 7,
        kind: (['heart', 'star', 'sparkle', 'emoji'] as const)[i % 4],
        emoji: EMOJI[i % EMOJI.length],
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* soft blobs (kept gentle so the toy stays the star) */}
      <motion.div
        className="absolute -left-24 -top-28 h-56 w-56 rounded-full opacity-35 blur-3xl"
        style={{ background: 'var(--c-accent)' }}
        animate={{ x: [0, 26, 0], y: [0, 16, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-28 top-1/3 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'var(--c-accent2)' }}
        animate={{ x: [0, -22, 0], y: [0, 24, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-28 left-1/4 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: 'var(--c-accent3)' }}
        animate={{ x: [0, 20, 0], y: [0, -14, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* drifting stickers */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -26, 0], rotate: [0, 14, -8, 0], opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: item.dur, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
        >
          {item.kind === 'heart' && <PixelArt map={heartMap} pixel={1} className="w-4" />}
          {item.kind === 'star' && <PixelArt map={starMap} pixel={1} className="w-5" />}
          {item.kind === 'sparkle' && <PixelArt map={sparkleMap} pixel={1} className="w-3.5" />}
          {item.kind === 'emoji' && <span className="text-sm">{item.emoji}</span>}
        </motion.div>
      ))}
    </div>
  )
}
