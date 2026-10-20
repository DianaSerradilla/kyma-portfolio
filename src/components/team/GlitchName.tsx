import { useEffect, useState } from 'react'
import { FONTS, fontStack } from '../../data/displayFonts'

const STEP_MS = 75

type GlitchNameProps = {
  text: string
  /** When it becomes true the name flips through every display typeface before settling. */
  active: boolean
  className?: string
}

export function GlitchName({ text, active, className = '' }: GlitchNameProps) {
  // Number of typeface flips since the name was activated.
  const [flips, setFlips] = useState(0)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!active || reduceMotion) return

    let count = 0
    const timer = window.setInterval(() => {
      count += 1
      setFlips(count)
      if (count >= FONTS.length) window.clearInterval(timer)
    }, STEP_MS)

    return () => {
      window.clearInterval(timer)
      setFlips(0)
    }
  }, [active, reduceMotion])

  // Flipping through the display faces, then settled in the brand typeface (null).
  const font = active && !reduceMotion && flips < FONTS.length ? FONTS[flips] : null

  return (
    <span
      className={className}
      style={
        font
          ? {
              fontFamily: fontStack(font),
              fontWeight: font.weight,
              textTransform: font.uppercase ? 'uppercase' : 'none',
            }
          : undefined
      }
    >
      {text}
    </span>
  )
}
