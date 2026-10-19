import { onScopeDispose } from 'vue'

let activeLocks = 0
let previousOverflow: string | null = null

export function useBodyScrollLock() {
  let isLocked = false

  function setLocked(shouldLock: boolean) {
    if (!import.meta.client || isLocked === shouldLock) return

    if (shouldLock) {
      if (activeLocks === 0) previousOverflow = document.body.style.overflow
      activeLocks += 1
      isLocked = true
      document.body.style.overflow = 'hidden'
      return
    }

    isLocked = false
    activeLocks = Math.max(0, activeLocks - 1)
    if (activeLocks === 0) {
      document.body.style.overflow = previousOverflow ?? ''
      previousOverflow = null
    }
  }

  onScopeDispose(() => setLocked(false))
  return { setLocked }
}