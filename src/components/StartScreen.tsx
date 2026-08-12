import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { bowMap, heartMap, sparkleMap, starMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { sfx, unlockAudio } from '../utils/sfx'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'

interface StartScreenProps {
  onStart: () => void
}

/**
 * The packaging: a tiny retro toy-box product screen.
 * "✦ AYBİKE ✦ / SANAL ARKADAŞ / [ BAŞLA ] / Sürüm 1.0"
 * Sürüm 1.0 yalan. Blurb bunu biliyor.
 */
export function StartScreen({ onStart }: StartScreenProps) {
  const { save } = useGame()
  const [booting, setBooting] = useState(false)
  const bootTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (bootTimer.current) clearTimeout(bootTimer.current)
    },
    [],
  )

  const handleStart = () => {
    unlockAudio()
    sfx.start()
    setBooting(true)
    bootTimer.current = window.setTimeout(onStart, 850)
  }

  const blurbLines = friendProfile.product.blurb.split('\n')
  const returning = save.visitCount > 1

  return (
    <motion.div
      key="start"
      className="flex w-full flex-col items-center px-4 pb-10 pt-6 sm:pt-12"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
      transition={{ duration: 0.4 }}
    >
      {returning && (
        <motion.div
          className="mb-4 rounded-full border-2 border-white/80 bg-white/60 px-5 py-2 text-center backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="font-pixel text-[9px] text-[#b04478]">{friendProfile.returnGreeting}</p>
          <p className="font-lcd mt-0.5 text-[13px] text-[#a08dc0]">
            {friendProfile.labels.visit} #{save.visitCount}
          </p>
        </motion.div>
      )}

      <motion.div
        className="relative w-full max-w-[400px] rounded-[2.4rem] border-4 border-white/90 bg-gradient-to-b from-[#fff8fd] to-[#f4eaff] p-6 shadow-[0_30px_80px_rgba(74,59,102,0.28)] sm:p-8"
        animate={{ y: [0, -7, 0], rotate: [-0.4, 0.4, -0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* stickers */}
        <motion.div
          className="absolute -top-5 -left-4 rotate-[-14deg] sm:-left-6"
          animate={{ rotate: [-16, -12, -16] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          <PixelArt map={bowMap} className="w-16 drop-shadow-lg" />
        </motion.div>
        <motion.div
          className="absolute -top-3 -right-4 rotate-[12deg] sm:-right-6"
          animate={{ rotate: [10, 14, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          <PixelArt map={starMap} className="w-14 drop-shadow-lg" />
        </motion.div>
        <motion.div
          className="absolute -bottom-4 -left-3 rotate-[-8deg]"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          <PixelArt map={heartMap} className="w-10 drop-shadow-lg" />
        </motion.div>

        {/* brand chip */}
        <div className="mb-4 flex justify-center">
          <span className="font-pixel rounded-full border-2 border-[#e3cfe6] bg-white/70 px-4 py-1.5 text-[8px] tracking-wider text-[#b39ac4]">
            {friendProfile.product.title}
          </span>
        </div>

        {/* mini LCD window with the pet peeking */}
        <div className="lcd relative mx-auto w-fit rounded-2xl p-2" style={{ background: 'var(--c-screen)' }}>
          <div className="scanlines pointer-events-none absolute inset-0 z-10 rounded-2xl" aria-hidden />
          <div className="pixel-grid pointer-events-none absolute inset-0 z-10 rounded-2xl" aria-hidden />
          <PixelPet mood="idle" size={92} className="mx-auto" />
          <motion.div
            className="absolute top-1.5 right-2 z-10 h-1.5 w-1.5 rounded-full"
            animate={{ opacity: [1, 0.2, 1], boxShadow: ['0 0 4px #ff7bb1', '0 0 10px #ff7bb1', '0 0 4px #ff7bb1'] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ background: '#ff7bb1' }}
            aria-hidden
          />
        </div>

        {/* title */}
        <div className="mt-5 text-center">
          <h1
            className="font-pixel bg-gradient-to-r from-[#ff5f9e] via-[#b06ff2] to-[#5fb7f2] bg-clip-text text-[26px] leading-snug text-transparent sm:text-[30px]"
            style={{ WebkitTextStroke: '0.5px rgba(74,59,102,0.25)' }}
          >
            ✦ {friendProfile.name} ✦
          </h1>
          <p className="font-pixel mt-3 text-[10px] tracking-[0.3em] text-[#8a75a8] sm:text-[11px]">
            {friendProfile.product.subtitle}
          </p>
        </div>

        <div className="mx-auto my-4 flex max-w-[240px] items-center gap-2" aria-hidden>
          <span className="h-px flex-1 bg-[#e6cfe6]" />
          <PixelArt map={sparkleMap} pixel={1} className="w-3.5" />
          <PixelArt map={heartMap} pixel={1} className="w-4" />
          <PixelArt map={sparkleMap} pixel={1} className="w-3.5" />
          <span className="h-px flex-1 bg-[#e6cfe6]" />
        </div>

        {/* blurb */}
        <div className="mx-auto max-w-[280px] rounded-2xl border-2 border-dashed border-[#e3cfe6] bg-white/60 px-4 py-3">
          {blurbLines.map((line) => (
            <p key={line} className="font-lcd text-center text-[16px] leading-tight text-[#7a649d]">
              {line}
            </p>
          ))}
        </div>

        {/* START */}
        <div className="mt-6 flex justify-center">
          <motion.button
            type="button"
            onClick={handleStart}
            disabled={booting}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.93, y: 4 }}
            className="font-pixel relative rounded-2xl border-b-[6px] px-10 py-4 text-[13px] text-white shadow-[0_10px_24px_rgba(255,107,157,0.45)] disabled:opacity-70 sm:text-[14px]"
            style={{
              background: 'linear-gradient(180deg, #ff9dc4, var(--c-accent))',
              borderColor: 'var(--c-accent)',
            }}
          >
            {booting ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                {friendProfile.labels.loading}
              </span>
            ) : (
              <>
                <span className="absolute -top-2 -right-2 text-sm" aria-hidden>
                  ✨
                </span>
                ▶ {friendProfile.labels.start}
              </>
            )}
          </motion.button>
        </div>

        {/* version — artık gizli değil, ana ekranda sürüm başlığında */}
        <div className="mt-4 text-center">
          <span className="font-pixel rounded-lg px-2 py-1 text-[9px] text-[#b39ac4]">
            {friendProfile.product.version}
          </span>
        </div>

        {/* fake barcode + fine print */}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div
            className="h-9 w-24 opacity-80"
            style={{
              background:
                'repeating-linear-gradient(90deg, #4a3b66 0 2px, transparent 2px 5px, #4a3b66 5px 8px, transparent 8px 11px, #4a3b66 11px 12px, transparent 12px 16px)',
            }}
            aria-hidden
          />
          {friendProfile.product.finePrint.split('\n').map((line) => (
            <p key={line} className="font-lcd text-right text-[12px] leading-tight text-[#a08dc0]">
              {line}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
