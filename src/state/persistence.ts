import { friendProfile } from '../data/friendProfile'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Persistence layer — the pet's memory.
 *
 *  Everything the little friend "remembers" lives here, in one place:
 *  - the last visit, the first visit, how many visits
 *  - the last action + last shown message
 *  - the last few actions (session chain)
 *  - how often each button was pressed (favorite action)
 *  - stats, counters, unlocked love cards, discovered secrets, high score
 *
 *  All functions are pure (given a memory, return a memory) except the
 *  load / save / reset trio that talks to localStorage. No component ever
 *  touches localStorage directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PetAction = 'feed' | 'play' | 'love' | 'memories' | 'talk' | 'sleep'

export interface PetStats {
  happiness: number
  chaos: number
  cuteness: number
  energy: number
  friendship: number
}

export interface PetCounts {
  feeds: number
  plays: number
  talks: number
  loves: number
  sleeps: number
  memories: number
}

export interface PetMemory {
  version: number
  /** Has the visitor ever pressed BAŞLA? */
  started: boolean
  firstVisit: number | null
  lastVisit: number | null
  /** How long it had been since the previous visit (observed on load). */
  lastGapMs: number | null
  visitCount: number
  /** The visit count for which the welcome scene was last shown. -1 = never. */
  welcomedVisit: number
  lastAction: PetAction | null
  lastMessage: string | null
  recentActions: PetAction[]
  stats: PetStats
  counts: PetCounts
  eggsFound: string[]
  memoriesViewed: string[]
  highScore: number
  muted: boolean
}

/** Keeping the original key lets v1 saves migrate forward automatically. */
export const KEY = 'virtual-human-edition-v1'
const SAVE_VERSION = 2

const ENERGY_PER_HOUR = 3
/** Opens closer than this are the same visit (refresh, another tab). */
export const NEW_VISIT_GAP_MS = 60_000

const defaultStats: PetStats = { ...friendProfile.stats }
const defaultCounts: PetCounts = { feeds: 0, plays: 0, talks: 0, loves: 0, sleeps: 0, memories: 0 }

function freshMemory(): PetMemory {
  return {
    version: SAVE_VERSION,
    started: false,
    firstVisit: null,
    lastVisit: null,
    lastGapMs: null,
    visitCount: 0,
    welcomedVisit: -1,
    lastAction: null,
    lastMessage: null,
    recentActions: [],
    stats: { ...defaultStats },
    counts: { ...defaultCounts },
    eggsFound: [],
    memoriesViewed: [],
    highScore: 0,
    muted: false,
  }
}

const ACTIONS: PetAction[] = ['feed', 'play', 'love', 'memories', 'talk', 'sleep']

/** counts key ↔ action id (kept for backwards compat with v1 keys). */
const COUNT_KEY: Record<PetAction, keyof PetCounts> = {
  feed: 'feeds',
  play: 'plays',
  love: 'loves',
  memories: 'memories',
  talk: 'talks',
  sleep: 'sleeps',
}

export function countToAction(key: keyof PetCounts): PetAction | null {
  for (const a of ACTIONS) if (COUNT_KEY[a] === key) return a
  return null
}

function num(v: unknown, fallback: number, min?: number, max?: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback
  if (min !== undefined && max !== undefined) return Math.min(max, Math.max(min, n))
  return Math.round(n * 100) / 100
}

