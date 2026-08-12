import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { friendProfile, t } from '../data/friendProfile'
import { useGame } from '../state/GameContext'
import { sfx, unlockAudio } from '../utils/sfx'
import { ActionButton } from './ActionButton'
import type { ActionId } from './ActionButton'
import { DialogueSystem } from './DialogueSystem'
import { EmergencyPanel } from './EmergencyPanel'
import { FeedInteraction } from './FeedInteraction'
import { LoveMessages } from './LoveMessages'
import { Memories } from './Memories'
import { MiniGame } from './MiniGame'
import { PetScreen } from './PetScreen'
import { PetStats } from './PetStats'
import { StoryPlayer } from './StoryPlayer'

type PanelId = 'feed' | 'play' | 'love' | 'memories' | 'talk' | null

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Kutsal sıra: BESLE → OYNA → SEVGİ → KONUŞ → UYU. */
const SECRET_CODE = ['feed', 'play', 'love', 'talk', 'sleep'] as const

export function VirtualPet() {
  const game = useGame()
  const [panel, setPanel] = useState<PanelId>(null)
  const [storyOpen, setStoryOpen] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  const gameRef = useRef(game)
  gameRef.current = game

  // easter egg trackers
  const seqRef = useRef<string[]>([])
  const petTapCount = useRef(0)
  const lastPetTap = useRef(0)
  const heartTaps = useRef(0)
  const lastHeartTap = useRef(0)
  const waking = useRef(false)
  const lastLongPress = useRef(0)

  const triggerSecret = game.triggerSecret

  /** Return greeting — once per visit, if she's been here before. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (gameRef.current.save.visitCount > 1) {
        const msg = t(friendProfile.returnGreeting, { ad: friendProfile.name })
        gameRef.current.say(msg, 5400)
      }
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  /** Stable wake callback so the sleep overlay timer never resets. */
  const wake = useCallback(() => {
    if (waking.current) return
    waking.current = true
    const g = gameRef.current
    sfx.wake()
    g.setMood('idle')
    g.say(pick(friendProfile.sleep.wakeLines), 5200)
    g.update((s) => ({
      ...s,
      stats: {
        ...s.stats,
        energy: 100,
        happiness: Math.min(100, s.stats.happiness + 5),
      },
    }))
    g.float(friendProfile.ui.floatEnergyFull)
    window.setTimeout(() => {
      waking.current = false
    }, 1500)
  }, [])

  const pushSequence = (id: string) => {
    const seq = seqRef.current
    seq.push(id)
    if (seq.length > 5) seq.shift()
    if (SECRET_CODE.every((c, i) => seq[i] === c)) {
      seqRef.current = []
      triggerSecret('code', friendProfile.secrets.code)
    }
  }

  const handlePetTap = () => {
    unlockAudio()
    const now = Date.now()
    // the click right after a long-press is the release of that press — ignore it
    if (now - lastLongPress.current < 800) return
    petTapCount.current = now - lastPetTap.current < 2600 ? petTapCount.current + 1 : 1
    lastPetTap.current = now
    if (petTapCount.current >= 5) {
      petTapCount.current = 0
      triggerSecret('petSpam', friendProfile.secrets.petSpam)
      return
    }
    // otherwise: a normal chat
    sfx.talk()
    game.setMood('look')
    game.say(pick(friendProfile.dialogue.random), 4400)
    game.recordAction('talk')
    game.update((s) => ({
      ...s,
      stats: {
        ...s.stats,
        friendship: s.stats.friendship + 2,
        happiness: Math.min(100, s.stats.happiness + 2),
      },
    }))
    game.float(friendProfile.ui.floatFriendship)
  }

  const handlePetLongPress = () => {
    unlockAudio()
    lastLongPress.current = Date.now()
    sfx.pop()
    game.setMood('happy')
    triggerSecret('longPress', friendProfile.secrets.longPress)
    game.say(friendProfile.ui.tickleBubble, 2400)
  }

  const handleHeartTap = () => {
    unlockAudio()
    sfx.pop()
    const now = Date.now()
    heartTaps.current = now - lastHeartTap.current < 3000 ? heartTaps.current + 1 : 1
    lastHeartTap.current = now
    if (heartTaps.current >= 3) {
      heartTaps.current = 0
      triggerSecret('heartClick', friendProfile.secrets.heartClick)
      return
    }
    game.say(heartTaps.current === 1 ? friendProfile.ui.heartTapOne : friendProfile.ui.heartTapMany, 1500)
  }

  const handleStarTap = () => {
    unlockAudio()
    sfx.secret()
    triggerSecret('starClick', friendProfile.secrets.starClick)
  }

  const handleAction = (id: ActionId) => {
    unlockAudio()
    if (game.mood === 'sleep') {
      if (id === 'sleep') return // zaten uyuyor, iyi geceler
      wake() // başka bir şeye dokunduysa önce uyandır
    }
    pushSequence(id)
    sfx.click()
    switch (id) {
      case 'feed':
        setPanel('feed')
        break
      case 'play':
        setPanel('play')
        break
      case 'love':
        game.recordAction('love')
        setPanel('love')
        break
      case 'memories':
        game.recordAction('memories')
        game.update((s) => ({
          ...s,
          memoriesViewed: [
            ...new Set([...s.memoriesViewed, ...friendProfile.memories.map((m) => m.id)]),
          ],
        }))
        setPanel('memories')
        game.setMood('love')
        break
      case 'talk':
        setPanel('talk')
        break
      case 'sleep':
        game.recordAction('sleep')
        sfx.sleep()
        game.setMood('sleep')
        game.say(friendProfile.ui.sleepBubble, 3200)
        break
    }
  }

  const closePanel = () => setPanel(null)

  return (
    <motion.div
      key="pet"
      className="flex w-full flex-col items-center gap-5 px-4 pb-14 pt-3 sm:gap-6 sm:pt-6"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.97 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <PetScreen
        onPetTap={handlePetTap}
        onPetLongPress={handlePetLongPress}
        onHeartTap={handleHeartTap}
        onStarTap={handleStarTap}
        onWake={wake}
        onStoryTap={() => setStoryOpen(true)}
      />

      <PetStats />

      {/* acil mod — canı sıkılınca seni arasın 😤 */}
      <button
        type="button"
        onClick={() => {
          unlockAudio()
          sfx.click()
          setEmergencyOpen(true)
        }}
        className="font-lcd w-full max-w-[390px] cursor-pointer rounded-2xl border-2 border-dashed border-[#9fc7e8] bg-white/60 px-4 py-3 text-[15px] leading-tight text-[#6b8fb5] transition-all hover:bg-white active:scale-[0.98]"
      >
        😫 {friendProfile.emergency.buttonLabel}
      </button>

      {/* action pad */}
      <div className="grid w-full max-w-[390px] grid-cols-3 gap-2.5 sm:gap-3">
        <ActionButton action="feed" emoji="🍪" tone="pink" onClick={() => handleAction('feed')} />
        <ActionButton action="play" emoji="🎮" tone="lavender" onClick={() => handleAction('play')} />
        <ActionButton action="love" emoji="💌" tone="cream" onClick={() => handleAction('love')} />
        <ActionButton action="memories" emoji="📸" tone="blue" onClick={() => handleAction('memories')} />
        <ActionButton action="talk" emoji="💬" tone="mint" onClick={() => handleAction('talk')} />
        <ActionButton action="sleep" emoji="💤" tone="lavender" onClick={() => handleAction('sleep')} />
      </div>

      <p className="max-w-[390px] text-center font-lcd text-[14px] leading-tight text-[#9b8ab8]">
        {friendProfile.labels.hint}
      </p>

      <AnimatePresence>
        {panel === 'feed' && <FeedInteraction key="feed" onClose={closePanel} />}
        {panel === 'play' && <MiniGame key="play" onClose={closePanel} />}
        {panel === 'love' && <LoveMessages key="love" onClose={closePanel} />}
        {panel === 'memories' && <Memories key="memories" onClose={closePanel} />}
        {panel === 'talk' && <DialogueSystem key="talk" onClose={closePanel} />}
        {storyOpen && <StoryPlayer key="story" onClose={() => setStoryOpen(false)} />}
        {emergencyOpen && <EmergencyPanel key="emergency" onClose={() => setEmergencyOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
