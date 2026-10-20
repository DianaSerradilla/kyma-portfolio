import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import heroPoster from '../assets/hero/hero-eyes.png'
import heroVideo from '../assets/hero/hero-video.mp4'
import { DotGrid } from '../components/hero/DotGrid'
import { FontCycleWord } from '../components/hero/FontCycleWord'

gsap.registerPlugin(useGSAP)

type HeroProps = {
  /** True once the preloader has finished; the intro animation waits for it. */
  start: boolean
}

export function Hero({ start }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // With reduced motion, keep the poster frame instead of playing the loop.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) videoRef.current?.pause()
  }, [])

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (!start) {
        gsap.set('[data-hero-in]', { opacity: 0 })
        return
      }
      gsap.from('[data-hero-in]', {
        opacity: 0,
        y: 14,
        filter: 'blur(12px)',
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.25,
        delay: 0.2,
      })
      // Gentle bob that hints at scrolling down.
      gsap.to('[data-scroll-arrow]', {
        y: 8,
        opacity: 0.45,
        duration: 1.1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    },
    { scope: sectionRef, dependencies: [start], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      data-cursor-iso
      aria-label="Presentación"
      className="relative flex min-h-svh items-center justify-center overflow-hidden rounded-b-section bg-ink px-5 text-paper"
    >
      <video
        ref={videoRef}
        src={heroVideo}
        poster={heroPoster}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      {/* Dark scrim keeps the text and dots legible over the footage */}
      <div aria-hidden className="absolute inset-0 bg-ink/60" />
      <DotGrid />

      <h1 className="relative w-full max-w-[1100px]">
        <span className="sr-only">Kyma — </span>
        <span data-hero-in className="block font-display text-[clamp(1rem,2.4vw,1.75rem)] font-medium">
          Ideas en
        </span>
        <span data-hero-in className="block">
          <FontCycleWord word="Movimiento" play={start} />
        </span>
      </h1>

      <a
        href="#quienes-somos"
        aria-label="Seguir bajando"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <svg
          data-scroll-arrow
          aria-hidden
          viewBox="0 0 24 24"
          className="size-6 fill-none stroke-current stroke-[1.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4v15M5.5 12.5 12 19l6.5-6.5" />
        </svg>
      </a>
    </section>
  )
}
