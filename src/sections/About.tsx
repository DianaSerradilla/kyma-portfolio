import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Fragment, useCallback, useRef, useState } from 'react'
import { TeamCard } from '../components/team/TeamCard'
import { TeamRibbon } from '../components/team/TeamRibbon'
import { SectionLabel } from '../components/ui/SectionLabel'
import { team } from '../data/team'
import { useMediaQuery } from '../hooks/useMediaQuery'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Chunk = { text: string; bold?: boolean; accent?: boolean }

// "movimiento" is the accent: the only script word on the page's statement, in the secondary colour.
const STATEMENT: Chunk[] = [
  { text: 'Un espacio donde el' },
  { text: 'movimiento', accent: true },
  { text: 'de las ideas se' },
  { text: 'hace real', bold: true },
]

const SCROLL_LENGTH = '+=400%'
const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)
  const gridRef = useRef<HTMLUListElement>(null)
  const progressRef = useRef(0)
  const enterRef = useRef(0)

  // 3D strip on large screens; a plain grid on phones, with reduced motion, or without WebGL.
  const [webglOk, setWebglOk] = useState(true)
  const onUnsupported = useCallback(() => setWebglOk(false), [])
  const wide = useMediaQuery('(min-width: 768px) and (prefers-reduced-motion: no-preference)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const ribbon = wide && webglOk

  useGSAP(
    () => {
      const pin = pinRef.current
      if (!pin || reduceMotion) return

      const words = gsap.utils.toArray<HTMLElement>('[data-word]', pin)

      if (!ribbon) {
        // Stacked layout: statement lights up while scrolled through, portraits rise in.
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.15,
            scrollTrigger: { trigger: statementRef.current, start: 'top 85%', end: 'bottom 55%', scrub: 0.4 },
          },
        )
        gsap.from('[data-team-card]', {
          y: 70,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true },
        })
        return
      }

      // Pinned: the strip travels while the statement lights up word by word.
      const lightWords = (progress: number) => {
        const lit = (progress / 0.45) * words.length
        words.forEach((word, index) => {
          word.style.opacity = String(0.12 + 0.88 * clamp(lit - index))
        })
      }
      lightWords(0)

      const trigger = ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: SCROLL_LENGTH,
        pin: true,
        onUpdate: (self) => {
          progressRef.current = self.progress
          lightWords(self.progress)
        },
        onRefresh: (self) => {
          progressRef.current = self.progress
          lightWords(self.progress)
        },
      })
      // The strip fades in while the section scrolls into view, before it pins.
      const arrival = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'top top',
        onUpdate: (self) => {
          enterRef.current = self.progress
        },
        onRefresh: (self) => {
          enterRef.current = self.progress
        },
      })
      void document.fonts.ready.then(() => ScrollTrigger.refresh())

      return () => {
        trigger.kill()
        arrival.kill()
      }
    },
    { scope: sectionRef, dependencies: [ribbon, reduceMotion], revertOnUpdate: true },
  )

  return (
    <section ref={sectionRef} id="quienes-somos" aria-labelledby="quienes-somos-title">
      <div
        ref={pinRef}
        className={ribbon ? 'relative h-svh overflow-hidden' : 'mx-auto max-w-[1600px] px-5 py-24 md:px-8 md:py-40'}
      >
        {ribbon && (
          <TeamRibbon members={team} progressRef={progressRef} enterRef={enterRef} onUnsupported={onUnsupported} />
        )}

        <div
          className={
            ribbon
              ? 'pointer-events-none absolute inset-y-0 left-0 z-20 flex w-[48%] flex-col justify-center px-8'
              : undefined
          }
        >
          <SectionLabel id="quienes-somos-title">Quienes Somos</SectionLabel>

          <p
            ref={statementRef}
            className="mt-6 font-display text-[clamp(1.6rem,2.9vw,3.1rem)] font-light uppercase leading-[1.08] tracking-[-0.01em] md:mt-8"
          >
            {STATEMENT.map((chunk) =>
              chunk.accent ? (
                <span
                  key={chunk.text}
                  data-word
                  className="-my-[0.06em] block font-script text-[2.5em] font-normal normal-case leading-[1] tracking-normal text-secondary"
                >
                  {chunk.text}
                </span>
              ) : (
                chunk.text.split(' ').map((word, index) => (
                  <Fragment key={`${chunk.text}-${index}`}>
                    <span data-word className={chunk.bold ? 'font-bold' : undefined}>
                      {word}
                    </span>{' '}
                  </Fragment>
                ))
              ),
            )}
          </p>

          <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-paper/80">
            Creamos experiencias multimediales donde la creatividad, la narrativa visual y la tecnología se combinan
            para dar vida a proyectos inmersivos, dinámicos y memorables.
          </p>
        </div>

        {!ribbon && (
          <ul ref={gridRef} className="mt-16 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-6 md:gap-x-4">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} className="md:even:mt-14" />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
