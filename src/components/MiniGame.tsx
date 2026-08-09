import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { friendProfile, t } from '../data/friendProfile'
import { heartMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { sfx } from '../utils/sfx'
import { Panel } from './Panel'
import { PixelArt } from './PixelArt'

interface FallingHeart {
  id: number
  left: number
  dur: number
}

interface Spark {
  id: number
  x: number
  y: number
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const ROUND_SECONDS = 25

export function MiniGame({ onClose }: { onClose: () => void }) {
  const game = useGame()
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready')
  const [hearts, setHearts] = useState<FallingHeart[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [sparks, setSparks] = useState<Spark[]>([])
  const [result, setResult] = useState('')
  const [newRecord, setNewRecord] = useState(false)
  const idRef = useRef(0)
  const scoredRef = useRef(false)
  const scoreRef = useRef(score)
  scoreRef.current = score
  const timersRef = useRef<number[]>([])

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }

  // clear any pending timers when the panel unmounts
  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t))
    },
    [],
  )

  const finish = (finalScore: number) => {
    setPhase('done')
    if (scoredRef.current) return
    scoredRef.current = true
    const won = finalScore >= 12
    if (won) sfx.success()
    else sfx.talk()
    const msg = won ? pick(friendProfile.playWinMessages) : pick(friendProfile.playLoseMessages)
    setResult(msg)

    // record check (once, against the freshest saved value)
    const isRecord = finalScore > game.save.highScore
    setNewRecord(isRecord && finalScore > 0)
    if (isRecord) {
      if (!won) sfx.secret()
      game.update((s) => ({ ...s, highScore: finalScore }))
    }

    game.say(msg, 5200)
    game.recordAction('play')
    game.update((s) => ({
      ...s,
      stats: {
        ...s.stats,
        happiness: Math.min(100, s.stats.happiness + Math.min(finalScore, 25)),
        chaos: s.stats.chaos + 3,
      },
    }))
    game.float(`+${Math.min(finalScore, 25)} MUTLULUK`)
  }

  const start = () => {
    sfx.success()
    setPhase('playing')
    setScore(0)
    setTimeLeft(ROUND_SECONDS)
    setHearts([])
    setNewRecord(false)
    scoredRef.current = false
  }

  // Spawn hearts.
  useEffect(() => {
    if (phase !== 'playing') return
    const spawn = () => {
      idRef.current += 1
      const id = idRef.current
      const heart: FallingHeart = { id, left: 6 + Math.random() * 78, dur: 2.1 + Math.random() * 1.7 }
      setHearts((h) => [...h, heart])
      later(() => setHearts((h) => h.filter((x) => x.id !== id)), heart.dur * 1000 + 60)
    }
    spawn()
    const i = window.setInterval(spawn, 720)
    return () => clearInterval(i)
  }, [phase])

  // Countdown.
  useEffect(() => {
    if (phase !== 'playing') return
    const i = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(i)
  }, [phase])

  // Round over.
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) finish(scoreRef.current)
  }, [timeLeft, phase])

  const catchHeart = (id: number, e: React.PointerEvent<HTMLButtonElement>) => {
    sfx.catch()
    setScore((s) => s + 1)
    setHearts((h) => h.filter((x) => x.id !== id))
    const rect = (e.currentTarget.parentElement as HTMLElement | null)?.getBoundingClientRect()
    if (rect) {
      idRef.current += 1
      const sid = idRef.current
      setSparks((s) => [...s, { id: sid, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      later(() => setSparks((s) => s.filter((sp) => sp.id !== sid)), 520)
    }
  }

  const L = friendProfile.labels

  return (
    <Panel onClose={onClose} title={L.gameTitle} emoji="💗" tone="lavender">
      <div className="pt-1">
        {phase === 'ready' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 items-center gap-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                  className="w-10"
                >
                  <PixelArt map={heartMap} className="w-full drop-shadow" />
                </motion.div>
              ))}
            </div>
            <p className="font-lcd text-center text-[17px] leading-tight text-[#7a649d]">
              {t(friendProfile.ui.gameIntro, { sure: ROUND_SECONDS })
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
              onClick={start}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92, y: 3 }}
              className="font-pixel rounded-2xl border-b-4 border-[#b89de8] bg-[#dccdfb] px-10 py-4 text-[12px] text-[#4a3366] shadow-[0_8px_20px_rgba(184,157,232,0.5)]"
            >
              ▶ {L.gameStart}
            </motion.button>
          </div>
        )}

        {phase === 'playing' && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-pixel text-[10px] text-[#4a3b66]">
                {L.score} <span className="text-[#ff5f9e]">{score}</span>
              </span>
              <span className="font-pixel text-[10px] text-[#4a3b66]">
                {L.record} <span className="text-[#7a4fb0]">{Math.max(game.save.highScore, score)}</span>
              </span>
              <span className="font-pixel text-[10px] text-[#4a3b66]">
                {L.time} <span className="text-[#7a4fb0]">{timeLeft}s</span>
              </span>
            </div>
            <div
              className="relative h-[300px] w-full overflow-hidden rounded-2xl border-4 border-[#4a3b66]/20 sm:h-[340px]"
              style={{ background: 'var(--c-screen)' }}
            >
              <div className="scanlines pointer-events-none absolute inset-0 z-20" aria-hidden />
              <div className="pixel-grid pointer-events-none absolute inset-0 z-20" aria-hidden />
              {hearts.map((h) => (
                <motion.button
                  key={h.id}
                  type="button"
                  onPointerDown={(e) => catchHeart(h.id, e)}
                  className="absolute top-[-64px] w-12 cursor-pointer touch-manipulation sm:w-14"
                  style={{ left: `${h.left}%` }}
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ y: 380, rotate: 16, opacity: [1, 1, 0.85] }}
                  transition={{ duration: h.dur, ease: 'linear' }}
                  aria-label={friendProfile.ui.gameCatchAria}
                >
                  <PixelArt map={heartMap} className="w-full drop-shadow-[0_2px_0_rgba(255,255,255,0.35)]" />
                </motion.button>
              ))}
              {sparks.map((sp) => (
                <motion.span
                  key={sp.id}
                  className="pointer-events-none absolute z-30 h-2 w-2 rounded-full bg-[#ffd77a]"
                  style={{ left: sp.x, top: sp.y }}
                  initial={{ scale: 0.6, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0, x: [0, 10, -10, 6], y: [0, -16, -6, -22] }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              ))}
              {/* safe zone line */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ff7bb1]/60" aria-hidden />
            </div>
            <p className="mt-2 text-center font-lcd text-[14px] text-[#a08dc0]">
              {friendProfile.ui.gameCatchHint}
            </p>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-4 py-3">
            <div className="text-center">
              {newRecord && (
                <motion.p
                  className="font-pixel mb-1 text-[10px] text-[#ff8f3f]"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                >
                  🎉 {L.newRecord} 🎉
                </motion.p>
              )}
              <p className="font-pixel text-[24px] text-[#ff5f9e]">{score}</p>
              <p className="font-pixel mt-1 text-[9px] text-[#8a75a8]">
                {score >= 12
                  ? friendProfile.ui.gameRatingGreat
                  : score >= 6
                    ? friendProfile.ui.gameRatingGood
                    : friendProfile.ui.gameRatingMeh}
              </p>
            </div>
            <p className="font-lcd rounded-2xl border-2 border-dashed border-[#c9b6e8] bg-[#f6f0ff] px-4 py-3 text-center text-[16px] leading-tight text-[#6b5a8a]">
              {result}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={start}
                className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#b89de8] bg-[#dccdfb] px-6 py-3 text-[10px] text-[#4a3366] transition-transform hover:scale-105 active:translate-y-1"
              >
                ▶ {L.gameAgain}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#f3a8c4] bg-[#ffdcec] px-6 py-3 text-[10px] text-[#8a4a6e] transition-transform hover:scale-105 active:translate-y-1"
              >
                {L.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
