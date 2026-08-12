import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { heartMap, starMap } from '../pixelart'
import { ALL_EGGS, useGame } from '../state/GameContext'
import { sfx } from '../utils/sfx'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'
import { TypewriterText } from './TypewriterText'

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

/* ── TÜM GİZLİLER BULUNUNCA ─────────────────────────────────────────── */

/** Havai fişek patlaması için kalp konumları (x/y % + renk tonu). */
const BURSTS = [
  { x: 20, y: 32, hue: 0, delay: 0.3 },
  { x: 80, y: 28, hue: 40, delay: 0.8 },
  { x: 50, y: 15, hue: 90, delay: 1.3 },
  { x: 28, y: 64, hue: 160, delay: 1.8 },
  { x: 72, y: 60, hue: 220, delay: 2.3 },
]

/** Tek bir patlama: merkezden dışarı saçılan kalpler + merkez parıltı. */
function HeartBurst({ x, y, hue, delay }: { x: number; y: number; hue: number; delay: number }) {
  const pieces = Array.from({ length: 14 }).map((_, i) => {
    const angle = (i / 14) * Math.PI * 2
    const dist = 46 + (i % 3) * 26
    return { angle, dist }
  })
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, filter: `hue-rotate(${hue}deg)` }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1.2, 1.5] }}
      transition={{ duration: 2.6, delay, ease: 'easeOut' }}
      aria-hidden
    >
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 12,
            opacity: [1, 1, 0],
            scale: [0.5, 1.25, 0.7],
            rotate: [0, 40],
          }}
          transition={{ duration: 1.6, delay: delay + i * 0.03, ease: 'easeOut' }}
        >
          <PixelArt map={heartMap} className="w-6 sm:w-7" />
        </motion.div>
      ))}
      <motion.span
        className="absolute -translate-x-1/2 -translate-y-1/2 text-xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.6, 0.6] }}
        transition={{ duration: 0.9, delay }}
      >
        ✨
      </motion.span>
    </motion.div>
  )
}

/**
 * Tüm gizliler (8/8) bulunduğunda: ekran hafifçe kararır, kalp şeklinde
 * havai fişekler patlar ve özel mesaj çıkar. Oturumda bir kez oynar;
 * SIFIRLA sonrası gizliler yeniden toplanırsa tekrar patlar.
 */
export function AllSecretsCelebration() {
  const game = useGame()
  const [active, setActive] = useState(false)
  const firedRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const total = ALL_EGGS.length
  const found = game.save.eggsFound.length

  useEffect(() => {
    if (found < total) {
      firedRef.current = false
      setActive(false)
      return
    }
    // Bu tarayıcı oturumunda bir kez oynar — her refresh'te tekrar etmez.
    if (firedRef.current || !game.save.started) return
    try {
      if (sessionStorage.getItem('all-secrets-celebrated') === '1') return
    } catch {
      /* sessionStorage kapalıysa yine de göster */
    }
    // Son gizlinin kutlama kartı biraz solsun, sonra bu an başlasın.
    const t = window.setTimeout(() => {
      firedRef.current = true
      setActive(true)
      sfx.secret()
      try {
        sessionStorage.setItem('all-secrets-celebrated', '1')
      } catch {
        /* önemsiz */
      }
      timersRef.current.push(window.setTimeout(() => setActive(false), 12000))
    }, 3000)
    return () => clearTimeout(t)
  }, [found, total, game.save.started])

  useEffect(
    () => () => timersRef.current.forEach((t) => clearTimeout(t)),
    [],
  )

  const dismiss = () => {
    sfx.click()
    setActive(false)
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[58] flex flex-col items-center justify-center overflow-hidden bg-[#241d45]/55 px-6 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          onClick={dismiss}
          role="dialog"
          aria-modal="true"
          aria-label="tüm gizliler bulundu"
        >
          {/* kalp havai fişekleri */}
          {BURSTS.map((b, i) => (
            <HeartBurst key={i} {...b} />
          ))}

          {/* süzülen yıldız tozu */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${6 + ((i * 23) % 88)}%`, top: `${10 + ((i * 41) % 75)}%` }}
                animate={{ y: [-6, -26], opacity: [0, 0.8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
              >
                <PixelArt map={starMap} className="w-4" />
              </motion.div>
            ))}
          </div>

          {/* mutlu pet + mesaj */}
          <div
            className="relative z-10 flex w-full max-w-[340px] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <PixelPet mood="happy" size={150} />
            </motion.div>
            <motion.div
              className="mt-4 rounded-3xl rounded-bl-md border-4 border-[#ffd77a] bg-[#fffaf4] px-5 py-4 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
              initial={{ scale: 0.8, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 1.4, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <p className="font-lcd text-[21px] leading-tight text-[#4a3b66]">
                <TypewriterText text={friendProfile.secrets.allFound} speed={26} />
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="font-pixel mt-4 cursor-pointer rounded-2xl border-b-[5px] border-[#b04d7e] bg-[#ff7bb1] px-8 py-3.5 text-[11px] text-white shadow-[0_8px_20px_rgba(255,107,157,0.5)] transition-transform hover:scale-105 active:translate-y-1"
              >
                {friendProfile.secrets.allFoundCta}
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
