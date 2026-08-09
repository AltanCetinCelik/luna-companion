import { friendProfile, t } from '../data/friendProfile'
import type { PetMemory, PetAction, PetCounts } from './persistence'
import { countToAction, totalInteractions } from './persistence'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Return-dialogue engine.
 *
 *  Reads the pet's memory and builds the exact welcome scene for this visit:
 *  first ever visit, second, third, then increasingly personal ones that
 *  reference the time gap, the last action, the high score, the session
 *  chain and the visitor's favorite button. Occasionally it decides the
 *  moment is special ("… Özledim seni. Hoş geldin. ♥").
 *
 *  Every line of dialogue lives in src/data/friendProfile.ts → welcome.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type GapCategory = 'minutes' | 'sameDay' | 'oneDay' | 'fewDays' | 'week' | 'longAbsence'

export function gapCategoryFor(msAway: number): GapCategory {
  const hours = msAway / 3_600_000
  const days = hours / 24
  if (hours < 3) return 'minutes'
  if (days < 1) return 'sameDay'
  if (days < 2) return 'oneDay'
  if (days < 7) return 'fewDays'
  if (days < 30) return 'week'
  return 'longAbsence'
}

export interface WelcomeScript {
  lines: string[]
  cta: string
  emotional: boolean
  badge: string | null
}

/** The button Luna presses most, as an action id (ties broken randomly). */
export function favoriteAction(s: PetMemory): PetAction | null {
  const keys = Object.keys(s.counts) as (keyof PetCounts)[]
  const values = keys.map((k) => s.counts[k])
  const max = Math.max(...values)
  if (max === 0) return null
  const ties = keys.filter((_, i) => values[i] === max)
  return countToAction(ties[Math.floor(Math.random() * ties.length)])
}

function isEmotional(gap: GapCategory): boolean {
  if (gap === 'longAbsence') return true
  if (gap === 'week') return Math.random() < 0.7
  if (gap === 'fewDays') return Math.random() < 0.25
  return false
}

export function buildWelcomeScript(save: PetMemory): WelcomeScript {
  const L = friendProfile.welcome
  const labels = friendProfile.labels
  const name = friendProfile.name
  const badge = save.visitCount > 0 ? `${labels.visit} #${save.visitCount}` : null

  const first = { ad: name }

  // Scripts that repeat until a visitor is truly familiar.
  // (visitCount 0 = fresh reset — the intro plays again.)
  if (save.visitCount <= 1) {
    return { lines: L.intro.map((l) => t(l, first)), cta: labels.ctaMeet, emotional: false, badge }
  }
  if (save.visitCount === 2) {
    return { lines: L.second.map((l) => t(l, first)), cta: labels.ctaContinue, emotional: false, badge }
  }
  if (save.visitCount === 3) {
    return { lines: L.third.map((l) => t(l, first)), cta: labels.ctaContinue, emotional: false, badge }
  }

  // Visit 4+: personalized, from real stored data.
  // (lastGapMs is captured at load time — how long it had really been.)
  const gap = save.lastGapMs !== null ? gapCategoryFor(save.lastGapMs) : 'sameDay'

  if (isEmotional(gap)) {
    return { lines: L.emotional, cta: labels.ctaHere, emotional: true, badge }
  }

  const lines: string[] = []

  const chainLength = save.recentActions.length >= 2 ? 1 : 0
  const fav = favoriteAction(save)
  const favLength = fav && totalInteractions(save) >= 5 ? L.favorite.length : 0
  const scoreLength = save.highScore > 0 ? (save.lastAction === 'play' ? 2 : 1) : 0
  const other = (save.lastAction ? L.byAction[save.lastAction].length : 0) + chainLength + favLength + scoreLength

  // 1) how long it's been (one line when there's a lot to say, else two)
  const gapLines = L.byGap[gap]
  const gapCount = other >= 6 ? 1 : Math.min(2, gapLines.length)
  for (let i = 0; i < gapCount; i += 1) lines.push(gapLines[i])

  // 2) what they did last time
  if (save.lastAction) {
    lines.push(...L.byAction[save.lastAction].map((l) => t(l, first)))
  }

  // 3) the session chain — one flowing memory: "önce beni besledin, sonra…"
  // (consecutive repeats collapse, so "konuş, konuş" becomes one "konuştun")
  if (save.recentActions.length >= 2) {
    const chain = L.sessionChain
    const seq = save.recentActions.filter((a, i, arr) => i === 0 || a !== arr[i - 1])
    const parts = [t(chain.first, { eylem: chain.actions[seq[0]] })]
    for (const a of seq.slice(1)) parts.push(t(chain.then, { eylem: chain.actions[a] }))
    lines.push(`${chain.intro} ${parts.join(' ')} ${chain.outro}`)
  }

  // 4) their favorite button (only once there's real history)
  if (fav && favLength > 0) {
    const actionLabel = friendProfile.labels.actions[fav]
    lines.push(...L.favorite.map((l) => t(l, { eylem: actionLabel })))
  }

  // 5) the high score they should be proud of
  if (save.highScore > 0) {
    lines.push(t(L.highScore[0], { skor: save.highScore }))
    if (save.lastAction === 'play') lines.push(t(L.highScore[1], { skor: save.highScore }))
  }

  return { lines: lines.slice(0, 8), cta: labels.ctaContinue, emotional: false, badge }
}
