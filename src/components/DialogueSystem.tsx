import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile, t } from '../data/friendProfile'
import { useGame } from '../state/GameContext'
import { sfx } from '../utils/sfx'
import { Panel } from './Panel'
import { PixelPet } from './PixelPet'
import { TypewriterText } from './TypewriterText'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function DialogueSystem({ onClose }: { onClose: () => void }) {
  const game = useGame()
  const [history, setHistory] = useState<string[]>([])
  const [current, setCurrent] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  // A stable little personality trait for this visit.
  const trait = useMemo(() => pick(friendProfile.personality), [])

  const talk = () => {
    const { dialogue } = friendProfile
    const talks = game.save.counts.talks
    let pool = dialogue.random
    if (talks >= 12 && Math.random() < 0.2) pool = dialogue.special
    else if (Math.random() < 0.25) pool = dialogue.greetings
    const line = pick(pool)

    sfx.talk()
    game.setMood('look')
    game.say(line, 5600)
    setCurrent(line)
    setKey((k) => k + 1)
    setHistory((h) => [...h, line].slice(-3))
    game.recordAction('talk')
    game.update((s) => ({
      ...s,
      stats: {
        ...s.stats,
        friendship: s.stats.friendship + 2,
        happiness: Math.min(100, s.stats.happiness + 2),
      },
    }))
    game.float('+2 DOSTLUK')
  }

  const L = friendProfile.labels

  return (
    <Panel onClose={onClose} title={L.talkTitle} emoji="💬" tone="pink">
      <div className="flex flex-col items-center gap-4 pt-1">
        {/* personality chip */}
        <p className="w-full rounded-xl border-2 border-dashed border-[#f0e4f6] bg-white/60 px-3 py-2 text-center font-lcd text-[14px] leading-tight text-[#a08dc0]">
          {friendProfile.ui.talkTraitPrefix} {trait}
        </p>

        <div className="relative flex h-36 w-full items-center justify-center">
          <PixelPet mood={game.mood === 'look' || game.mood === 'talk' ? game.mood : 'idle'} size={120} className="mt-6" />
          <div className="pointer-events-none absolute top-0 left-1/2 w-[92%] -translate-x-1/2">
            <motion.div
              key={current ? `${current}-${key}` : 'empty'}
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-2xl rounded-bl-md border-2 border-[#c9b6ff] bg-[#faf4ff] px-3 py-2 text-center shadow"
            >
              {current ? (
                <TypewriterText key={key} text={current} speed={20} className="font-lcd text-[15px] leading-tight text-[#5b4a8a]" />
              ) : (
                <span className="font-lcd text-[15px] text-[#b39ac4]">{friendProfile.ui.talkWaiting}</span>
              )}
            </motion.div>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={talk}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.93, y: 3 }}
          className="font-pixel rounded-2xl border-b-4 border-[#f48fb4] bg-[#ffc3da] px-8 py-4 text-[11px] text-[#7a3357] shadow-[0_8px_20px_rgba(255,107,157,0.35)]"
        >
          💬 {L.talkButton}
        </motion.button>

        {history.length > 0 && (
          <div className="w-full rounded-2xl border-2 border-[#f0e4f6] bg-white/60 px-4 py-3">
            <p className="mb-1.5 font-pixel text-[8px] text-[#b39ac4]">{L.talkRecent}</p>
            <ul className="flex flex-col gap-1">
              {history.map((line, i) => (
                <li
                  key={`${i}-${line}`}
                  className={`font-lcd text-[15px] leading-tight text-[#8a75a8] ${i === history.length - 1 ? '' : 'opacity-60'}`}
                >
                  {friendProfile.ui.talkBullet} {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-center font-lcd text-[13px] leading-tight text-[#a08dc0]">
          {t(friendProfile.ui.talkCount, { sayi: game.save.counts.talks })}
          <br />({L.talkHint})
        </p>
      </div>
    </Panel>
  )
}
