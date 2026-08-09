import { useCallback, useEffect, useState } from 'react'
import { KEY, loadPetState, recordVisit, resetPetState, savePetState } from '../state/persistence'
import type { PetMemory } from '../state/persistence'

/**
 * React bridge over the persistence layer.
 * - loads the save once (counting this visit, draining energy gently)
 * - persists on every change
 * - stays in sync with other open tabs via the `storage` event
 *
 * Safe on refresh, safe in private mode, safe with corrupted data — the
 * persistence layer always falls back to sensible defaults.
 */
export function usePetMemory() {
  const [save, setSave] = useState<PetMemory>(() => recordVisit(loadPetState()))

  useEffect(() => {
    savePetState(save)
  }, [save])

  // Another tab wrote to the save — adopt it (without recounting the visit;
  // the writing tab already did).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSave(loadPetState())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((updater: (s: PetMemory) => PetMemory) => {
    setSave((prev) => {
      const next = updater(prev)
      savePetState(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSave((prev) => {
      const fresh = resetPetState()
      // keep their sound preference — everything else is forgotten
      fresh.muted = prev.muted
      savePetState(fresh)
      return fresh
    })
  }, [])

  return { save, update, reset }
}
