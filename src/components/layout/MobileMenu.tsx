import { useEffect, useRef, useState } from 'react'
import { navLinks } from '../../data/navigation'
import { getLenis } from '../../lib/smoothScroll'

// Menu for phones: a round button that stays fixed in the corner and opens the links full screen.
// Wider screens use the header nav and the bottom bar instead.
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // While it is open the page behind must not scroll.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    getLenis()?.stop()
    firstLinkRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      root.style.overflow = previous
      getLenis()?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // If the window grows past the phone layout, the menu has nothing to show.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const onChange = () => query.matches && setOpen(false)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const bar = 'absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-transform duration-300'

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        className="fixed right-4 top-4 z-[70] size-12 rounded-full border border-paper/15 bg-ink/55 text-paper backdrop-blur-xl backdrop-saturate-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span aria-hidden className={`${bar} ${open ? 'rotate-45' : '-translate-y-[0.4rem]'}`} />
        <span aria-hidden className={`${bar} ${open ? '-rotate-45' : 'translate-y-[0.4rem]'}`} />
      </button>

      <nav
        id="mobile-menu"
        aria-label="Principal"
        inert={!open}
        className={`fixed inset-0 z-[60] flex flex-col justify-center bg-ink/92 px-8 backdrop-blur-2xl transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <ul className="flex flex-col gap-5">
          {navLinks.map((link, index) => (
            <li key={link.href} className="overflow-hidden">
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${120 + index * 70}ms` : '0ms' }}
                className={`block font-display text-[clamp(1.75rem,10.5vw,4rem)] font-bold uppercase leading-[1.02] text-paper transition-transform duration-500 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${open ? 'translate-y-0' : 'translate-y-[115%]'}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
