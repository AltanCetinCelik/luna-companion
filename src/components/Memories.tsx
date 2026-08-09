import { useState } from 'react'
import { friendProfile } from '../data/friendProfile'
import type { Memory } from '../data/friendProfile'
import { heartMap } from '../pixelart'
import { Panel } from './Panel'
import { PixelArt } from './PixelArt'

const ROTATIONS = [-3, 2, -2, 3, -4, 2, -2, 3]

function Polaroid({ memory, index }: { memory: Memory; index: number }) {
  const rotate = ROTATIONS[index % ROTATIONS.length]
  const [broken, setBroken] = useState(false)
  const showImage = memory.image !== undefined && !broken
  return (
    <figure
      className="group relative rounded-xl bg-white p-2 pb-3 shadow-[0_6px_16px_rgba(74,59,102,0.18)] transition-all duration-200 hover:z-10 hover:scale-[1.06] hover:rotate-0"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* tape strip */}
      <span
        className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-[#ffe9a8]/90 shadow-sm"
        aria-hidden
      />
      {/* sticker */}
      <span className="absolute -bottom-2 -right-2 text-base transition-transform duration-200 group-hover:rotate-12" aria-hidden>
        {index % 2 === 0 ? '⭐' : '🌸'}
      </span>

      {showImage ? (
        <img
          src={memory.image}
          alt={memory.title}
          loading="lazy"
          onError={() => setBroken(true)}
          className="aspect-square w-full rounded-lg object-cover"
        />
      ) : (
        <div
          className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg"
          style={{ background: `linear-gradient(160deg, ${memory.color ?? '#ffe3ef'}, #ffffff)` }}
        >
          <span className="text-5xl drop-shadow-sm transition-transform duration-200 group-hover:scale-110" aria-hidden>
            {memory.emoji ?? '✨'}
          </span>
          <PixelArt map={heartMap} pixel={1} className="absolute bottom-1.5 right-1.5 w-4 opacity-60" />
          <span
            className="absolute top-1.5 left-1.5 rounded bg-white/70 px-1 py-0.5 font-pixel text-[6px] text-[#b39ac4]"
            aria-hidden
          >
            {friendProfile.labels.noPhoto}
          </span>
        </div>
      )}

      <figcaption className="pt-2">
        <p className="font-pixel text-[7px] tracking-wide text-[#7a649d]">{memory.title}</p>
        <p className="font-hand text-[15px] leading-tight text-[#4a7090]">{memory.when}</p>
        <p className="font-hand text-[15px] leading-tight text-[#a08dc0]">{memory.why}</p>
      </figcaption>
    </figure>
  )
}

export function Memories({ onClose }: { onClose: () => void }) {
  return (
    <Panel onClose={onClose} title={friendProfile.labels.memoriesTitle} emoji="📸" tone="blue">
      <div className="pt-1">
        <p className="mb-4 rounded-2xl bg-[#eaf6ff] px-4 py-3 font-lcd text-[15px] leading-tight text-[#4a7090]">
          {friendProfile.labels.memoriesNote}
        </p>
        <div className="grid grid-cols-2 gap-4 pb-2 sm:gap-5">
          {friendProfile.memories.map((m, i) => (
            <Polaroid key={m.id} memory={m} index={i} />
          ))}
        </div>
      </div>
    </Panel>
  )
}
