import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  onDone?: () => void
}

/**
 * Types out text character by character, like an old LCD.
 * onDone fires when the last character lands — scheduled outside the state
 * updater so React never sees a setState-during-render, and tied to the
 * current text so a stale count can't trigger it early.
 */
export function TypewriterText({ text, speed = 24, className, onDone }: TypewriterTextProps) {
  const [count, setCount] = useState(0)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const doneFired = useRef(false)

  useEffect(() => {
    setCount(0)
    doneFired.current = false
    if (text.length === 0) return
    let finished = false
    const i = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) return c
        const nc = c + 1
        if (nc >= text.length && !finished) {
          finished = true
          window.setTimeout(() => {
            if (!doneFired.current) {
              doneFired.current = true
              doneRef.current?.()
            }
          }, 0)
        }
        return nc
      })
    }, speed)
    return () => clearInterval(i)
  }, [text, speed])

  return <span className={className}>{text.slice(0, count)}</span>
}
