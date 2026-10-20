import { useEffect, useRef, useState } from 'react'
import type { TeamMember } from '../../data/team'
import { GlitchName } from './GlitchName'

type TeamCardProps = {
  member: TeamMember
  className?: string
}

// Plain portrait card, used where the 3D strip is not (phones, reduced motion, no WebGL).
// Still and grayscale until hovered / focused (or, on touch screens, scrolled into view),
// when the clip plays and the name appears.
export function TeamCard({ member, className = '' }: TeamCardProps) {
  const cardRef = useRef<HTMLLIElement>(null)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card || !window.matchMedia('(hover: none)').matches) return

    // No hover on touch screens: show each card's details once it is mostly in view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  const active = hover || focus || inView
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mediaClass = `absolute inset-0 size-full object-cover transition-[filter] duration-700 ${active ? 'grayscale-0' : 'grayscale'}`

  return (
    <li ref={cardRef} data-team-card className={className}>
      <figure
        tabIndex={0}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="relative aspect-[3/5] overflow-hidden rounded-3xl bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <img src={member.photo} alt={member.name} className={mediaClass} />
        {/* The clip is only loaded once the card is active, to keep the page light. */}
        {active && !reduceMotion && (
          <video
            src={member.video}
            poster={member.photo}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            className={mediaClass}
          />
        )}

        <figcaption
          className={`absolute inset-x-0 bottom-0 bg-ink/85 px-4 py-3 transition-[transform,opacity] duration-500 ${active ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
          <GlitchName text={member.name} active={active} className="block font-display text-base font-bold leading-tight" />
          <span className="mt-0.5 block text-xs font-medium">{member.role}</span>
        </figcaption>
      </figure>
    </li>
  )
}
