import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)
// The address bar of a phone showing and hiding resizes the page; that must not re-measure the pinned sections.
ScrollTrigger.config({ ignoreMobileResize: true })

let instance: Lenis | null = null

export function getLenis() {
  return instance
}

// Smooth, inertial scrolling for the whole page, driven by GSAP's ticker so
// ScrollTrigger (pinning, scrubbing) stays in sync with it.
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
  instance = lenis

  // The preloader locks scrolling until the page is awake.
  if (document.documentElement.classList.contains('is-loading')) lenis.stop()

  lenis.on('scroll', ScrollTrigger.update)
  const onTick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  // Links to a section of the page. Gliding there would play every scroll animation on the way
  // (the video opening, the strips sliding), so it fades out, jumps and fades in instead, and the
  // eased animations are set to their final state so none of them plays catching up. Only a hop
  // of a few lines glides.
  let jumping = false
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    const id = link?.getAttribute('href')?.slice(1)
    const target = id ? document.getElementById(id) : null
    if (!target) return
    event.preventDefault()
    if (jumping) return

    const distance = Math.abs(target.getBoundingClientRect().top)
    if (distance < window.innerHeight * 0.5) {
      lenis.scrollTo(target, { duration: 1 })
      return
    }

    jumping = true
    const page = document.getElementById('top')
    const showAgain = () => {
      jumping = false
      gsap.set(page, { clearProps: 'opacity' })
    }
    gsap
      .timeline({ onComplete: showAgain, onInterrupt: showAgain })
      .to(page, { opacity: 0, duration: 0.25, ease: 'power2.in' })
      .add(() => {
        try {
          lenis.scrollTo(target, { immediate: true, force: true })
          ScrollTrigger.update()
          // Scrubbed animations ease towards the scroll position; finish that now.
          for (const trigger of ScrollTrigger.getAll()) {
            const scrub = trigger.getTween()
            if (scrub) scrub.progress(1)
          }
          // Scenes that ease on their own (the 3D strip and the video) are told to do the same.
          window.dispatchEvent(new Event('kyma:snap'))
        } catch {
          /* Whatever went wrong, the page must still fade back in. */
        }
      })
      // A moment for everything to settle at the new position before it shows again.
      .to(page, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '+=0.15')
  }
  document.addEventListener('click', onClick)

  return () => {
    document.removeEventListener('click', onClick)
    gsap.ticker.remove(onTick)
    lenis.destroy()
    instance = null
  }
}
