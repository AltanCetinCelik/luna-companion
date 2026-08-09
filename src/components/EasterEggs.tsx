import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { useGame } from '../state/GameContext'

const PARTICLES = ['✨', '⭐', '💖', '🎀', '💫', '🌸']
const COUNT = 16

/** Full-screen sparkle burst + reveal card whenever a secret is found. */
export function SecretCelebration() {
  const { secretEvent, dismissSecret } = useGame()

  useEffect(() => {
    if (!secretEvent) return
    const t = window.setTimeout(dismissSecret, 3400)
    return () => clearTimeout(t)
  }, [secretEvent, dismissSecret])

  return (
    <AnimatePresence>
      {secretEvent && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          aria-live="polite"
        >
          {/* particle burst */}
          {Array.from({ length: COUNT }).map((_, i) => {
            const angle = (i / COUNT) * Math.PI * 2
            const dist = 90 + (i % 5) * 26
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 text-xl"
                style={{ marginLeft: -8, marginTop: -8 }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 20,
                  opacity: [1, 1, 0],
                  scale: [0.5, 1.3, 0.9],
                  rotate: Math.random() * 180 - 90,
                }}
                transition={{ duration: 1.15, ease: 'easeOut' }}
                aria-hidden
              >
                {PARTICLES[i % PARTICLES.length]}
              </motion.span>
            )
          })}

          {/* reveal card */}
          <motion.div
            className="mx-6 max-w-xs rounded-3xl border-4 border-[#ffd77a] bg-[#fffaf0] p-5 text-center shadow-[0_20px_60px_rgba(74,59,102,0.4)]"
            initial={{ scale: 0.5, y: 24, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.7, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.6 }}
              className="text-3xl"
              aria-hidden
            >
              🥚
            </motion.div>
            <p className="font-pixel mt-2 text-[10px] text-[#ff8f3f]">{friendProfile.labels.secretTitle}</p>
            <p className="font-lcd mt-2 text-[18px] leading-tight text-[#6b4a68]">{secretEvent.text}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
