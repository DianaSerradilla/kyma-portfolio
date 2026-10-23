import { useEffect, useRef, useState } from 'react'
import type { Work } from '../../data/services'

export type TileLayout = {
  /** CSS width on wide screens, where the pieces sit side by side in a strip. */
  width: string
  /** Proportions used when the piece has none of its own (a placeholder). */
  ratio: string
  /** How far it floats above (negative) or below the middle of the strip, on wide screens. */
  lift: string
  /** CSS width on narrow screens, where the pieces are stacked in a column. */
  mobileWidth: string
  /** Which side of the column it leans to on narrow screens. */
  mobileAlign: 'start' | 'center' | 'end'
}

type WorkTileProps = {
  work: Work
  layout: TileLayout
  onOpen: () => void
}

const alignClass = {
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
} as const

// One piece in the strip (or in the column on a phone): its caption above and the piece itself,
// with its own proportions. A video shows its still and plays only while the pointer or the
// keyboard is on it; on a touch screen, while it is mostly in view.
export function WorkTile({ work, layout, onOpen }: WorkTileProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const ratio = work.ratio ?? null
  // A tall piece must not outgrow the screen, so its width is capped by the height it would need.
  const width = ratio ? `min(${layout.width}, calc(66svh * ${ratio}))` : layout.width
  const mobileWidth = ratio ? `min(${layout.mobileWidth}, calc(70svh * ${ratio}))` : layout.mobileWidth
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const root = rootRef.current
    if (!root || !window.matchMedia('(hover: none)').matches) return
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.6 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      data-tile
      style={{ '--w': width, '--mw': mobileWidth, '--lift': layout.lift } as React.CSSProperties}
      className={`w-[var(--mw)] ${alignClass[layout.mobileAlign]} md:w-[var(--w)] md:shrink-0 md:translate-y-[var(--lift)] md:self-auto`}
    >
      <p className="mb-3 text-[0.7rem] font-medium uppercase leading-tight">
        {work.title}, {work.caption}
      </p>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Abrir ${work.title}`}
        onClick={onOpen}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setActive(true)}
        onPointerLeave={(event) => event.pointerType === 'mouse' && setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        style={{ aspectRatio: ratio ?? layout.ratio }}
        className="relative block w-full overflow-hidden rounded-xl border border-current/20 bg-current/10 text-left transition-transform duration-500 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      >
        {work.media?.kind === 'image' && (
          <img src={work.media.src} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        )}
        {work.media?.kind === 'video' && (
          <>
            <img src={work.media.poster} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
            {active && !reduceMotion && (
              <video
                src={work.media.src}
                poster={work.media.poster}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </>
        )}
      </button>
    </div>
  )
}
