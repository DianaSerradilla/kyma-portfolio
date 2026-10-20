import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

gsap.registerPlugin(useGSAP)

type DotGridProps = {
  className?: string
  /** Distance between dots, in CSS pixels. */
  spacing?: number
  /** Pointer influence radius, in CSS pixels. */
  radius?: number
}

// Dots rest in paper and turn primary orange as the pointer displaces them.
const REST_RGB = [229, 224, 212] as const
const ACTIVE_RGB = [255, 53, 23] as const
const BASE_RADIUS = 1.1
const BASE_ALPHA = 0.22
const FULL_COLOUR_AT = 26 // displacement (px) at which a dot is fully orange

// A grid of dots on a canvas. The pointer pushes nearby dots away and lights
// them up; springs bring them back to their place.
export function DotGrid({ className = '', spacing = 28, radius = 130 }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useGSAP(
    () => {
      const canvas = canvasRef.current
      const parent = canvas?.parentElement
      const ctx = canvas?.getContext('2d')
      if (!canvas || !parent || !ctx) return

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let width = 0
      let height = 0
      let dpr = 1
      let cols = 0
      let rows = 0
      let ox = new Float32Array(0)
      let oy = new Float32Array(0)
      let vx = new Float32Array(0)
      let vy = new Float32Array(0)
      // How "lit" each dot is (0..1): rises near the pointer, then fades out.
      let heat = new Float32Array(0)
      const pointer = { x: -9999, y: -9999, active: false }
      let settled = false

      function resize() {
        if (!canvas || !parent) return
        const rect = parent.getBoundingClientRect()
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        width = rect.width
        height = rect.height
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        cols = Math.ceil(width / spacing) + 1
        rows = Math.ceil(height / spacing) + 1
        const count = cols * rows
        ox = new Float32Array(count)
        oy = new Float32Array(count)
        vx = new Float32Array(count)
        vy = new Float32Array(count)
        heat = new Float32Array(count)
        settled = false
        draw()
      }

      function draw() {
        if (!ctx) return
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, width, height)
        const pad = spacing / 2
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = r * cols + c
            const displacement = Math.hypot(ox[i], oy[i])
            const t = Math.min(Math.max(displacement / FULL_COLOUR_AT, heat[i] * 1.6), 1)
            const size = BASE_RADIUS + Math.min(displacement * 0.05, 2) + heat[i] * 0.8
            const alpha = BASE_ALPHA + t * (1 - BASE_ALPHA)
            const red = REST_RGB[0] + (ACTIVE_RGB[0] - REST_RGB[0]) * t
            const green = REST_RGB[1] + (ACTIVE_RGB[1] - REST_RGB[1]) * t
            const blue = REST_RGB[2] + (ACTIVE_RGB[2] - REST_RGB[2]) * t
            ctx.fillStyle = `rgba(${red | 0}, ${green | 0}, ${blue | 0}, ${alpha})`
            ctx.beginPath()
            ctx.arc(c * spacing + pad + ox[i], r * spacing + pad + oy[i], size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      function onPointerMove(event: PointerEvent) {
        if (!parent) return
        const rect = parent.getBoundingClientRect()
        pointer.x = event.clientX - rect.left
        pointer.y = event.clientY - rect.top
        pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
      }

      function tick() {
        if (settled && !pointer.active) return

        const pad = spacing / 2
        let energy = 0
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = r * cols + c
            if (pointer.active) {
              const dx = c * spacing + pad - pointer.x
              const dy = r * spacing + pad - pointer.y
              const dist = Math.hypot(dx, dy)
              if (dist < radius) {
                heat[i] = Math.max(heat[i], 1 - dist / radius)
                if (dist > 0.001) {
                  const force = Math.pow(1 - dist / radius, 2) * 2.2
                  vx[i] += (dx / dist) * force
                  vy[i] += (dy / dist) * force
                }
              }
            }
            heat[i] *= 0.95
            // Spring back to rest.
            vx[i] += -ox[i] * 0.06
            vy[i] += -oy[i] * 0.06
            vx[i] *= 0.86
            vy[i] *= 0.86
            ox[i] += vx[i]
            oy[i] += vy[i]
            energy += Math.abs(ox[i]) + Math.abs(oy[i]) + Math.abs(vx[i]) + Math.abs(vy[i]) + heat[i] * 10
          }
        }
        draw()
        settled = !pointer.active && energy < 0.5
      }

      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(parent)

      if (reduceMotion) {
        return () => observer.disconnect()
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      gsap.ticker.add(tick)

      return () => {
        gsap.ticker.remove(tick)
        observer.disconnect()
        window.removeEventListener('pointermove', onPointerMove)
      }
    },
    { scope: canvasRef },
  )

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 size-full ${className}`} />
}
