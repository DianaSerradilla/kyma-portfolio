import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, useState } from 'react'
import { FitText } from '../components/ui/FitText'
import { WorkModal, type OpenWork } from '../components/ui/WorkModal'
import { WorkTile, type TileLayout } from '../components/ui/WorkTile'
import { services, type ServiceTone } from '../data/services'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const TITLE = 'Portfolio'

// Each stage is the colour of its service, darkened (brand colour mixed with the ink) so the
// light text reads comfortably.
const tones: Record<ServiceTone, string> = {
  primary: 'color-mix(in oklab, var(--color-primary) 52%, var(--color-ink))',
  secondary: 'color-mix(in oklab, var(--color-secondary) 55%, var(--color-ink))',
  ink: 'var(--color-ink)',
}

// How each piece sits in the strip: its width, proportions and how far it floats above or
// below the middle. They repeat, so the strip reads as a loose collage rather than a row.
// On a phone the same pieces are stacked in a column, each one as wide as the screen.
const layouts: TileLayout[] = [
  { width: 'clamp(16rem,26vw,30rem)', ratio: '3 / 4', lift: '-8svh', mobileWidth: '100%', mobileAlign: 'center' },
  { width: 'clamp(22rem,36vw,42rem)', ratio: '4 / 5', lift: '3svh', mobileWidth: '100%', mobileAlign: 'center' },
  { width: 'clamp(32rem,58vw,70rem)', ratio: '4 / 3', lift: '0svh', mobileWidth: '100%', mobileAlign: 'center' },
  { width: 'clamp(15rem,22vw,26rem)', ratio: '1 / 1', lift: '-9svh', mobileWidth: '100%', mobileAlign: 'center' },
  { width: 'clamp(20rem,30vw,36rem)', ratio: '3 / 4', lift: '4svh', mobileWidth: '100%', mobileAlign: 'center' },
  { width: 'clamp(27rem,44vw,52rem)', ratio: '16 / 10', lift: '-3svh', mobileWidth: '100%', mobileAlign: 'center' },
]

// "Portfolio": one full-width stage per service. On a computer, while it is scrolled the page stays
// still and the strip of works slides sideways; on a phone the works are a column that scrolls
// down. Clicking a work opens it over the page.
export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<OpenWork | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Letters of the title rise out of a mask.
        gsap.from('[data-char]', {
          yPercent: 115,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.05,
          scrollTrigger: { trigger: '[data-title]', start: 'top 88%', once: true },
        })

      })

      // Wide screens: each strip is pinned and slides sideways with the scroll of the page.
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const stages = gsap.utils.toArray<HTMLElement>('[data-stage]')
        stages.forEach((stage) => {
          const track = stage.querySelector<HTMLElement>('[data-track]')
          if (!track) return
          // The strip is taken out of native scrolling and moved with the scroll of the page.
          stage.style.overflowX = 'hidden'
          const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth)

          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: true,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          })
        })
        return () => stages.forEach((stage) => (stage.style.overflowX = ''))
      })

      // Phones: the works are a column, and each one rises into place as it comes into view.
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-tile]').forEach((tile) => {
          gsap.from(tile, {
            y: 56,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: tile, start: 'top 88%', once: true },
          })
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="portafolio" aria-labelledby="portafolio-title" className="relative z-10 -mt-10">
      <div className="relative rounded-t-section bg-paper text-ink">
        <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-20 md:px-8 md:pb-44 md:pt-32">
          <p className="text-xs font-medium uppercase tracking-wider">Qué hacemos</p>

          <h2
            id="portafolio-title"
            data-title
            aria-label={TITLE}
            className="mt-4 font-display text-[clamp(3.25rem,15.5vw,17rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em]"
          >
            {TITLE.split('').map((char, index) => (
              <span key={index} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-top">
                <span data-char className="inline-block">
                  {char}
                </span>
              </span>
            ))}
          </h2>
        </div>
      </div>

      <ol>
        {services.map((service, serviceIndex) => (
          <li
            key={service.id}
            // Each stage rises over the previous one with its rounded top edge.
            style={{ zIndex: serviceIndex + 1 }}
            className="relative -mt-10"
          >
            <div
              data-stage
              aria-label={service.title}
              style={{ backgroundColor: tones[service.tone] }}
              className="relative rounded-t-section text-paper md:h-svh md:overflow-x-auto"
            >
              <div
                data-track
                className="relative flex flex-col gap-14 px-5 pb-24 pt-20 md:h-full md:w-max md:flex-row md:items-center md:gap-[clamp(3rem,8vw,9rem)] md:px-[clamp(1.25rem,6vw,7rem)] md:py-0 md:pr-[12vw]"
              >
                {/* Intro of the service: it is the first thing of the strip. */}
                <div className="w-full text-center md:w-[min(86vw,46rem)] md:shrink-0 md:text-left">
                  <span className="block font-display text-sm font-medium tabular-nums">
                    {String(serviceIndex + 1).padStart(2, '0')}
                  </span>
                  {/* On a phone each word of the title is stretched to the full width, centred. */}
                  <h3 className="mt-3 font-display text-[clamp(2.75rem,8vw,8rem)] font-bold uppercase leading-[0.92] tracking-[-0.01em]">
                    <span className="block">
                      <FitText max={110}>{service.title.split(' ')[0]}</FitText>
                    </span>
                    {/* From the second word on, the title switches to the script face of "movimiento". */}
                    {service.title.includes(' ') && (
                      <span className="-mt-[0.08em] block">
                        <FitText
                          fill={0.94}
                          max={120}
                          className="font-script text-[1.3em] font-normal normal-case leading-[0.95] tracking-normal"
                        >
                          {service.title.slice(service.title.indexOf(' ') + 1)}
                        </FitText>
                      </span>
                    )}
                  </h3>
                  <ul className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
                    {service.tags.map((tag) => (
                      <li key={tag} className="rounded-full border border-current/40 px-3 py-1.5 text-xs font-medium">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <p className="mx-auto mt-6 max-w-md text-base leading-relaxed md:mx-0 md:text-lg">{service.description}</p>
                </div>

                {service.works.map((work, workIndex) => (
                  <WorkTile
                    key={work.id}
                    work={work}
                    layout={layouts[workIndex % layouts.length]}
                    onOpen={() => setOpen({ service, work })}
                  />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <WorkModal item={open} onClose={() => setOpen(null)} />
    </section>
  )
}
