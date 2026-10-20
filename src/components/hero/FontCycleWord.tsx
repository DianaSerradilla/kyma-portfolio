import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { FONTS, fontStack } from '../../data/displayFonts'

gsap.registerPlugin(useGSAP)

const HOLD_SECONDS = 1.3

type FontCycleWordProps = {
  word: string
  className?: string
  /** Start cycling typefaces; keeps the first one while false. */
  play?: boolean
}

// Shows a word that swaps between typefaces. Each face is scaled so the word
// always spans the same width.
export function FontCycleWord({ word, className = '', play = true }: FontCycleWordProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const [index, setIndex] = useState(0)
  const [sizes, setSizes] = useState<number[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let cancelled = false
    let frame = 0

    const measure = async () => {
      await Promise.all(FONTS.map((f) => document.fonts.load(`${f.weight} 100px "${f.family}"`, word)))
      if (cancelled) return
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return
      const target = root.clientWidth
      setSizes(
        FONTS.map((f) => {
          ctx.font = `${f.weight} 100px ${fontStack(f)}`
          const text = f.uppercase ? word.toUpperCase() : word
          return (100 * target) / ctx.measureText(text).width
        }),
      )
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    schedule()
    const observer = new ResizeObserver(schedule)
    observer.observe(root)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [word])

  useGSAP(
    () => {
      if (!play || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const el = wordRef.current
      if (!el) return

      const timeline = gsap.timeline({ repeat: -1, delay: 1.6 })
      timeline
        .to(el, { opacity: 0, filter: 'blur(10px)', duration: 0.14, ease: 'power2.in' })
        .call(() => setIndex((i) => (i + 1) % FONTS.length))
        .to(el, { opacity: 1, filter: 'blur(0px)', duration: 0.22, ease: 'power2.out' })
        .to({}, { duration: HOLD_SECONDS })
    },
    { scope: rootRef, dependencies: [play] },
  )

  // Orange glow on the part of the word closest to the pointer.
  useGSAP(
    () => {
      const el = wordRef.current
      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const GLOW_RADIUS = 170
      const REACH = 220 // how far outside the word the pointer still wakes the glow
      const state = { x: 0, y: 0, r: 1 }
      const target = { x: 0, y: 0, r: 1 }
      let awake = false

      function onPointerMove(event: PointerEvent) {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const near = x > -REACH && x < rect.width + REACH && y > -REACH && y < rect.height + REACH
        target.x = x
        target.y = y
        target.r = near ? GLOW_RADIUS : 1
        if (near && !awake) {
          // Start under the pointer instead of sliding in from the last position.
          state.x = x
          state.y = y
        }
        awake = near
      }

      function tick() {
        if (!el) return
        const settled =
          Math.abs(target.r - state.r) < 0.5 && (target.r <= 1 || (Math.abs(target.x - state.x) < 0.3 && Math.abs(target.y - state.y) < 0.3))
        if (settled) return
        state.x += (target.x - state.x) * 0.2
        state.y += (target.y - state.y) * 0.2
        state.r += (target.r - state.r) * 0.12
        el.style.setProperty('--glow-x', `${state.x}px`)
        el.style.setProperty('--glow-y', `${state.y}px`)
        el.style.setProperty('--glow-r', `${Math.max(state.r, 1)}px`)
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      gsap.ticker.add(tick)
      return () => {
        window.removeEventListener('pointermove', onPointerMove)
        gsap.ticker.remove(tick)
      }
    },
    { scope: rootRef },
  )

  const font = FONTS[index]
  const ready = sizes.length === FONTS.length

  return (
    <span ref={rootRef} className={`block w-full ${className}`}>
      <span
        ref={wordRef}
        className={`block whitespace-nowrap text-center leading-[1.05] ${ready ? '' : 'invisible'}`}
        style={{
          fontFamily: fontStack(font),
          fontWeight: font.weight,
          fontSize: ready ? `${sizes[index]}px` : undefined,
          textTransform: font.uppercase ? 'uppercase' : 'none',
          // Paper-coloured text with an orange spot that follows the pointer (see the glow effect above).
          backgroundImage:
            'radial-gradient(circle var(--glow-r, 1px) at var(--glow-x, 50%) var(--glow-y, 50%), var(--color-primary) 0%, var(--color-primary) 30%, var(--color-paper) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {word}
      </span>
    </span>
  )
}
