import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { navLinks } from '../../data/navigation'
import { Logotype } from '../brand/Logo'
import { NavLink } from '../ui/NavLink'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

// Fixed bottom bar that takes over from the header nav once the hero is left behind.
export function DockNav() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const header = document.querySelector('[data-header]')
    if (!header) return

    // The dock takes over the moment the top nav scrolls out of view.
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting))
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  const itemClass = 'rounded-full'
  // The bar is frosted glass with light text, so the rolling copy on hover is a light pill.
  const rollClass = 'bg-paper text-ink'
  const itemPadding = 'px-2.5 py-2.5 sm:px-4'

  return (
    <motion.nav
      aria-label="Principal (fijo)"
      // Hidden state must not be reachable by keyboard.
      inert={!visible}
      initial={false}
      animate={{ y: visible ? 0 : 110, opacity: visible ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE_OUT_EXPO }}
      // Phones use the fixed menu button instead of this bar.
      className="fixed bottom-4 left-1/2 z-50 hidden -translate-x-1/2 md:block sm:bottom-6"
    >
      {/* Transparent with the page blurred behind it; a light dark tint keeps the text readable over pale sections too. */}
      <ul className="flex items-center rounded-full border border-paper/15 bg-ink/55 p-1.5 text-[0.6875rem] font-medium text-paper backdrop-blur-xl backdrop-saturate-150 sm:text-xs">
        <li>
          <NavLink href="#top" padding={itemPadding} className={itemClass} rollClassName={rollClass}>
            <Logotype className="h-4 align-middle" label="Kyma, ir al inicio" />
          </NavLink>
        </li>
        {navLinks.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} padding={itemPadding} className={itemClass} rollClassName={rollClass}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </motion.nav>
  )
}
