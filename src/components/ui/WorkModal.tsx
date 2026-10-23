import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import type { Service, Work } from '../../data/services'
import { getLenis } from '../../lib/smoothScroll'

export type OpenWork = { service: Service; work: Work }

type WorkModalProps = {
  item: OpenWork | null
  onClose: () => void
}

// A work shown over the page: native <dialog> (focus stays inside, Esc closes it), with the
// page behind darkened. Smooth scrolling is paused while it is open. The window takes the
// shape of the piece: wide for a horizontal one, tall with the details beside it for a vertical one.
export function WorkModal({ item, onClose }: WorkModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !item) return

    if (!dialog.open) dialog.showModal()
    getLenis()?.stop()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(dialog, { opacity: 0, y: 36, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' })
    }

    return () => {
      getLenis()?.start()
      if (dialog.open) dialog.close()
    }
  }, [item])

  const ratio = item?.work.ratio ?? 16 / 9
  const portrait = ratio < 1
  // The piece is as large as fits the screen while keeping its own proportions.
  const mediaWidth = portrait ? `min(78vw, calc(76svh * ${ratio}))` : `min(86vw, calc(58svh * ${ratio}), 66rem)`

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // A click on the dark area (the dialog element itself, outside its content) closes it.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
      aria-labelledby="work-modal-title"
      className="m-auto max-h-[94svh] w-fit max-w-[96vw] overflow-auto rounded-[1.75rem] border-0 bg-paper p-0 text-ink backdrop:bg-ink/85 backdrop:backdrop-blur-sm md:rounded-[2.25rem]"
    >
      {item && (
        <div
          style={{ '--media': mediaWidth } as React.CSSProperties}
          className={`flex flex-col gap-5 p-5 md:gap-8 md:p-8 ${portrait ? 'md:flex-row' : ''}`}
        >
          {/* Details: above the piece when it is horizontal, beside it when it is vertical. */}
          <div
            className={`flex flex-col gap-5 ${portrait ? 'order-1 md:order-2 md:w-72 md:justify-between' : 'order-1 w-[var(--media)]'}`}
          >
            <div>
              <div className="flex items-start justify-between gap-6">
                <p className="text-xs font-medium uppercase tracking-wider">
                  {item.service.title} · {item.work.caption}
                </p>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Cerrar"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-primary hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <h3
                id="work-modal-title"
                className="mt-4 font-display text-[clamp(2rem,4.6vw,4.25rem)] font-bold uppercase leading-[0.95] tracking-[-0.01em]"
              >
                {item.work.title}
              </h3>
            </div>

            <ul className="flex flex-wrap gap-2">
              {item.service.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-ink/40 px-3 py-1.5 text-xs font-medium">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{ width: 'var(--media)', aspectRatio: ratio }}
            className={`overflow-hidden rounded-2xl bg-ink/10 ${portrait ? 'order-2 mx-auto md:order-1 md:mx-0' : 'order-2'}`}
          >
            {item.work.media?.kind === 'image' && (
              <img src={item.work.media.src} alt={item.work.title} className="size-full object-contain" />
            )}
            {item.work.media?.kind === 'video' && (
              <video
                src={item.work.media.src}
                poster={item.work.media.poster}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-contain"
              />
            )}
            {!item.work.media && (
              <div aria-hidden className="grid size-full place-items-center text-xs font-medium uppercase tracking-wider">
                Próximamente
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
