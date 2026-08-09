import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { friendProfile } from '../data/friendProfile'
import { sfx } from '../utils/sfx'

interface PanelProps {
  onClose: () => void
  title: string
  emoji: string
  children: ReactNode
  tone?: 'pink' | 'lavender' | 'blue'
}

const TONES = {
  pink: 'border-[#f3a8c4]',
  lavender: 'border-[#c3a8f0]',
  blue: 'border-[#a3cdea]',
}

/** Bottom sheet on mobile, floating card on desktop. */
export function Panel({ onClose, title, emoji, children, tone = 'pink' }: PanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape closes the panel; focus moves into it so keyboard users aren't stranded.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#2b2350]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        className={`max-h-[86dvh] w-full overflow-hidden rounded-t-[2rem] border-4 bg-[#fffaf4] shadow-[0_20px_60px_rgba(43,35,80,0.4)] sm:max-w-md sm:rounded-[2rem] ${TONES[tone]}`}
        initial={{ y: 120, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#f3e0ec] px-5 py-4">
          <h2 className="font-pixel text-[11px] text-[#4a3b66] sm:text-[12px]">
            <span className="mr-2" aria-hidden>
              {emoji}
            </span>
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => {
              sfx.click()
              onClose()
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#ffe9f3] font-pixel text-[10px] text-[#a85c7c] transition-transform hover:rotate-90 hover:bg-[#ffd3e6] active:scale-90"
            aria-label={friendProfile.labels.close}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-4">{children}</div>
      </motion.div>
    </motion.div>
  )
}
