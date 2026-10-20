import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

let instance: Lenis | null = null

export function getLenis() {
  return instance
}

// Smooth, inertial scrolling for the whole page, driven by GSAP's ticker so
// ScrollTrigger (pinning, scrubbing) stays in sync with it.
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: true })
  instance = lenis

  // The preloader locks scrolling until the page is awake.
  if (document.documentElement.classList.contains('is-loading')) lenis.stop()

  lenis.on('scroll', ScrollTrigger.update)
  const onTick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(onTick)
    lenis.destroy()
    instance = null
  }
}
