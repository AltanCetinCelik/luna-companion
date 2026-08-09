/**
 * All pixel art for the whole site, defined as character maps.
 * Each map is a list of equal-width strings; any character not in the
 * palette renders as transparent. In dev, malformed rows are warned about.
 *
 * Palette legend:
 *  o = ink outline   c = cream      p = pastel pink
 *  e = blush         k = dark eye   w = white shine
 *  h = heart pink    b = baby blue  y = star yellow
 *  r = strawberry    g = mint       t = screen dark
 */

export const PALETTE: Record<string, string> = {
  o: '#4a3b66',
  c: '#fff3dc',
  p: '#ffb8d9',
  e: '#ff9dc4',
  k: '#33294e',
  w: '#ffffff',
  h: '#ff6fa5',
  b: '#a8d8f0',
  y: '#ffd77a',
  r: '#ff5f7e',
  g: '#86d9a0',
  t: '#2b2350',
}

function validate(rows: string[], label: string): string[] {
  if (import.meta.env.DEV) {
    const w = rows[0]?.length ?? 0
    rows.forEach((r, i) => {
      if (r.length !== w) {
        console.warn(`[pixelart] "${label}" row ${i} is ${r.length} chars, expected ${w}: "${r}"`)
      }
    })
  }
  return rows
}

const idle = validate(
  [
    '...oo......oo...',
    '..oppp....pppo..',
    '..oppp....pppo..',
    '..oppppppppppo..',
    '.opffffffffffpo.',
    '.opffffffffffpo.',
    '.opffkkwwkkffpo.',
    '.opffkkwwkkffpo.',
    '.opffeeooeeffpo.',
    '.opffffffffffpo.',
    '..opffffffffpo..',
    '..oppppppppppo..',
    '...oooooooooo...',
  ],
  'idle',
)

/** Build a frame by overriding rows of the idle pose. */
function frame(overrides: Record<number, string>, label: string): string[] {
  return validate(idle.map((row, i) => overrides[i] ?? row), label)
}

export const petFrames = {
  idle,
  /** Squinty closed eyes for a blink. */
  blink: frame({ 6: '.opffeeeeeeffpo.', 7: '.opffffffffffpo.' }, 'blink'),
  /** Wide happy smile. */
  happy: frame({ 8: '.opffeekkeeffpo.' }, 'happy'),
  /** Heart-shaped eyes, used by LOVE. */
  love: frame({ 6: '.opffhhwwhhffpo.', 7: '.opffhhwwhhffpo.' }, 'love'),
  /** Open mouth while chewing. */
  eat: frame(
    { 8: '.opffeekkeeffpo.', 9: '.opffffwfffffpo.' },
    'eat',
  ),
  /** Open mouth while talking. */
  talk: frame({ 8: '.opffeekkeeffpo.' }, 'talk'),
  /** Deep sleep. */
  sleep: frame({ 6: '.opffeeeeeeffpo.', 7: '.opffffffffffpo.' }, 'sleep'),
  /** Embarrassed: awkward squinty eyes, huge blush. Used by SEVGİ. */
  embarrassed: frame(
    {
      6: '.opffkffffkffpo.',
      7: '.opeeffffffeepo.',
      8: '.opffeeooeeffpo.',
    },
    'embarrassed',
  ),
  /** Looking toward the user (eyes shifted left). Used by KONUŞ. */
  look: frame({ 6: '.opfkkwwkkfffpo.', 7: '.opfkkwwkkfffpo.' }, 'look'),
} as const

/** A little heart, used by the mini-game and the screen. */
export const heartMap = validate(
  [
    '.oo.oo.',
    'ohhohho',
    'ohhhhho',
    'ohhhhho',
    '.ohhho.',
    '..oho..',
    '...o...',
  ],
  'heart',
)

/** Diamond sparkle star, used as a sticker. */
export const starMap = validate(
  [
    '...y...',
    '..yyy..',
    '.yyyyy.',
    'yyyyyyy',
    '.yyyyy.',
    '..yyy..',
    '...y...',
  ],
  'star',
)

/** Tiny 4-point sparkle. */
export const sparkleMap = validate(['..y..', '..y..', 'yyyyy', '..y..', '..y..'], 'sparkle')

/** Strawberry snack. */
export const strawberryMap = validate(
  [
    '....g....',
    '...ggg...',
    '..rrrrr..',
    '..rrrrr..',
    '.rrwrwrr.',
    '.rrrrrrr.',
    '.rrwrrrwr',
    '..rrrrr..',
    '...rrr...',
  ],
  'strawberry',
)

/** Sprinkle donut. */
export const donutMap = validate(
  [
    '..ooooo..',
    '.opppppo.',
    'opppppppo',
    'opp....po',
    'opp....po',
    'opp....po',
    'opppppppo',
    '.opppppo.',
    '..ooooo..',
  ],
  'donut',
)

/** Baby-blue bow, used as a sticker. */
export const bowMap = validate(['bb...bb', 'bbb.bbb', '.b.b.b.', '..b.b..'], 'bow')
