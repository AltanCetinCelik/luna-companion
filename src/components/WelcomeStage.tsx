import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { heartMap, starMap } from '../pixelart'
import { buildWelcomeScript } from '../state/returnDialogue'
import { useGame } from '../state/GameContext'
import { sfx, unlockAudio } from '../utils/sfx'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'
import { TypewriterText } from './TypewriterText'

interface WelcomeStageProps {
  onDone: () => void
}

/**
 * The return experience — Luna noticing the visitor.
 *
 * First ever visit:   "Merhaba... 👀 / Sen kimsin? / Ben LUNA. / Sanırım seni
 *                     bekliyordum." → [ TANIŞALIM ♥ ]
 * Return visits:      time-aware + remembers what they did → [ DEVAM ET ]
 * Rare special moment: the screen dims, "… Özledim seni. Hoş geldin. ♥"
 *                     → [ BURADAYIM ]
 *
 * Every line comes from src/data/friendProfile.ts → welcome.
 */
export function WelcomeStage({ onDone }: WelcomeStageProps) {
  const game = useGame()
  // Memoize on the actual inputs (not the whole save object) so unrelated
  // writes — e.g. a background save sync — can't re-roll the script mid-scene.
  const script = useMemo(() => buildWelcomeScript(game.save), [
    game.save.visitCount,
    game.save.welcomedVisit,
    game.save.lastGapMs,
    game.save.lastAction,
    game.save.highScore,
    game.save.recentActions,
    game.save.counts,
  ])

  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState(false)

  const total = script.lines.length
  const finished = idx >= total
  const line = finished ? null : script.lines[idx]

  // A freshly shown line starts typing from zero.
  useEffect(() => {
    setTyped(false)
  }, [idx])

  // After a line finishes typing, pause — then show the next one.
  useEffect(() => {
    if (finished || !typed) return
    const lineIsDot = script.lines[idx] === '…'
    const pause = script.emotional ? (lineIsDot ? 1600 : 950) : 850
    const t = window.setTimeout(() => setIdx((i) => i + 1), pause)
    return () => clearTimeout(t)
  }, [idx, typed, finished, script])

  // Tap anywhere to hurry the moment along (never skips past the CTA).
  const skip = () => {
    if (!finished) setIdx(total)
  }

  const handleDone = () => {
    unlockAudio()
    sfx.start()
    onDone()
  }

  const L = friendProfile.labels

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 ${
        script.emotional ? 'bg-[#241d45]/75' : 'bg-[#2b2350]/55'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      onClick={skip}
      role="dialog"
      aria-modal="true"
      aria-label={friendProfile.ui.welcomeAria}
    >
      {/* dreamy glow behind her */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            script.emotional
              ? 'radial-gradient(circle, rgba(255,123,177,0.28), transparent 62%)'
              : 'radial-gradient(circle, rgba(255,214,232,0.22), transparent 62%)',
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      {/* visit badge */}
      {script.badge && (
        <motion.span
          className="font-pixel relative z-10 rounded-full border-2 border-white/50 bg-white/15 px-4 py-1.5 text-[8px] tracking-wider text-[#ffd6e8]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ✦ {script.badge} ✦
        </motion.span>
      )}

      {/* her + the bubble */}
      <div className="relative z-10 mt-6 flex w-full max-w-[340px] flex-col items-center">
        <div className="pointer-events-none relative flex min-h-[110px] w-full items-end justify-center">
          <div className="absolute inset-x-0 top-0">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`rounded-2xl rounded-bl-md border-2 px-4 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
                script.emotional ? 'border-[#c9b6ff] bg-[#f6f0ff]' : 'border-[#ffb8d9] bg-[#fffaf4]'
              }`}
            >
              {finished ? (
                <span className="font-lcd text-[19px] leading-tight text-[#b39ac4]">…</span>
              ) : (
                <TypewriterText
                  key={idx}
                  text={line ?? ''}
                  speed={script.emotional ? 30 : 26}
                  onDone={() => setTyped(true)}
                  className="font-lcd text-[19px] leading-tight text-[#4a3b66]"
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Luna herself — waving / excited when she recognizes the visitor */}
        <PixelPet
          mood={script.emotional ? 'idle' : script.cta === L.ctaMeet ? 'idle' : 'happy'}
          size={160}
          className={script.emotional ? 'mt-6 scale-110' : 'mt-5'}
        />

        {/* floating hearts during the emotional moment */}
        {script.emotional && (
          <>
            <motion.div
              className="pointer-events-none absolute left-[6%] top-1/3 text-xl"
              animate={{ y: [-8, -40], opacity: [0, 1, 0], rotate: [0, 10, -6] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
              aria-hidden
            >
              <PixelArt map={heartMap} className="w-6" />
            </motion.div>
            <motion.div
              className="pointer-events-none absolute right-[6%] top-1/3 text-xl"
              animate={{ y: [-6, -46], opacity: [0, 1, 0], rotate: [0, -10, 8] }}
              transition={{ duration: 3.4, repeat: Infinity, delay: 1 }}
              aria-hidden
            >
              <PixelArt map={heartMap} className="w-5" />
            </motion.div>
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2"
              animate={{ y: [-4, -30], opacity: [0, 1, 0], rotate: [0, 12] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 0.2 }}
              aria-hidden
            >
              <PixelArt map={starMap} className="w-5" />
            </motion.div>
          </>
        )}
      </div>

      {/* the CTA appears once she's done speaking */}
      <div className="relative z-10 mt-10 min-h-[64px]">
        <CtaButton show={finished} label={script.cta} onClick={handleDone} />
      </div>

      <p className="relative z-10 mt-4 font-lcd text-[13px] text-[#c9b8f0]">
        {friendProfile.ui.welcomeTapHint}
      </p>
    </motion.div>
  )
}

function CtaButton({ show, label, onClick }: { show: boolean; label: string; onClick: () => void }) {
  if (!show) return null
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.93, y: 3 }}
      className="font-pixel relative rounded-2xl border-b-[6px] px-10 py-4 text-[12px] text-white shadow-[0_10px_26px_rgba(255,107,157,0.5)]"
      style={{
        background: 'linear-gradient(180deg, #ff9dc4, var(--c-accent))',
        borderColor: 'var(--c-accent)',
      }}
    >
      <motion.span
        className="absolute -top-2 -right-2 text-sm"
        animate={{ rotate: [0, 12, -6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        aria-hidden
      >
        ✨
      </motion.span>
      {label}
    </motion.button>
  )
}