function sanitize(raw: unknown): PetMemory {
  const base = freshMemory()
  const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const stats = (p.stats ?? {}) as Record<string, unknown>
  const counts = (p.counts ?? {}) as Record<string, unknown>

  const eggs = Array.isArray(p.eggsFound)
    ? [...new Set(p.eggsFound.filter((e): e is string => typeof e === 'string'))]
    : []
  const viewed = Array.isArray(p.memoriesViewed)
    ? [...new Set(p.memoriesViewed.filter((m): m is string => typeof m === 'string'))]
    : []
  const recent = Array.isArray(p.recentActions)
    ? p.recentActions.filter((a): a is PetAction => ACTIONS.includes(a as PetAction)).slice(-3)
    : []

  // v1 → v2: the field used to be called `visits`.
  const legacyVisits = typeof p.visits === 'number' && Number.isFinite(p.visits) ? p.visits : 0
  const visitCount = num(p.visitCount, legacyVisits, 0, 1_000_000)
  const firstVisit =
    typeof p.firstVisit === 'number' && Number.isFinite(p.firstVisit)
      ? p.firstVisit
      : visitCount > 0 && typeof p.lastVisit === 'number' && Number.isFinite(p.lastVisit)
        ? p.lastVisit
        : null

  return {
    ...base,
    version: SAVE_VERSION,
    started: p.started === true,
    firstVisit,
    lastVisit: typeof p.lastVisit === 'number' && Number.isFinite(p.lastVisit) ? p.lastVisit : null,
    lastGapMs: typeof p.lastGapMs === 'number' && Number.isFinite(p.lastGapMs) ? p.lastGapMs : null,
    visitCount,
    welcomedVisit: num(p.welcomedVisit, -1, -1, 1_000_000),
    lastAction: ACTIONS.includes(p.lastAction as PetAction) ? (p.lastAction as PetAction) : null,
    lastMessage: typeof p.lastMessage === 'string' ? p.lastMessage : null,
    recentActions: recent,
    stats: {
      happiness: num(stats.happiness, base.stats.happiness, 0, 100),
      chaos: num(stats.chaos, base.stats.chaos, 0, 100),
      cuteness: num(stats.cuteness, base.stats.cuteness, 0, 9999),
      energy: num(stats.energy, base.stats.energy, 0, 100),
      friendship:
        typeof stats.friendship === 'number' && Number.isFinite(stats.friendship)
          ? stats.friendship
          : base.stats.friendship,
    },
    counts: {
      feeds: num(counts.feeds, 0, 0, 1_000_000),
      plays: num(counts.plays, 0, 0, 1_000_000),
      talks: num(counts.talks, 0, 0, 1_000_000),
      loves: num(counts.loves, 0, 0, 1_000_000),
      sleeps: num(counts.sleeps, 0, 0, 1_000_000),
      memories: num(counts.memories, 0, 0, 1_000_000),
    },
    eggsFound: eggs,
    memoriesViewed: viewed,
    highScore: num(p.highScore, 0, 0, 1_000_000),
    muted: p.muted === true,
  }
}

export function loadPetState(): PetMemory {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshMemory()
    return sanitize(JSON.parse(raw))
  } catch {
    return freshMemory()
  }
}

export function savePetState(memory: PetMemory): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory))
  } catch {
    /* private mode or full storage — the pet still works for this session */
  }
}

export function resetPetState(): PetMemory {
  const fresh = freshMemory()
  savePetState(fresh)
  return fresh
}

/**
 * Called once per page open. Counts a new visit if the last open was a while
 * ago, backdates nothing, and drains energy very gently (never punishing).
 */
export function recordVisit(s: PetMemory, now = Date.now()): PetMemory {
  const gapMs = s.lastVisit ? now - s.lastVisit : null
  let next: PetMemory = { ...s, stats: { ...s.stats }, lastGapMs: gapMs }

  if (gapMs !== null && gapMs > 30_000) {
    const hours = gapMs / 3_600_000
    next.stats.energy = Math.max(20, Math.round(next.stats.energy - hours * ENERGY_PER_HOUR))
  }

  const isNewVisit = gapMs === null || gapMs >= NEW_VISIT_GAP_MS
  if (isNewVisit) {
    next = { ...next, visitCount: next.visitCount + 1 }
    if (next.firstVisit === null) next.firstVisit = now
  }
  next.lastVisit = now
  return next
}

/** Remember which button was pressed: last action, session chain, totals. */
export function recordAction(s: PetMemory, action: PetAction): PetMemory {
  const key = COUNT_KEY[action]
  return {
    ...s,
    lastAction: action,
    recentActions: [...s.recentActions, action].slice(-3),
    counts: { ...s.counts, [key]: s.counts[key] + 1 },
  }
}

/** Remember the last thing she said / was shown. */
export function recordMessage(s: PetMemory, text: string): PetMemory {
  return { ...s, lastMessage: text }
}

export function unlockSecret(s: PetMemory, id: string): PetMemory {
  if (s.eggsFound.includes(id)) return s
  return { ...s, eggsFound: [...s.eggsFound, id] }
}

export function markWelcomed(s: PetMemory): PetMemory {
  return { ...s, welcomedVisit: s.visitCount }
}

/** Total interaction count across all buttons (for the "favorite" bit). */
export function totalInteractions(s: PetMemory): number {
  const c = s.counts
  return c.feeds + c.plays + c.talks + c.loves + c.sleeps + c.memories
}
