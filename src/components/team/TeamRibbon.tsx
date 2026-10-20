import { useEffect, useRef, useState } from 'react'
import type { TeamMember } from '../../data/team'
import { GlitchName } from './GlitchName'
import { createRibbonScene } from './ribbonScene'

type TeamRibbonProps = {
  members: TeamMember[]
  /** 0..1 scroll progress of the pinned section, written by the parent. */
  progressRef: { current: number }
  /** 0..1 arrival of the section before it pins, written by the parent. */
  enterRef: { current: number }
  /** Called when WebGL is not available so the parent can show a plain layout instead. */
  onUnsupported: () => void
}

// The 3D strip of portraits. three.js is loaded only when this mounts.
export function TeamRibbon({ members, progressRef, enterRef, onUnsupported }: TeamRibbonProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(-1)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const wrap = wrapRef.current
    const label = labelRef.current
    if (!wrap || !label) return

    let disposed = false
    let dispose: (() => void) | undefined

    import('three')
      .then((THREE) => {
        if (disposed) return
        try {
          dispose = createRibbonScene(THREE, {
            wrap,
            label,
            members,
            progressRef,
            enterRef,
            onHover: (index) => {
              setHovered(index)
              if (index >= 0) setShown(index)
            },
          })
        } catch {
          onUnsupported()
        }
      })
      .catch(onUnsupported)

    return () => {
      disposed = true
      dispose?.()
    }
  }, [members, progressRef, enterRef, onUnsupported])

  const member = members[shown]

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {/* The canvas is not readable by assistive tech, so list the team in text too. */}
      <ul className="sr-only">
        {members.map((m) => (
          <li key={m.id}>
            {m.name}, {m.role}
          </li>
        ))}
      </ul>

      <div ref={labelRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-10">
        <div
          className={`-translate-x-1/2 -translate-y-full whitespace-nowrap text-center transition-opacity duration-300 ${hovered >= 0 ? 'opacity-100' : 'opacity-0'}`}
        >
          <GlitchName text={member.name} active={hovered >= 0} className="block font-display text-xl font-bold leading-tight" />
          <span className="mt-0.5 block text-xs font-medium">{member.role}</span>
        </div>
      </div>
    </div>
  )
}
