import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import { heartMap, starMap } from '../pixelart'
import { useGame } from '../state/GameContext'
import { recordStoryChapter } from '../state/persistence'
import { sfx, unlockAudio } from '../utils/sfx'
import { AudioPlayer } from './AudioPlayer'
import { PixelArt } from './PixelArt'

interface StoryPlayerProps {
  onClose: () => void
}

/** Rastgele konumlarda süzülen yıldız/kalp süsleri (atmosfer). */
const SKY_SIZES = ['w-3', 'w-4', 'w-5'] as const

function NightSky() {
  const bits = useRef(
    Array.from({ length: 10 }).map((_, i) => ({
      kind: i % 3 === 0 ? 'heart' : 'star',
      left: 4 + ((i * 37) % 92),
      top: 6 + ((i * 53) % 80),
      dur: 2.6 + (i % 5) * 0.7,
      delay: (i % 4) * 0.6,
      size: SKY_SIZES[i % SKY_SIZES.length],
    })),
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.current.map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${b.left}%`, top: `${b.top}%` }}
          animate={{ y: [0, -16, 0], opacity: [0.15, 0.75, 0.15], rotate: [0, 12, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        >
          <PixelArt map={b.kind === 'heart' ? heartMap : starMap} className={b.size} />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * GİZLİ #7 — İLK SAYFA: beş sesli bölümden oluşan gizli hikâye.
 * - İlk açılışta kilitli kart: [ HİKÂYEYİ AÇ ]
 * - Bölümler sırayla açılır: biri sonuna kadar dinlenince sonraki açılır
 * - Tamamlanan bölümler tekrar dinlenebilir
 * - Hepsini bitirince: "Devamı henüz yazılmadı. ♥"
 */
export function StoryPlayer({ onClose }: StoryPlayerProps) {
  const game = useGame()
  const S = friendProfile.story
  const chapters = S.chapters
  const done = new Set(game.save.completedStoryChapters)
  const allDone = chapters.every((c) => done.has(c.id))

  const [revealed, setRevealed] = useState(game.save.storyOpened)
  const [sel, setSel] = useState(0)
  const [screen, setScreen] = useState<'chapters' | 'ending'>(allDone ? 'ending' : 'chapters')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const endTimer = useRef<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (endTimer.current) clearTimeout(endTimer.current)
    }
  }, [onClose])

  /** Bölüm kilitli mi? (ilk bölüm her zaman açık; önceki dinlenince sonraki açılır) */
  const isUnlocked = (i: number) => i === 0 || done.has(chapters[i - 1].id) || done.has(chapters[i].id)

  const openReveal = () => {
    unlockAudio()
    sfx.start()
    game.update((s) => ({ ...s, storyOpened: true }))
    setRevealed(true)
  }

  const selectChapter = (i: number) => {
    if (!isUnlocked(i)) return
    sfx.click()
    setSel(i)
  }

  const handleEnded = (i: number) => {
    const id = chapters[i].id
    if (!done.has(id)) game.update((s) => recordStoryChapter(s, id))
    sfx.success()
    setToast(S.completedToast)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
    if (i === chapters.length - 1) {
      // son bölüm → bitiş ekranı
      if (endTimer.current) clearTimeout(endTimer.current)
      endTimer.current = window.setTimeout(() => setScreen('ending'), 1500)
    } else {
      // sıradaki bölüm seçili gelir (otomatik oynatmadan)
      setSel(i + 1)
    }
  }

  const close = () => {
    sfx.click()
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-[55] flex items-center justify-center overflow-y-auto bg-[#120c2e]/90 p-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      role="dialog"
      aria-modal="true"
      aria-label={S.title}
    >
      <NightSky />

      <AnimatePresence mode="wait">
        {!revealed ? (
          /* ── GİZLİ #7 kilitli kart ── */
          <motion.div
            key="reveal"
            className="relative z-10 w-full max-w-[340px] rounded-[2rem] border-4 border-[#c9b6ff]/60 bg-[#241d45] p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <motion.p
              className="font-pixel text-[10px] tracking-widest text-[#ffd77a]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔒 {S.revealNumber}
            </motion.p>
            <h2 className="font-pixel mt-4 text-[18px] leading-snug text-[#ffb8d9]">{S.revealTitle}</h2>
            <p className="font-lcd mt-3 text-[19px] leading-tight text-[#9fb8e8]">“{S.revealTagline}”</p>
            <button
              type="button"
              onClick={openReveal}
              className="font-pixel mt-7 cursor-pointer rounded-2xl border-b-[6px] border-[#b04d7e] bg-[#ff7bb1] px-8 py-4 text-[11px] text-white shadow-[0_10px_26px_rgba(255,107,157,0.45)] transition-transform hover:scale-105 active:translate-y-1"
            >
              {S.revealCta}
            </button>
          </motion.div>
        ) : screen === 'ending' ? (
          /* ── hikâyenin sonu ── */
          <motion.div
            key="ending"
            className="relative z-10 w-full max-w-[340px] rounded-[2rem] border-4 border-[#c9b6ff]/60 bg-[#241d45] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-pixel text-[9px] tracking-[0.3em] text-[#ffd77a]">{S.endDate}</p>
            <motion.div
              className="mx-auto mt-5 w-fit"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            >
              <PixelArt map={heartMap} className="w-12" />
            </motion.div>
            <h2 className="font-lcd mt-4 text-[26px] leading-tight text-[#ffb8d9]">{S.endTitle}</h2>
            <p className="font-lcd mt-2 text-[19px] leading-tight text-[#9fb8e8]">{S.endText}</p>
            <p className="font-pixel mt-6 text-[9px] tracking-widest text-[#7a6fa8]">{S.endPage}</p>
            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  sfx.click()
                  setScreen('chapters')
                }}
                className="font-pixel cursor-pointer rounded-2xl border-b-4 border-[#b89de8] bg-[#dccdfb] px-6 py-3.5 text-[10px] text-[#4a3366] transition-transform hover:scale-105 active:translate-y-1"
              >
                {S.backToChapters}
              </button>
              <button
                type="button"
                onClick={close}
                className="font-pixel cursor-pointer rounded-2xl border-b-4 border-[#c9b6e8] bg-[#ece2ff] px-6 py-3.5 text-[10px] text-[#5b4a8a] transition-transform hover:scale-105 active:translate-y-1"
              >
                {S.close}
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── hikâye ekranı: atmosfer + bölümler + oynatıcı ── */
          <motion.div
            key="story"
            className="relative z-10 flex max-h-[92dvh] w-full max-w-[400px] flex-col rounded-[2rem] border-4 border-[#c9b6ff]/60 bg-[#241d45] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {/* kapat */}
            <button
              type="button"
              onClick={close}
              className="absolute -top-3 -right-3 z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full border-4 border-[#241d45] bg-[#ff7bb1] font-pixel text-[11px] text-white shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition-transform hover:rotate-90 hover:scale-110 active:scale-90"
              aria-label={friendProfile.labels.close}
            >
              ✕
            </button>

            {/* başlık */}
            <div className="text-center">
              <p className="font-pixel text-[9px] tracking-[0.3em] text-[#ffd77a]">{S.date}</p>
              <h2 className="font-pixel mt-2 text-[16px] leading-snug text-[#ffb8d9]">{S.title}</h2>
              <p className="font-lcd mt-2 text-[17px] leading-tight text-[#9fb8e8]">“{S.tagline}”</p>
            </div>

            {/* bölüm listesi */}
            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {chapters.map((c, i) => {
                const unlocked = isUnlocked(i)
                const completed = done.has(c.id)
                const selected = sel === i
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => selectChapter(i)}
                    className={`font-pixel flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-[9px] transition-all ${
                      selected
                        ? 'border-[#ff7bb1] bg-[#ff7bb1]/15 text-[#ffd7e8]'
                        : unlocked
                          ? 'border-[#463c6e] bg-[#1b1536] text-[#b9aee0] hover:border-[#7a6fa8]'
                          : 'cursor-not-allowed border-[#332b57] bg-[#1b1536] text-[#5a5280]'
                    }`}
                    aria-disabled={!unlocked}
                  >
                    <span className={selected ? 'text-[#ff7bb1]' : completed ? 'text-[#ffd77a]' : 'text-[#7a6fa8]'}>
                      {c.id}
                    </span>
                    <span className="flex-1 truncate">{c.title}</span>
                    <span aria-hidden>{completed ? S.doneMark : unlocked ? (selected ? '▶' : '') : S.lockedMark}</span>
                  </button>
                )
              })}
              {allDone && (
                <p className="font-lcd pt-1 text-center text-[14px] text-[#ffd77a]">✨ {S.allDone} ✨</p>
              )}
            </div>

            {/* oynatıcı */}
            <div className="mt-4">
              <AudioPlayer
                src={chapters[sel].file}
                label={`${S.title} — ${chapters[sel].id}`}
                onEnded={() => handleEnded(sel)}
              />
              {/* bölüm gezinme */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => selectChapter(sel - 1)}
                  disabled={sel === 0 || !isUnlocked(sel - 1)}
                  className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#463c6e] bg-[#332b57] px-3 py-2.5 text-[8px] text-[#c9b6ff] transition-transform hover:scale-105 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ◀ {S.prev}
                </button>
                <span className="font-lcd text-[14px] text-[#7a6fa8]">
                  {S.chapterLabel} {chapters[sel].id} / {String(chapters.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => selectChapter(sel + 1)}
                  disabled={sel === chapters.length - 1 || !isUnlocked(sel + 1)}
                  className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#463c6e] bg-[#332b57] px-3 py-2.5 text-[8px] text-[#c9b6ff] transition-transform hover:scale-105 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {S.next} ▶
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bölüm tamamlandı bildirimi */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className="pointer-events-none absolute top-6 left-1/2 z-20 -translate-x-1/2 rounded-2xl border-4 border-[#ffd77a] bg-[#241d45] px-6 py-3 text-center shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: -18, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
          >
            <motion.span
              className="font-lcd block text-[19px] leading-tight text-[#ffd77a]"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              {toast}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
