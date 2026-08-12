import { useEffect, useRef, useState } from 'react'
import { friendProfile } from '../data/friendProfile'
import { useGame } from '../state/GameContext'
import { sfx, unlockAudio } from '../utils/sfx'

interface AudioPlayerProps {
  /** Ses dosyası yolu (örn. /audio/ilk-sayfa-01.m4a). */
  src: string
  /** Oynatıcının üstündeki kısa başlık (örn. 'İLK SAYFA — 01'). */
  label: string
  /** Bölüm sonuna gelindiğinde çağrılır. */
  onEnded: () => void
}

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Tarayıcının çirkin player'ı yerine sitenin tasarımına uyan minicik
 * piksel bir ses oynatıcı: OYNAT/DURAKLAT, tıklanabilir ilerleme çubuğu,
 * süre ve sessize alma. Asla otomatik oynatmaz — kullanıcı basmalı.
 */
export function AudioPlayer({ src, label, onEnded }: AudioPlayerProps) {
  const game = useGame()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  // Site genelinde ses kapatılmışsa hikâye de sessiz başlar.
  const [muted, setMuted] = useState(() => game.save.muted)

  // Bölüm değişince oynatıcıyı baştan kur.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    // Kullanıcı açıkça basana kadar hiçbir şey çalmaz.
    a.load()
  }, [src])

  // Ekran kapanırken sesi durdur.
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const toggle = () => {
    unlockAudio()
    const a = audioRef.current
    if (!a) return
    sfx.click()
    if (playing) {
      a.pause()
    } else {
      void a.play().catch(() => {
        /* oynatma engellendiyse sessizce dur */
      })
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    const track = trackRef.current
    if (!a || !track || !(duration > 0)) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    a.currentTime = ratio * duration
    setCurrent(a.currentTime)
    sfx.click()
  }

  const toggleMute = () => {
    sfx.click()
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m
      return !m
    })
  }

  const total = Number.isFinite(duration) && duration > 0 ? duration : 0
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0
  const S = friendProfile.story

  return (
    <div className="lcd rounded-2xl p-3" style={{ background: 'var(--c-screen)' }}>
      <div className="lcd-glass relative overflow-hidden rounded-xl border border-white/10 px-4 py-3">
        <div className="scanlines pointer-events-none absolute inset-0 z-10" aria-hidden />
        <div className="pixel-grid pointer-events-none absolute inset-0 z-10" aria-hidden />

        {/* başlık satırı */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="font-lcd text-[15px] tracking-wide text-[#ffb8d9]">♪ {label}</span>
          <button
            type="button"
            onClick={toggleMute}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-2 border-[#463c6e] bg-[#241d45] text-[13px] transition-transform hover:scale-110 active:scale-90"
            aria-label={muted ? S.muteOn : S.muteOff}
            title={muted ? S.muteOn : S.muteOff}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* ilerleme çubuğu */}
        <div
          ref={trackRef}
          onClick={seek}
          className="relative z-10 mt-3 h-5 cursor-pointer overflow-hidden rounded-lg border-2 border-[#463c6e] bg-[#241d45]"
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(current)}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-r-md bg-gradient-to-r from-[#ff7bb1] to-[#c9b6ff]"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 border-2 border-[#4a3b66] bg-[#ffd77a] shadow-[0_0_6px_rgba(255,215,122,0.9)]"
            style={{ left: `${pct}%` }}
            aria-hidden
          />
        </div>

        {/* süre + oynat butonu */}
        <div className="relative z-10 mt-3 flex items-center justify-between gap-3">
          <span className="font-lcd text-[15px] text-[#9fb8e8]">
            {fmt(current)} / {fmt(total)}
          </span>
          <button
            type="button"
            onClick={toggle}
            className="font-pixel cursor-pointer rounded-xl border-b-4 border-[#b04d7e] bg-[#ff7bb1] px-5 py-2.5 text-[10px] text-white shadow-[0_4px_12px_rgba(255,107,157,0.5)] transition-transform hover:scale-105 active:translate-y-0.5"
            aria-pressed={playing}
          >
            {playing ? `❚❚ ${S.pause}` : `▶ ${S.play}`}
          </button>
        </div>
      </div>

      {/* gizli ses elementi — kullanıcı OYNAT'a basmadan çalmaz */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          onEnded()
        }}
      />
    </div>
  )
}
