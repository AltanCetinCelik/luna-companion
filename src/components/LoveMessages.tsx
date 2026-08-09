import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile, friendshipLevel, isUnlocked, t } from '../data/friendProfile'
import type { LoveMessage } from '../data/friendProfile'
import { heartMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { sfx } from '../utils/sfx'
import { Panel } from './Panel'
import { PixelArt } from './PixelArt'
import { PixelPet } from './PixelPet'

function hintFor(msg: LoveMessage, missing: { talkCount: number; plays: number; friendship: number }): string {
  const u = msg.unlock
  if (u === 'start') return ''
  if (u.talkCount !== undefined && missing.talkCount > 0) {
    return t(friendProfile.ui.loveHintTalk, { kalan: missing.talkCount })
  }
  if (u.plays !== undefined && missing.plays > 0) {
    return t(friendProfile.ui.loveHintPlay, { kalan: missing.plays })
  }
  if (u.friendship !== undefined && missing.friendship > 0) return friendProfile.ui.loveHintFriendship
  return ''
}

type Step = 'back' | 'flipping' | 'front'

export function LoveMessages({ onClose }: { onClose: () => void }) {
  const { save, setMood } = useGame()
  const counts = save.counts
  const level = friendshipLevel({ talkCount: counts.talks, plays: counts.plays })
  const messages = friendProfile.loveMessages

  const revealedCount = messages.filter((m) =>
    isUnlocked(m, { talkCount: counts.talks, plays: counts.plays, friendship: level }),
  ).length

  const [pos, setPos] = useState(0)
  const [step, setStep] = useState<Step>('back')
  const [hint, setHint] = useState<string | null>(null)
  const [opened, setOpened] = useState<LoveMessage[]>([])
  const flipTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (flipTimer.current) clearTimeout(flipTimer.current)
    },
    [],
  )

  const current = messages[pos]
  const allOpen = pos >= messages.length
  const cardUnlocked = pos < revealedCount
  const missing =
    current && current.unlock !== 'start'
      ? {
          talkCount: current.unlock.talkCount !== undefined ? Math.max(0, current.unlock.talkCount - counts.talks) : 0,
          plays: current.unlock.plays !== undefined ? Math.max(0, current.unlock.plays - counts.plays) : 0,
          friendship: current.unlock.friendship !== undefined ? Math.max(0, current.unlock.friendship - level) : 0,
        }
      : { talkCount: 0, plays: 0, friendship: 0 }

  // Embarrassed blush while reading her cards.
  useEffect(() => {
    setMood('embarrassed')
  }, [setMood])

  const openCard = () => {
    if (step !== 'back') return
    sfx.love()
    setStep('flipping')
    flipTimer.current = window.setTimeout(() => {
      setStep('front')
      setOpened((o) => (o.some((m) => m.text === current?.text) ? o : [...o, current]))
    }, 550)
  }

  const nextCard = () => {
    sfx.click()
    setPos((p) => p + 1)
    setStep('back')
    setHint(null)
  }

  const tryLocked = () => {
    sfx.talk()
    setHint(hintFor(current, missing))
  }

  const L = friendProfile.labels

  return (
    <Panel onClose={onClose} title={L.loveTitle} emoji="💌">
      <div className="flex flex-col gap-4 pb-1 pt-1">
        {/* the embarrassed pet, with hearts floating around her */}
        <div className="relative flex h-24 items-center justify-center">
          <PixelPet mood="embarrassed" size={92} />
          {['18%', '70%', '45%'].map((left, i) => (
            <motion.span
              key={i}
              className="absolute text-sm"
              style={{ left }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -30, rotate: [0, 12, -8] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
              aria-hidden
            >
              💗
            </motion.span>
          ))}
        </div>

        {/* friendship progress */}
        <div className="rounded-2xl border-2 border-[#f3d4e6] bg-[#fff5fb] px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-pixel text-[8px] text-[#b06a92]">{L.friendshipLevel}</span>
            <span className="font-pixel text-[8px] text-[#b06a92]">{level}%</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="h-2.5 flex-1 rounded-[2px]"
                style={{ background: i < Math.round(level / 5) ? '#ff7bb1' : 'rgba(255,123,177,0.18)' }}
              />
            ))}
          </div>
          <p className="mt-1.5 font-lcd text-[13px] leading-tight text-[#a08dc0]">
            {revealedCount}/{messages.length} {L.loveProgress}
          </p>
        </div>

        {hint && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-[#fff0d9] px-3 py-2 text-center font-lcd text-[14px] text-[#8a5a2a]"
          >
            {t(friendProfile.ui.loveLockedToast, { ipucu: hint })}
          </motion.p>
        )}

        {/* the card deck */}
        <div className="flex min-h-[190px] flex-col items-center gap-3" style={{ perspective: 1000 }}>
          {allOpen ? (
            <div className="flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#f3a8c4] bg-[#fff0f6] px-4 py-6 text-center">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-3xl"
                aria-hidden
              >
                💝
              </motion.span>
              <p className="font-pixel text-[11px] leading-relaxed text-[#b04478]">{L.loveAllOpen}</p>
            </div>
          ) : (
            <>
              <div className="relative h-44 w-full" style={{ transformStyle: 'preserve-3d' }}>
                <motion.div
                  className="relative h-full w-full"
                  animate={{ rotateY: step === 'back' ? 0 : 180 }}
                  transition={{ duration: 0.55, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* back face */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-4 border-[#ffb8d9] bg-gradient-to-br from-[#ffd6e8] to-[#f3e4ff] shadow-[0_10px_24px_rgba(255,123,177,0.3)]"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <PixelArt map={heartMap} className="w-10 opacity-90" />
                    <p className="font-pixel text-[9px] text-[#b04478]">
                      {cardUnlocked
                        ? t(friendProfile.ui.loveCardBack, { no: pos + 1 })
                        : friendProfile.ui.loveCardLocked}
                    </p>
                  </div>
                  {/* front face */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border-4 border-[#f3a8c4] bg-gradient-to-br from-[#fff0f6] to-[#f6ecff] px-4 text-center shadow-[0_10px_24px_rgba(255,123,177,0.25)]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="font-pixel grid h-8 w-8 place-items-center rounded-lg bg-[#ffd6e8] text-[10px] text-[#b04478]">
                      {pos + 1}
                    </span>
                    <p className="font-lcd text-[18px] leading-snug text-[#6b4a68]">{current?.text}</p>
                  </div>
                </motion.div>
              </div>

              {step === 'back' && cardUnlocked && (
                <motion.button
                  type="button"
                  onClick={openCard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93, y: 2 }}
                  className="font-pixel rounded-2xl border-b-4 border-[#f48fb4] bg-[#ffc3da] px-8 py-3.5 text-[10px] text-[#7a3357] shadow-[0_6px_16px_rgba(255,107,157,0.3)]"
                >
                  💌 {L.loveOpen}
                </motion.button>
              )}
              {step === 'back' && !cardUnlocked && (
                <button
                  type="button"
                  onClick={tryLocked}
                  className="font-pixel cursor-pointer rounded-2xl border-b-4 border-[#d9c4e6] bg-[#f1e8f8] px-8 py-3.5 text-[10px] text-[#8a75a8] transition-transform hover:scale-105 active:translate-y-1"
                >
                  {friendProfile.ui.loveLockedButton}
                </button>
              )}
              {step === 'front' && (
                <motion.button
                  type="button"
                  onClick={nextCard}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.94, y: 2 }}
                  className="font-pixel cursor-pointer rounded-2xl border-b-4 border-[#b89de8] bg-[#ece2ff] px-8 py-3.5 text-[10px] text-[#5b4a8a] transition-transform hover:scale-105"
                >
                  {pos + 1 < revealedCount ? `➜ ${L.loveNext}` : friendProfile.ui.loveDeckDone}
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* already-opened cards, kept small */}
        {opened.length > 0 && (
          <div className="rounded-2xl border-2 border-[#f0e4f6] bg-white/60 px-4 py-3">
            <p className="mb-1.5 font-pixel text-[8px] text-[#b39ac4]">{friendProfile.ui.loveOpenedTitle}</p>
            <ul className="flex flex-col gap-1">
              {opened.map((m, i) => (
                <li key={`${i}-${m.text}`} className="font-lcd text-[15px] leading-tight text-[#8a75a8]">
                  {friendProfile.ui.loveBullet} {m.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="pt-1 text-center font-lcd text-[13px] text-[#a08dc0]">
          {t(friendProfile.ui.loveFooter, { sohbet: counts.talks, oyun: counts.plays })}
        </p>
      </div>
    </Panel>
  )
}
