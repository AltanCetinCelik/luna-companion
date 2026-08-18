import { useState } from 'react'
import { friendProfile } from '../data/friendProfile'
import { sfx, unlockAudio } from '../utils/sfx'
import { Panel } from './Panel'
import { PixelPet } from './PixelPet'

interface EmergencyPanelProps {
  onClose: () => void
}

/**
 * ACİL MODU — dost sıkılınca tek dokunuşla seni arasın.
 * - tel: linki mobilde arama ekranını numaranla hazır açar (yeşil tuşa basınca arar)
 * - WhatsApp seçeneği hazır mesajla sohbet açar
 * Tarayıcılar otomatik aramaya izin vermez; bu, buna en yakın ve en güvenli yol.
 */
export function EmergencyPanel({ onClose }: EmergencyPanelProps) {
  const E = friendProfile.emergency
  const [mobile] = useState(() => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))
  const waUrl = `https://wa.me/${E.whatsappNumber}?text=${encodeURIComponent(E.waText)}`

  return (
    <Panel onClose={onClose} title={E.title} emoji="😫" tone="blue">
      <div className="flex flex-col items-center gap-3 pt-1">
        <PixelPet mood="embarrassed" size={110} />
        <p className="font-lcd text-center text-[16px] leading-tight text-[#7a649d]">{E.intro}</p>

        <a
          href={`tel:${E.tel}`}
          onClick={() => {
            unlockAudio()
            sfx.click()
          }}
          className="font-pixel w-full cursor-pointer rounded-2xl border-b-4 border-[#1f8a4a] bg-[#3fbf6b] px-6 py-4 text-center text-[11px] text-white shadow-[0_8px_20px_rgba(63,191,107,0.45)] transition-transform hover:scale-[1.03] active:translate-y-1"
        >
          📞 {E.callCta}
        </a>

        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            unlockAudio()
            sfx.click()
          }}
          className="font-pixel w-full cursor-pointer rounded-2xl border-b-4 border-[#137a41] bg-[#25d366] px-6 py-4 text-center text-[11px] text-white shadow-[0_8px_20px_rgba(37,211,102,0.45)] transition-transform hover:scale-[1.03] active:translate-y-1"
        >
          💬 {E.waCta}
        </a>

        <p className="font-lcd text-center text-[13px] leading-tight text-[#a08dc0]">
          {mobile ? E.mobileHint : E.desktopHint}
        </p>
      </div>
    </Panel>
  )
}
