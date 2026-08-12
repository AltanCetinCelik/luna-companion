import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { heartMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { sfx } from '../utils/sfx'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'
import { SleepOverlay } from './SleepOverlay'
import { TypewriterText } from './TypewriterText'

interface PetScreenProps {
  onPetTap: () => void
  onPetLongPress: () => void
  onHeartTap: () => void
  onStarTap: () => void
  onWake: () => void
  onStoryTap: () => void
}

/**
 * The whole handheld: a pastel console shell wrapping a dark LCD.
 * CRT scanlines + pixel grid + vignette + glow, a speech bubble,
 * five little hearts, and a few very small secrets inside.
 */
export function PetScreen({
  onPetTap,
  onPetLongPress,
  onHeartTap,
  onStarTap,
  onWake,
  onStoryTap,
}: PetScreenProps) {
  const { mood, speech, save, floaties, triggerSecret } = useGame()
  const [heartPulse, setHeartPulse] = useState(0)
  const [glowKey, setGlowKey] = useState(0)
  const [storyTaps, setStoryTaps] = useState(0)
  const longPressTimer = useRef<number | null>(null)
  const storyTapTimer = useRef<number | null>(null)
  const feeds = save.counts.feeds

  // Beş küçük kalp → 3 dokunuş → gizli kitap (İLK SAYFA hikâyesi) açılır.
  const handleStoryFind = () => {
    sfx.pop()
    const n = storyTaps + 1
    setStoryTaps(n)
    if (storyTapTimer.current) clearTimeout(storyTapTimer.current)
    storyTapTimer.current = window.setTimeout(() => setStoryTaps(0), 2600)
    if (n >= 3) {
      setStoryTaps(0)
      triggerSecret('story', friendProfile.secrets.story)
    }
  }

  // Tiny hearts pulse every time she gets fed.
  useEffect(() => {
    if (feeds > 0) setHeartPulse((p) => p + 1)
  }, [feeds])

  // The LCD glows warmly whenever her mood changes.
  useEffect(() => {
    setGlowKey((k) => k + 1)
  }, [mood])

  const startLongPress = () => {
    longPressTimer.current = window.setTimeout(() => {
      onPetLongPress()
    }, 680)
  }
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <div className="relative w-full max-w-[390px]">
      {/* console shell */}
      <div
        className="relative rounded-[2.6rem] border-4 border-white/80 p-4 pb-6 shadow-[0_24px_60px_rgba(74,59,102,0.28)] sm:p-5"
        style={{ background: 'var(--c-shell)' }}
      >
        {/* tiny logo bar */}
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="font-pixel text-[8px] tracking-wider text-[#c29ac4]">{friendProfile.labels.brand}</span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff7bb1]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffd77a]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#9fd4f0]" />
          </span>
        </div>

        {/* LCD */}
        <div className="lcd rounded-[1.7rem] p-2.5 sm:p-3" style={{ background: 'var(--c-screen)' }}>
          <div className="lcd-glass relative overflow-hidden rounded-2xl border border-white/10">
            {/* CRT layers */}
            <div className="scanlines pointer-events-none absolute inset-0 z-20" aria-hidden />
            <div className="pixel-grid pointer-events-none absolute inset-0 z-20" aria-hidden />
            <div className="vignette pointer-events-none absolute inset-0 z-20" aria-hidden />

            {/* mood glow */}
            <AnimatePresence>
              {mood !== 'idle' && mood !== 'sleep' && (
                <motion.div
                  key={`glow-${glowKey}`}
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,123,177,0.35), transparent 65%)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.35] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  aria-hidden
                />
              )}
            </AnimatePresence>

            <div className="relative px-3 pb-3 pt-2.5">
              {/* header row */}
              <div className="flex items-center justify-between text-[#ffb8d9]">
                <button
                  type="button"
                  onClick={onHeartTap}
                  className="font-lcd cursor-pointer text-[15px] leading-none transition-transform hover:scale-125 active:scale-90"
                  aria-label={friendProfile.ui.heartAria}
                  title={friendProfile.ui.heartTitle}
                >
                  ♥
                </button>
                <span className="font-lcd text-[17px] tracking-[0.2em] text-[#ffc9de]">
                  {friendProfile.name}
                </span>
                <span className="flex items-center gap-[2px]" aria-hidden>
                  <span className="h-2 w-[3px] rounded-[1px] bg-[#ffd77a]" />
                  <span className="h-3 w-[3px] rounded-[1px] bg-[#ffd77a]" />
                  <span className="h-4 w-[3px] rounded-[1px] bg-[#ffd77a]" />
                </span>
              </div>

              {/* pet area */}
              <div
                className="relative mt-1 flex h-52 items-center justify-center sm:h-56"
                onPointerDown={startLongPress}
                onPointerUp={cancelLongPress}
                onPointerLeave={cancelLongPress}
                onPointerCancel={cancelLongPress}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* speech bubble */}
                <div className="pointer-events-none absolute top-0 left-1/2 z-10 w-[88%] -translate-x-1/2">
                  <AnimatePresence>
                    {speech && (
                      <motion.div
                        key={speech.id}
                        initial={{ opacity: 0, y: 8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                        className="rounded-2xl rounded-bl-md border-2 border-[#ffb8d9] bg-[#fffaf4] px-3 py-2 text-center shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                      >
                        <TypewriterText text={speech.text} className="font-lcd text-[15px] leading-tight text-[#4a3b66]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* the pet herself — taps & long-presses land here */}
                <button
                  type="button"
                  onClick={onPetTap}
                  onContextMenu={(e) => e.preventDefault()}
                  className="relative mt-4 block cursor-pointer touch-manipulation select-none"
                  aria-label={friendProfile.ui.petAria}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <PixelPet mood={mood} size={150} className="sm:hidden" />
                  <PixelPet mood={mood} size={170} className="hidden sm:block" />
                </button>

                {/* little rising hearts after feeding */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <motion.div
                    key={`f-${heartPulse}-${i}`}
                    className="pointer-events-none absolute bottom-6"
                    style={{ left: i === 0 ? '22%' : '68%' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -34 }}
                    transition={{ duration: 1.6, delay: i * 0.25, ease: 'easeOut' }}
                    aria-hidden
                  >
                    <PixelArt map={heartMap} className="w-4" />
                  </motion.div>
                ))}
              </div>

              {/* beş küçük kalp — 3 dokunuş gizli kitabı açar (İLK SAYFA) */}
              <button
                type="button"
                onClick={handleStoryFind}
                className="mt-1 flex cursor-pointer items-center justify-center gap-2"
                aria-label={friendProfile.ui.heartsStoryAria}
                title={friendProfile.ui.heartsStoryAria}
              >
                {Array.from({ length: friendProfile.heartsRow }).map((_, i) => (
                  <motion.div
                    key={`${heartPulse}-${i}`}
                    initial={heartPulse > 0 ? { scale: 0.7 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14, delay: i * 0.05 }}
                    className={heartPulse > 0 && i < 1 + (feeds % 5) ? '' : 'opacity-80'}
                  >
                    <PixelArt map={heartMap} pixel={1} className="w-4 sm:w-5" />
                  </motion.div>
                ))}
              </button>
            </div>

            {/* the secret pixel — a tiny dot in the corner */}
            <button
              type="button"
              onClick={onStarTap}
              className="absolute right-1.5 bottom-1.5 z-30 h-2 w-2 cursor-pointer rounded-full bg-[#463c6e] transition-all hover:scale-150 hover:bg-[#ffd77a]"
              aria-label={friendProfile.ui.secretPixelAria}
              title={friendProfile.ui.secretPixelTitle}
            />

            {/* gizli kitap — hikâye gizlisi bulununca belirir (tekrar dinlemek + final kapağı) */}
            {save.eggsFound.includes('story') && (
              <motion.button
                type="button"
                onClick={onStoryTap}
                className="absolute bottom-1.5 left-1.5 z-30 grid h-6 w-6 cursor-pointer place-items-center rounded-md bg-[#3b3160] text-[11px] opacity-70 transition-all hover:scale-125 hover:opacity-100"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                aria-label={friendProfile.story.entryAria}
                title={friendProfile.story.entryTitle}
              >
                📖
              </motion.button>
            )}

            {/* night overlay */}
            <SleepOverlay onWake={onWake} />
          </div>
        </div>

        {/* fake speaker grille */}
        <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#e6c9e2]" />
          ))}
        </div>
      </div>

      {/* floating stat chips */}
      <div className="pointer-events-none absolute -top-2 right-1 z-30">
        {floaties.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: -46, x: [0, -6, 6, 0] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className={`font-pixel whitespace-nowrap text-[9px] shadow-[0_2px_0_rgba(74,59,102,0.2)] ${
              f.kind === 'up' ? 'text-[#ff6fa5]' : 'text-[#b48be8]'
            }`}
            style={{ textShadow: '0 1px 0 #fff' }}
          >
            {f.text}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
