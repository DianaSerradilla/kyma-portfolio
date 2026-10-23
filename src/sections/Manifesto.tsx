import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
// TODO: placeholder, it is the hero's clip. Swap for the manifesto video.
import manifestoVideo from '../assets/hero/hero-video.mp4'
import { Logo } from '../components/brand/Logo'
import { SectionLabel } from '../components/ui/SectionLabel'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// "Somos [video] kyma": the video sits in a small pill between the words. While the section is
// scrolled the pill grows, pushing the words out to the sides, until the video fills the screen
// and a line appears over it. The stage is held in place with CSS sticky instead of a JS pin: on a
// phone, pinning with position: fixed jumps when the browser bar slides in and out.
export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Plays only while it is on screen (and never for someone who prefers reduced motion).
  useEffect(() => {
    const video = videoRef.current
    const stage = stageRef.current
    if (!video || !stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined)
      else video.pause()
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = stageRef.current
      const pill = pillRef.current
      if (!section || !stage || !pill) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const startWidth = pill.offsetWidth
        const startHeight = pill.offsetHeight
        gsap.set('[data-manifesto-line]', { opacity: 0, y: 40 })

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              // The section is taller than the screen; the stage stays put inside it meanwhile.
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            pill,
            { width: startWidth, height: startHeight, borderRadius: startHeight / 2 },
            { width: () => stage.clientWidth, height: () => stage.clientHeight, borderRadius: 0, ease: 'power2.inOut', duration: 0.7 },
            0,
          )
          .to('[data-manifesto-label]', { opacity: 0, duration: 0.2 }, 0.15)
          .to('[data-manifesto-line]', { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out' }, 0.6)
          // The video stays full and still for the last stretch of the scroll.
          .to({}, { duration: 0.3 })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="manifiesto" aria-labelledby="manifiesto-title" className="relative h-[300svh] md:h-[360svh]">
      <div ref={stageRef} className="sticky top-0 flex h-lvh items-center justify-center overflow-hidden">
        <div data-manifesto-label className="absolute inset-x-0 top-8 z-10 text-center md:top-10">
          <SectionLabel id="manifiesto-title" className="text-center">
            Manifiesto
          </SectionLabel>
        </div>

        {/* Three columns with the pill always in the middle one: the side columns take what is
            left, so as the pill grows both words leave the screen at the same pace. */}
        <p className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center font-display text-[clamp(1.35rem,6.5vw,6.5rem)] font-medium uppercase leading-none">
          <span className="justify-self-end whitespace-nowrap pr-[clamp(0.6rem,2.5vw,2.5rem)]">Somos</span>
          <span
            ref={pillRef}
            aria-hidden
            className="relative block h-[clamp(2.5rem,7.5vw,7.5rem)] w-[clamp(4.25rem,20vw,20rem)] overflow-hidden rounded-full bg-paper/10"
          >
            <video
              ref={videoRef}
              src={manifestoVideo}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
            />
            {/* Appears over the video once it fills the screen. */}
            <span
              data-manifesto-line
              className="absolute inset-0 grid place-items-center bg-ink/35 px-6 text-center font-display text-[clamp(2.5rem,8vw,8rem)] font-light uppercase leading-[0.95]"
            >
              <span>
                Ideas en
                <span className="block font-script text-[1.25em] normal-case leading-[0.9] text-paper">movimiento</span>
              </span>
            </span>
          </span>
          <span className="justify-self-start pl-[clamp(0.6rem,2.5vw,2.5rem)]">
            <Logo className="h-[clamp(1.5rem,6.5vw,6.5rem)]" />
          </span>
        </p>
      </div>
    </section>
  )
}
