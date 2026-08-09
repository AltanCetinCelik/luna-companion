import { motion } from 'framer-motion'
import { friendProfile } from '../data/friendProfile'
import type { PetStats as PetStatsType } from '../state/persistence'
import { useGame } from '../state/GameContext'

const ICONS: Record<keyof PetStatsType, string> = {
  happiness: '😊',
  chaos: '🌀',
  cuteness: '🎀',
  energy: '⚡',
  friendship: '💗',
}

const COLORS: Record<keyof PetStatsType, string> = {
  happiness: '#ff9dc4',
  chaos: '#c3a8f0',
  cuteness: '#ffd77a',
  energy: '#a8d8f0',
  friendship: '#ff7bb1',
}

const SEGMENTS = 10

/**
 * The stats live in a quiet little corner — the pet is the star.
 * Small, soft, and a little bit funny. Never a dashboard.
 */
export function PetStats() {
  const { save } = useGame()
  const { stats } = save
  const labels = friendProfile.labels

  const defs = (Object.keys(COLORS) as (keyof PetStatsType)[]).map((key) => ({
    key,
    label: labels.stats[key],
    icon: ICONS[key],
    color: COLORS[key],
    infinite: key === 'friendship',
  }))

  return (
    <section className="w-full max-w-[390px] rounded-3xl border-2 border-white/80 bg-white/55 px-4 pb-3.5 pt-3 shadow-[0_10px_26px_rgba(74,59,102,0.1)] backdrop-blur-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-pixel text-[8px] tracking-wide text-[#8a75a8] sm:text-[9px]">
          {labels.statsTitle}
        </h2>
        <span className="font-lcd text-[12px] text-[#b39ac4]">
          {labels.visit} #{save.visitCount}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {defs.map((def) => {
          const raw = def.infinite ? 100 : Math.max(0, Math.min(100, Number(stats[def.key])))
          const filled = Math.round((raw / 100) * SEGMENTS)
          const valueText = def.infinite
            ? labels.friendshipValue
            : def.key === 'cuteness'
              ? `${stats[def.key]}%`
              : `${Math.min(100, Number(stats[def.key]))}%`
          return (
            <li key={def.key} className="flex items-center gap-2">
              <span className="w-4 text-center text-xs" aria-hidden>
                {def.icon}
              </span>
              <span className="font-pixel w-[76px] shrink-0 text-[7px] leading-tight text-[#7a649d] sm:text-[8px]">
                {def.label}
              </span>
              <div className="flex flex-1 gap-0.5" role="img" aria-label={`${def.label}: ${valueText}`}>
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="h-3 flex-1 rounded-[2px]"
                    animate={{
                      backgroundColor: i < filled ? def.color : 'rgba(74,59,102,0.1)',
                      scale: i < filled && i === filled - 1 ? [1, 1.25, 1] : 1,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                  />
                ))}
              </div>
              <motion.span
                key={valueText}
                initial={{ scale: 1.4, color: def.color }}
                animate={{ scale: 1, color: '#6b5a8a' }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="font-pixel w-12 shrink-0 text-right text-[8px]"
              >
                {valueText}
              </motion.span>
            </li>
          )
        })}
      </ul>

      <p className="mt-2.5 rounded-xl bg-white/60 px-2.5 py-1.5 text-center font-lcd text-[12px] leading-snug text-[#a08dc0]">
        {labels.statsJoke}
      </p>
    </section>
  )
}
