import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { SecretCelebration } from './components/EasterEggs'
import { FloatingBackground } from './components/FloatingBackground'
import { ResetConfirm } from './components/ResetConfirm'
import { StartScreen } from './components/StartScreen'
import { VirtualPet } from './components/VirtualPet'
import { WelcomeStage } from './components/WelcomeStage'
import { friendProfile } from './data/friendProfile'
import { ALL_EGGS, GameProvider, useGame } from './state/GameContext'
import { sfx, unlockAudio } from './utils/sfx'

/** Push the config theme into CSS custom properties so every var-driven surface updates. */
function applyTheme(): void {
  const t = friendProfile.theme
  const root = document.documentElement
  root.style.setProperty('--c-bg-top', t.bgTop)
  root.style.setProperty('--c-bg-bottom', t.bgBottom)
  root.style.setProperty('--c-accent', t.accent)
  root.style.setProperty('--c-accent2', t.accent2)
  root.style.setProperty('--c-accent3', t.accent3)
  root.style.setProperty('--c-ink', t.ink)
  root.style.setProperty('--c-shell', t.shell)
  root.style.setProperty('--c-screen', t.screen)
}

function Header() {
  const game = useGame()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4 pt-4">
      <button
        type="button"
        onClick={() => {
          unlockAudio()
          game.toggleMute()
          sfx.click()
        }}
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border-2 border-white/80 bg-white/60 text-base shadow-sm transition-all hover:scale-110 active:scale-90"
        aria-label={game.muted ? friendProfile.labels.soundOn : friendProfile.labels.soundOff}
        title={game.muted ? friendProfile.labels.soundOn : friendProfile.labels.soundOff}
      >
        {game.muted ? '🔇' : '🔊'}
      </button>

      <motion.p
        className="font-pixel text-[9px] tracking-wider text-[#a08dc0] sm:text-[10px]"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {friendProfile.product.title}
      </motion.p>

      <div className="flex items-center gap-2">
        <span className="font-pixel rounded-full border-2 border-white/80 bg-white/60 px-2.5 py-1.5 text-[8px] text-[#8a75a8] sm:text-[9px]">
          {friendProfile.labels.secretsCounter} ★ {game.secretsFound}/{ALL_EGGS.length}
        </span>
        <button
          type="button"
          onClick={() => {
            sfx.click()
            setConfirmReset(true)
          }}
          className="cursor-pointer rounded-full border-2 border-white/80 bg-white/60 px-2.5 py-1.5 font-pixel text-[8px] text-[#b39ac4] transition-all hover:bg-white sm:text-[9px]"
          aria-label={friendProfile.labels.reset}
          title={friendProfile.labels.reset}
        >
          ↺ {friendProfile.labels.reset}
        </button>
      </div>

      <AnimatePresence>
        {confirmReset && (
          <ResetConfirm
            key="reset"
            onCancel={() => setConfirmReset(false)}
            onConfirm={() => {
              setConfirmReset(false)
              game.reset()
            }}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

function Shell() {
  const game = useGame()

  useEffect(() => {
    applyTheme()
    document.title = `${friendProfile.product.title} ♥`
  }, [])

  // Secret: type her name anywhere with the keyboard.
  useEffect(() => {
    let typed = ''
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
      typed = (typed + e.key.toLowerCase()).slice(-6)
      if (friendProfile.name.length > 0 && typed.endsWith(friendProfile.name.toLowerCase())) {
        typed = ''
        game.triggerSecret('typing', friendProfile.secrets.typing)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game.triggerSecret])

  const onStart = () => {
    unlockAudio()
    sfx.start()
    game.update((s) => ({ ...s, started: true }))
  }

  // The return experience: Luna greets the visitor before the toy opens.
  // Mount the pet only after the welcome is done so its greeting lands right.
  const welcomePending = game.save.welcomedVisit < game.save.visitCount
  const finishWelcome = useCallback(() => {
    game.markWelcomed()
  }, [game])

  return (
    <div
      className="relative min-h-dvh w-full overflow-x-hidden"
      style={{
        background:
          'radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.65), transparent 60%), linear-gradient(180deg, var(--c-bg-top), var(--c-bg-bottom))',
      }}
    >
      <FloatingBackground />
      <Header />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {game.save.started && !welcomePending ? (
            <VirtualPet key="pet" />
          ) : !game.save.started ? (
            <StartScreen key="start" onStart={onStart} />
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <p className="font-lcd text-[14px] text-[#9b8ab8]">{friendProfile.labels.footer}</p>
      </footer>

      <SecretCelebration />

      <AnimatePresence>
        {welcomePending && <WelcomeStage key={`welcome-${game.save.visitCount}`} onDone={finishWelcome} />}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <GameProvider>
        <Shell />
      </GameProvider>
    </MotionConfig>
  )
}
