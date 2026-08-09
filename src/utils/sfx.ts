/**
 * Tiny chiptune sound engine built on the Web Audio API.
 * No audio files needed — every sound is synthesized on the fly.
 * Nothing plays until the user interacts (browsers require that anyway).
 */

type OscType = 'square' | 'triangle' | 'sine' | 'sawtooth'

let ctx: AudioContext | null = null
let muted = false

/** Call from any click/tap handler to unlock audio on first user gesture. */
export function unlockAudio(): void {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AC) ctx = new AC()
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

export function setMuted(m: boolean): void {
  muted = m
}

interface NoteOpts {
  freq: number
  start?: number
  dur?: number
  type?: OscType
  vol?: number
  slideTo?: number
}

function tone({ freq, start = 0, dur = 0.08, type = 'square', vol = 0.1, slideTo }: NoteOpts): void {
  if (muted || !ctx) return
  try {
    const t0 = ctx.currentTime + start
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  } catch {
    /* audio is a nice-to-have; never crash over it */
  }
}

function note(freq: number, start: number, dur = 0.08, type: OscType = 'square', vol = 0.1): void {
  tone({ freq, start, dur, type, vol })
}

/** Tiny melodies for every interaction. */
export const sfx = {
  click(): void {
    note(660, 0, 0.05, 'square', 0.06)
    note(880, 0.02, 0.04, 'square', 0.04)
  },
  hover(): void {
    note(520, 0, 0.03, 'triangle', 0.03)
  },
  feed(): void {
    note(392, 0, 0.07, 'square', 0.09)
    note(523, 0.07, 0.07, 'square', 0.09)
    note(659, 0.14, 0.1, 'square', 0.09)
  },
  pop(): void {
    note(900, 0, 0.05, 'square', 0.07)
    tone({ freq: 900, start: 0, dur: 0.07, type: 'square', vol: 0.07, slideTo: 1400 })
  },
  catch(): void {
    note(784, 0, 0.05, 'square', 0.08)
    note(1046, 0.05, 0.08, 'square', 0.08)
  },
  success(): void {
    note(523, 0, 0.08, 'square', 0.08)
    note(659, 0.08, 0.08, 'square', 0.08)
    note(784, 0.16, 0.08, 'square', 0.08)
    note(1046, 0.24, 0.16, 'square', 0.08)
  },
  secret(): void {
    note(659, 0, 0.07, 'triangle', 0.1)
    note(784, 0.07, 0.07, 'triangle', 0.1)
    note(1046, 0.14, 0.07, 'triangle', 0.1)
    note(1318, 0.21, 0.14, 'triangle', 0.12)
    note(1568, 0.32, 0.2, 'sine', 0.1)
  },
  talk(): void {
    note(500, 0, 0.05, 'triangle', 0.07)
  },
  love(): void {
    note(880, 0, 0.1, 'triangle', 0.08)
    note(1108, 0.12, 0.16, 'triangle', 0.08)
  },
  sleep(): void {
    note(494, 0, 0.3, 'sine', 0.07)
    note(392, 0.32, 0.3, 'sine', 0.07)
    note(330, 0.64, 0.3, 'sine', 0.07)
    note(294, 0.96, 0.5, 'sine', 0.07)
  },
  wake(): void {
    note(523, 0, 0.08, 'triangle', 0.08)
    note(659, 0.08, 0.08, 'triangle', 0.08)
    note(784, 0.16, 0.12, 'triangle', 0.08)
  },
  start(): void {
    note(523, 0, 0.08, 'square', 0.07)
    note(659, 0.08, 0.08, 'square', 0.07)
    note(784, 0.16, 0.08, 'square', 0.07)
    note(1046, 0.24, 0.2, 'square', 0.08)
  },
  zzz(): void {
    note(660, 0, 0.05, 'sine', 0.04)
    note(784, 0.09, 0.05, 'sine', 0.04)
    note(880, 0.18, 0.06, 'sine', 0.04)
  },
} as const

export type SfxName = keyof typeof sfx
