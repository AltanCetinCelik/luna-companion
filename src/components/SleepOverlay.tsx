import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { starMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'

interface SleepOverlayProps {
  onWake: () => void
}

const ZZZ = ['Z', 'z', 'z']

/**
 * Covers the LCD with a tiny night sky while she sleeps.
 * Auto-wakes after a while, or tap anywhere to wake her early.
 */
export function SleepOverlay({ onWake }: SleepOverlayProps) {
  const { mood } = useGame()
  const [show, setShow] = useState(false)
  const asleep = mood === 'sleep'

  const stars = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        left: `${(i * 61) % 95 + 2}%`,
        top: `${(i * 37) % 55 + 5}%`,
        delay: `${(i % 7) * 0.5}s`,
        size: i % 3 === 0 ? 'w-2.5' : 'w-1.5',
      })),
    [],
  )

  // Fade the night sky in.
  useEffect(() => {
    if (asleep) {
      const t = setTimeout(() => setShow(true), 250)
      return () => clearTimeout(t)
    }
    setShow(false)
  }, [asleep])

  // Wake her on their own after a cozy while.
  useEffect(() => {
    if (!asleep) return
    const t = setTimeout(onWake, 11000)
    return () => clearTimeout(t)
  }, [asleep, onWake])

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ${
        asleep && show ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!asleep}
    >
      <motion.div
        className={`absolute inset-0 overflow-hidden ${asleep ? 'cursor-pointer select-none pointer-events-auto' : 'pointer-events-none'}`}
        style={{
          background: 'linear-gradient(180deg, #241d45 0%, #3a2d6b 55%, #4a3a7e 100%)',
        }}
        onClick={asleep ? onWake : undefined}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        role={asleep ? 'button' : undefined}
        aria-label={friendProfile.labels.sleepHint}
      >
        {/* stars */}
        {stars.map((s, i) => (
          <motion.span
            key={i}
            className={`absolute ${s.size} rounded-full bg-[#fff6cf]`}
            style={{ left: s.left, top: s.top, boxShadow: '0 0 6px #fff6cf' }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: parseFloat(s.delay), ease: 'easeInOut' }}
          />
        ))}

        {/* moon */}
        <motion.div
          className="absolute right-5 top-5 h-10 w-10 rounded-full bg-[#fff6cf]"
          style={{ boxShadow: '0 0 22px rgba(255,246,207,0.8), inset -8px -4px 0 rgba(255,220,150,0.6)' }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="absolute -right-2 -top-1" aria-hidden>
            <PixelArt map={starMap} pixel={1} className="w-4" />
          </span>
        </motion.div>

        {/* goodnight message */}
        <div className="absolute inset-x-0 top-[12%] text-center">
          <p className="font-pixel text-[11px] leading-relaxed text-[#ffe9f6] drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-[12px]">
            {friendProfile.sleep.goodnight}
          </p>
          <motion.p
            className="mt-2 font-lcd text-[13px] text-[#c9b8f0]"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            ({friendProfile.labels.sleepHint})
          </motion.p>
        </div>

        {/* sleeping pet, lying down */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <PixelPet mood="sleep" size={120} className="sm:hidden" />
          <PixelPet mood="sleep" size={140} className="hidden sm:block" />
        </div>

        {/* rising Zzz */}
        <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-3 sm:bottom-28">
          {ZZZ.map((z, i) => (
            <motion.span
              key={i}
              className="font-pixel text-[#cfc2ff]"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: [-4, -38, -66], x: [0, 6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.9, ease: 'easeOut' }}
            >
              {z}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
