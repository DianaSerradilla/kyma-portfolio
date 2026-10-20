import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { Isotype } from '../brand/Logo'

gsap.registerPlugin(useGSAP)

// Replaces the native cursor on mouse-like devices: an orange dot everywhere,
// turning into the isotype over elements marked with `data-cursor-iso` (the header).
export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const isoRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const cursor = cursorRef.current
      const dot = dotRef.current
      const iso = isoRef.current
      if (!cursor || !dot || !iso || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const root = document.documentElement
      let visible = false
      let isIso = false

      gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 })
      gsap.set(iso, { opacity: 0, scale: 0.4 })
      const moveX = gsap.quickTo(cursor, 'x', { duration: reduceMotion ? 0.01 : 0.18, ease: 'power3' })
      const moveY = gsap.quickTo(cursor, 'y', { duration: reduceMotion ? 0.01 : 0.18, ease: 'power3' })

      function setShape(next: boolean) {
        if (next === isIso) return
        isIso = next
        const duration = reduceMotion ? 0 : 0.25
        gsap.to(dot, { opacity: next ? 0 : 1, scale: next ? 0.3 : 1, duration, ease: 'power2.out', overwrite: true })
        gsap.to(iso, { opacity: next ? 1 : 0, scale: next ? 1 : 0.4, duration, ease: 'power2.out', overwrite: true })
      }

      function onPointerMove(event: PointerEvent) {
        if (!visible) {
          // First move: jump to the pointer instead of flying in from the corner.
          gsap.set(cursor, { x: event.clientX, y: event.clientY })
          gsap.to(cursor, { opacity: 1, duration: 0.2 })
          visible = true
        }
        moveX(event.clientX)
        moveY(event.clientY)

        const target = event.target instanceof Element ? event.target : null
        setShape(Boolean(target?.closest('[data-cursor-iso]')))
      }

      function onPointerLeave() {
        visible = false
        gsap.to(cursor, { opacity: 0, duration: 0.2 })
      }

      root.classList.add('has-custom-cursor')
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      root.addEventListener('pointerleave', onPointerLeave)

      return () => {
        root.classList.remove('has-custom-cursor')
        window.removeEventListener('pointermove', onPointerMove)
        root.removeEventListener('pointerleave', onPointerLeave)
      }
    },
    { scope: cursorRef },
  )

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] grid place-items-center text-primary opacity-0"
    >
      <span ref={dotRef} className="col-start-1 row-start-1 size-5 rounded-full bg-primary" />
      <span ref={isoRef} className="col-start-1 row-start-1 drop-shadow-[0_0_1px_rgba(7,7,7,0.95)]">
        <Isotype className="block h-10" />
      </span>
    </div>
  )
}
