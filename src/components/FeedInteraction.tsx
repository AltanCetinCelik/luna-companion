import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile, t } from '../data/friendProfile'
import { donutMap, strawberryMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { sfx } from '../utils/sfx'
import { Panel } from './Panel'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function FeedInteraction({ onClose }: { onClose: () => void }) {
  const game = useGame()
  const [phase, setPhase] = useState<'ready' | 'eating' | 'done'>('ready')
  const [message, setMessage] = useState('')
  const food = useRef(Math.random() < 0.5 ? strawberryMap : donutMap).current
  const foodName = food === strawberryMap ? friendProfile.ui.foodStrawberry : friendProfile.ui.foodDonut

  const feed = () => {
    sfx.feed()
    game.setMood('excited')
    setPhase('eating')
    window.setTimeout(() => {
      const msg = pick(friendProfile.feedMessages)
      setMessage(msg)
      game.say(msg, 4200)
      game.recordAction('feed')
      game.update((s) => ({
        ...s,
        stats: {
          ...s.stats,
          energy: Math.min(100, s.stats.energy + 15),
          happiness: Math.min(100, s.stats.happiness + 5),
          chaos: s.stats.chaos + 2,
        },
      }))
      game.float(friendProfile.ui.feedEnergyGain)
      setPhase('done')
    }, 1250)
  }

  return (
    <Panel onClose={onClose} title={friendProfile.labels.feedTitle} emoji="🍪">
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* the pet, with food flying to her mouth */}
        <div className="relative flex h-40 w-full items-center justify-center">
          <PixelPet mood={phase === 'eating' ? 'eat' : 'idle'} size={140} className="mt-10" />

          {phase === 'eating' && (
            <motion.div
              className="absolute bottom-2 left-1/2 w-16 -translate-x-1/2"
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -150, opacity: [1, 1, 0], scale: [1, 0.92, 0.7], rotate: [0, 12, -6] }}
              transition={{ duration: 1.1, ease: 'easeIn' }}
              aria-hidden
            >
              <PixelArt map={food} className="w-full drop-shadow-lg" />
            </motion.div>
          )}
        </div>

        {phase === 'ready' && (
          <>
            <p className="font-lcd text-center text-[16px] leading-tight text-[#7a649d]">
              {t(friendProfile.ui.feedDetected, { yiyecek: foodName })
                .split('\n')
                .map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
            </p>
            <motion.button
              type="button"
              onClick={feed}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.92, y: 3 }}
              className="font-pixel rounded-2xl border-b-4 border-[#f48fb4] bg-[#ffc3da] px-8 py-4 text-[11px] text-[#7a3357] shadow-[0_8px_20px_rgba(255,107,157,0.35)]"
            >
              🍓 {friendProfile.labels.feedHer}
            </motion.button>
          </>
        )}

        {phase === 'eating' && (
          <p className="font-lcd animate-pulse text-center text-[16px] text-[#a08dc0]">
            {friendProfile.ui.feedChewing}
          </p>
        )}

        {phase === 'done' && (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="w-full rounded-2xl border-2 border-dashed border-[#f3a8c4] bg-[#fff0f6] px-4 py-3 text-center">
              <p className="font-pixel text-[11px] leading-relaxed text-[#b06a92]">{message}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPhase('ready')
                  setMessage('')
                }}
                className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#f48fb4] bg-[#ffdcec] px-5 py-3 text-[10px] text-[#8a4a6e] transition-transform hover:scale-105 active:translate-y-1"
              >
                🍓 {friendProfile.labels.feedAgain}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#c9b6e8] bg-[#ece2ff] px-5 py-3 text-[10px] text-[#5b4a8a] transition-transform hover:scale-105 active:translate-y-1"
              >
                {friendProfile.labels.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
