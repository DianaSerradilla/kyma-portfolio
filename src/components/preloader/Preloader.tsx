import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { getLenis } from '../../lib/smoothScroll'

gsap.registerPlugin(useGSAP)

const MAX_WAIT_MS = 4000
const INK = '#070707'

type PreloaderProps = {
  /** Called once the "eyes" are fully open and the page is in focus. */
  onDone: () => void
}

// Resolves when fonts and the hero video are ready, or after a safety timeout.
function whenAssetsReady(): Promise<void> {
  const fonts = document.fonts.ready.then(() => undefined)
  const video = document.querySelector('video')
  const videoReady =
    !video || video.readyState >= 3
      ? Promise.resolve()
      : new Promise<void>((resolve) => video.addEventListener('canplay', () => resolve(), { once: true }))
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS))
  return Promise.race([Promise.all([fonts, videoReady]).then(() => undefined), timeout])
}

// Waking from a dream: the page starts black and blurred, the eyelids open
// heavily, close, blink, and finally open wide while the page comes into focus.
// The lid is a black field with an almond-shaped hole whose height is animated.
export function Preloader({ onDone }: PreloaderProps) {
  const overlayRef = useRef<SVGSVGElement>(null)
  const eyeRef = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      const overlay = overlayRef.current
      const eye = eyeRef.current
      const app = document.getElementById('top')
      if (!overlay || !eye || !app) return

      const root = document.documentElement
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let cancelled = false
      let timeline: gsap.core.Timeline | undefined

      root.classList.add('is-loading')
      getLenis()?.stop()
      window.scrollTo(0, 0)

      function finish() {
        overlay!.style.display = 'none'
        gsap.set(app, { clearProps: 'filter' })
        root.classList.remove('is-loading')
        getLenis()?.start()
        onDone()
      }

      if (reduceMotion) {
        overlay.style.display = 'none'
        void whenAssetsReady().then(() => {
          if (!cancelled) finish()
        })
      } else {
        overlay.style.display = ''
        gsap.set(eye, { svgOrigin: '50 50', scaleY: 0 })
        gsap.set(app, { filter: 'blur(18px)' })

        void whenAssetsReady().then(() => {
          if (cancelled) return
          timeline = gsap.timeline({ delay: 0.4, onComplete: finish })
          timeline
            // Heavy-lidded first look
            .to(eye, { scaleY: 0.2, duration: 1.1, ease: 'power2.out' })
            .to(app, { filter: 'blur(14px)', duration: 1.1 }, '<')
            // Sleepy close
            .to(eye, { scaleY: 0.02, duration: 0.45, ease: 'power2.in' }, '+=0.15')
            // Opens a bit more
            .to(eye, { scaleY: 0.6, duration: 0.8, ease: 'power3.out' }, '+=0.2')
            .to(app, { filter: 'blur(7px)', duration: 0.8 }, '<')
            // Quick blink
            .to(eye, { scaleY: 0.04, duration: 0.16, ease: 'power2.in' }, '+=0.1')
            .to(eye, { scaleY: 1.2, duration: 0.5, ease: 'power2.out' })
            .to(app, { filter: 'blur(3px)', duration: 0.5 }, '<')
            // Wide awake, in focus
            .to(eye, { scaleY: 6, duration: 1.2, ease: 'power3.inOut' }, '+=0.1')
            .to(app, { filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }, '<')
        })
      }

      return () => {
        cancelled = true
        timeline?.kill()
        gsap.set(app, { clearProps: 'filter' })
        root.classList.remove('is-loading')
        getLenis()?.start()
      }
    },
    { scope: overlayRef },
  )

  return (
    <svg
      ref={overlayRef}
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-auto fixed inset-0 z-[200] size-full"
    >
      <defs>
        <filter id="lid-soft" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <mask id="eye-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="white" />
          <g ref={eyeRef}>
            <path d="M-30 50 Q50 -10 130 50 Q50 110 -30 50Z" fill="black" filter="url(#lid-soft)" />
          </g>
        </mask>
      </defs>
      <rect width="100" height="100" fill={INK} mask="url(#eye-mask)" />
    </svg>
  )
}
