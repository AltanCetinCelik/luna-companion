import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { friendProfile } from '../data/friendProfile'
import { usePetMemory } from '../hooks/usePetMemory'
import { markWelcomed, recordAction, recordMessage, unlockSecret } from './persistence'
import type { PetAction, PetMemory } from './persistence'
import { setMuted as setSfxMuted, sfx } from '../utils/sfx'

export type PetMood =
  | 'idle'
  | 'happy'
  | 'eat'
  | 'love'
  | 'talk'
  | 'sleep'
  | 'excited'
  | 'embarrassed'
  | 'look'

export type EggId =
  | 'petSpam'
  | 'heartClick'
  | 'code'
  | 'longPress'
  | 'starClick'
  | 'version'
  | 'typing'
  | 'story'

export const ALL_EGGS: EggId[] = [
  'petSpam',
  'heartClick',
  'code',
  'longPress',
  'starClick',
  'version',
  'typing',
  'story',
]

export interface SpeechEvent {
  id: number
  text: string
}

interface GameContextValue {
  save: PetMemory
  update: (updater: (s: PetMemory) => PetMemory) => void
  reset: () => void
  mood: PetMood
  setMood: (m: PetMood) => void
  /** The pet's speech bubble (auto-clears). Also remembers the last message. */
  speech: SpeechEvent | null
  say: (text: string, ms?: number) => void
  /** Remember which button was pressed: last action, session chain, totals. */
  recordAction: (action: PetAction) => void
  /** The welcome scene for this visit has been shown/closed. */
  markWelcomed: () => void
  /** Floating "+12 ENERJİ" chips over the stats. */
  floaties: { id: number; text: string; kind: 'up' | 'down' }[]
  float: (text: string, kind?: 'up' | 'down') => void
  muted: boolean
  toggleMute: () => void
  secretsFound: number
  /** Fire an easter egg: sound, celebration overlay, message. */
  triggerSecret: (id: EggId, lines: string[]) => void
  secretEvent: { id: EggId; text: string } | null
  dismissSecret: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const { save, update, reset } = usePetMemory()
  const [mood, setMoodState] = useState<PetMood>('idle')
  const [speech, setSpeech] = useState<SpeechEvent | null>(null)
  const [floaties, setFloaties] = useState<{ id: number; text: string; kind: 'up' | 'down' }[]>([])
  const [secretEvent, setSecretEvent] = useState<{ id: EggId; text: string } | null>(null)

  const speechId = useRef(0)
  const floatId = useRef(0)
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setMood = useCallback((m: PetMood) => {
    setMoodState(m)
    if (moodTimer.current) clearTimeout(moodTimer.current)
    if (m !== 'sleep' && m !== 'idle') {
      moodTimer.current = setTimeout(() => setMoodState('idle'), 2600)
    }
  }, [])

  const say = useCallback(
    (text: string, ms = 3800) => {
      speechId.current += 1
      const id = speechId.current
      setSpeech({ id, text })
      update((s) => recordMessage(s, text))
      setTimeout(() => {
        setSpeech((cur) => (cur && cur.id === id ? null : cur))
      }, ms)
    },
    [update],
  )

  const float = useCallback((text: string, kind: 'up' | 'down' = 'up') => {
    floatId.current += 1
    const id = floatId.current
    setFloaties((f) => [...f, { id, text, kind }])
    setTimeout(() => {
      setFloaties((f) => f.filter((x) => x.id !== id))
    }, 1400)
  }, [])

  const record = useCallback(
    (action: PetAction) => {
      update((s) => recordAction(s, action))
    },
    [update],
  )

  const welcomed = useCallback(() => {
    update((s) => markWelcomed(s))
  }, [update])

  const toggleMute = useCallback(() => {
    update((s) => {
      const muted = !s.muted
      setSfxMuted(muted)
      return { ...s, muted }
    })
  }, [update])

  const triggerSecret = useCallback(
    (id: EggId, lines: string[]) => {
      sfx.secret()
      const text = lines[Math.floor(Math.random() * lines.length)] ?? friendProfile.secrets.secretFound
      setSecretEvent({ id, text })
      update((s) => unlockSecret(s, id))
    },
    [update],
  )

  const dismissSecret = useCallback(() => setSecretEvent(null), [])

  useEffect(() => {
    setSfxMuted(save.muted)
  }, [save.muted])

  const value = useMemo<GameContextValue>(
    () => ({
      save,
      update,
      reset,
      mood,
      setMood,
      speech,
      say,
      recordAction: record,
      markWelcomed: welcomed,
      floaties,
      float,
      muted: save.muted,
      toggleMute,
      secretsFound: save.eggsFound.length,
      triggerSecret,
      secretEvent,
      dismissSecret,
    }),
    [
      save,
      update,
      reset,
      mood,
      setMood,
      speech,
      say,
      record,
      welcomed,
      floaties,
      float,
      toggleMute,
      triggerSecret,
      secretEvent,
      dismissSecret,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
