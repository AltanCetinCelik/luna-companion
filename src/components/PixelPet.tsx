import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { petFrames } from '../pixelart'
import type { PetMood } from '../state/GameContext'
import { PixelArt } from './PixelArt'

interface PixelPetProps {
  mood: PetMood
  size?: number
  className?: string
}

const FRAME_FOR_MOOD: Record<PetMood, keyof typeof petFrames> = {
  idle: 'idle',
  happy: 'happy',
  excited: 'happy',
  eat: 'eat',
  love: 'love',
  embarrassed: 'embarrassed',
  look: 'look',
  talk: 'talk',
  sleep: 'sleep',
}

/**
 * The little virtual human herself.
 * Her face and animation change with her mood:
 *  BESLE  → chews happily   OYNA  → bounces with energy
 *  SEVGİ  → embarrassed blush + hearts   KONUŞ  → leans toward you
 *  UYU    → lies down, breathes   tickle → giggles
 */
export function PixelPet({ mood, size = 168, className }: PixelPetProps) {
  const [blinking, setBlinking] = useState(false)

  // Random blinks.
  useEffect(() => {
    let blinkTimer = 0
    let offTimer = 0
    const blink = () => {
      setBlinking(true)
      offTimer = window.setTimeout(() => setBlinking(false), 240)
      blinkTimer = window.setTimeout(blink, 2600 + Math.random() * 2400)
    }
    blinkTimer = window.setTimeout(blink, 2200 + Math.random() * 2000)
    return () => {
      clearTimeout(blinkTimer)
      clearTimeout(offTimer)
    }
  }, [])

  const frame = mood === 'idle' && blinking ? petFrames.blink : petFrames[FRAME_FOR_MOOD[mood]]
  const sleeping = mood === 'sleep'

  const motionStyle =
    sleeping
      ? { rotate: 90, scale: [1, 1.04, 1], y: 0 }
      : mood === 'excited'
        ? { rotate: [0, -4, 4, 0], y: [0, -10, 0], scale: [1, 1.06, 1] }
        : mood === 'happy'
          ? { rotate: [0, -4, 4, 0], y: [0, -5, 0] }
          : mood === 'eat'
            ? { rotate: [0, -3, 3, 0], y: [0, -3, 0] }
            : mood === 'embarrassed'
              ? { rotate: [0, -2, 2, 0], y: [0, -2, 0] }
              : mood === 'look' || mood === 'talk'
                ? { rotate: [-5, -3, -5], y: [0, -2, 0] }
                : mood === 'love'
                  ? { scale: [1, 1.07, 1] }
                  : { rotate: [0, 1, -1, 0], y: [0, -3, 0] }

  const motionDuration =
    sleeping ? 1.9 : mood === 'excited' ? 0.55 : mood === 'happy' ? 0.7 : mood === 'idle' ? 3.4 : 1.6

  return (
    <motion.div
      className={className}
      animate={motionStyle}
      transition={{ duration: motionDuration, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
    >
      <motion.div
        key={mood === 'idle' && blinking ? 'blink' : mood}
        initial={{ scale: 0.82, y: 6 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 16 }}
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 0 rgba(74,59,102,0.25))' }}
      >
        <PixelArt map={frame} pixel={2} alt={friendProfile.ui.petAlt} style={{ width: '100%', height: '100%' }} />
      </motion.div>
    </motion.div>
  )
}
