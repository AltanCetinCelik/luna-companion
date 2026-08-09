import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import type { PetAction } from '../state/persistence'
import { sfx, unlockAudio } from '../utils/sfx'

export type ActionId = PetAction

interface Burst {
  id: number
  dx: number
  dy: number
  emoji: string
}

interface ActionButtonProps {
  action: ActionId
  emoji: string
  onClick: () => void
  className?: string
  tone?: 'pink' | 'lavender' | 'blue' | 'cream' | 'mint'
}

const TONES: Record<NonNullable<ActionButtonProps['tone']>, { bg: string; edge: string; text: string }> = {
  pink: { bg: 'bg-[#ffc3da]', edge: 'shadow-[0_5px_0_#f48fb4,0_10px_18px_rgba(74,59,102,0.18)]', text: 'text-[#7a3357]' },
  lavender: { bg: 'bg-[#dccdfb]', edge: 'shadow-[0_5px_0_#b89de8,0_10px_18px_rgba(74,59,102,0.18)]', text: 'text-[#4a3366]' },
  blue: { bg: 'bg-[#cdeafc]', edge: 'shadow-[0_5px_0_#a3cdea,0_10px_18px_rgba(74,59,102,0.18)]', text: 'text-[#2f557a]' },
  cream: { bg: 'bg-[#fff3dc]', edge: 'shadow-[0_5px_0_#f0d9a8,0_10px_18px_rgba(74,59,102,0.18)]', text: 'text-[#6b4a2a]' },
  mint: { bg: 'bg-[#d3f0d9]', edge: 'shadow-[0_5px_0_#a8d9b5,0_10px_18px_rgba(74,59,102,0.18)]', text: 'text-[#2f5c3d]' },
}

const BURST_EMOJI = ['✨', '💖', '⭐']

/** A physical little toy button: dips on press, pops sparkles, sounds cute. */
export function ActionButton({ action, emoji, onClick, className = '', tone = 'pink' }: ActionButtonProps) {
  const [bursts, setBursts] = useState<Burst[]>([])
  const timersRef = useRef<number[]>([])
  const label = friendProfile.labels.actions[action]
  const t = TONES[tone]

  // clear any pending burst-removal timers if the button unmounts
  useEffect(
    () => () => {
      timersRef.current.forEach((id) => clearTimeout(id))
    },
    [],
  )

  const handleClick = () => {
    unlockAudio()
    sfx.click()
    // pop a few sparkles off the button
    const n = Math.floor(Math.random() * 1e9)
    const newBursts = Array.from({ length: 3 }).map((_, i) => ({
      id: n + i,
      dx: (Math.random() - 0.5) * 56,
      dy: -30 - Math.random() * 26,
      emoji: BURST_EMOJI[i % BURST_EMOJI.length],
    }))
    setBursts((b) => [...b, ...newBursts])
    timersRef.current.push(
      window.setTimeout(() => {
        setBursts((b) => b.filter((x) => !newBursts.some((nb) => nb.id === x.id)))
      }, 650),
    )
    onClick()
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onHoverStart={() => sfx.hover()}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ y: 5, scale: 0.92, boxShadow: '0 1px 0 rgba(74,59,102,0.15)' }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className={`relative flex select-none items-center justify-center gap-1.5 rounded-2xl border border-white/60 px-3 py-4 font-pixel text-[10px] leading-tight transition-shadow sm:text-[11px] ${t.bg} ${t.text} ${t.edge} ${className}`}
    >
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 text-sm"
            style={{ marginLeft: -8, marginTop: -8 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: b.dx, y: b.dy, opacity: 0, scale: 1.2, rotate: Math.random() * 60 - 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            aria-hidden
          >
            {b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
      <span
        className="text-lg transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6 sm:text-xl"
        aria-hidden
      >
        {emoji}
      </span>
      <span>{label}</span>
    </motion.button>
  )
}
