import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { heartMap } from '../pixelart'
import { sfx } from '../utils/sfx'
import { PixelArt } from './PixelArt'

interface ResetConfirmProps {
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Reset — but like a virtual pet, not a browser dialog.
 * Luna checks twice before forgetting everything. 🧸
 */
export function ResetConfirm({ onCancel, onConfirm }: ResetConfirmProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const L = friendProfile.labels

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    cancelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2b2350]/55 p-6 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={L.resetTitle}
    >
      <motion.div
        className="w-full max-w-[340px] rounded-[2rem] border-4 border-[#c9b6ff] bg-[#fffaf4] px-6 py-7 text-center shadow-[0_24px_70px_rgba(43,35,80,0.5)]"
        initial={{ scale: 0.7, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-3 w-fit"
          aria-hidden
        >
          <PixelArt map={heartMap} className="w-10" />
        </motion.div>

        <h3 className="font-pixel text-[12px] leading-relaxed text-[#6b4a68]">{L.resetTitle}</h3>
        {L.resetBody.map((line) => (
          <p key={line} className="mt-2 font-lcd text-[17px] leading-tight text-[#a08dc0]">
            {line}
          </p>
        ))}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              sfx.click()
              onConfirm()
            }}
            className="font-pixel cursor-pointer rounded-2xl border-b-[5px] border-[#ff8fa8] bg-[#ffb9cb] px-6 py-4 text-[11px] text-[#7a3357] shadow-[0_8px_20px_rgba(255,107,157,0.4)] transition-transform hover:scale-[1.03] active:translate-y-1"
          >
            {L.resetConfirm}
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={() => {
              sfx.click()
              onCancel()
            }}
            className="font-pixel cursor-pointer rounded-2xl border-b-[4px] border-[#c9b6e8] bg-[#ece2ff] px-6 py-3.5 text-[10px] text-[#5b4a8a] transition-transform hover:scale-[1.03] active:translate-y-1"
          >
            {L.resetCancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
