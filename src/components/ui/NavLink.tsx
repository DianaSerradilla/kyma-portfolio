import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type NavLinkProps = {
  href: string
  children: ReactNode
  /** Padding around the label; the rolling copy uses the same one so both line up. */
  padding?: string
  /** Extra classes for the anchor (e.g. rounded corners). */
  className?: string
  /** Colours of the rolling copy. */
  rollClassName?: string
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

// On hover/focus an inverted copy of the label rolls up from below.
// Meant for dark surfaces: light label, inverted to dark on light.
export function NavLink({
  href,
  children,
  padding = 'py-[0.12em] pr-2',
  className = '',
  rollClassName = 'bg-paper text-ink',
}: NavLinkProps) {
  const reduceMotion = useReducedMotion()
  const transition = { duration: reduceMotion ? 0 : 0.55, ease: EASE_OUT_EXPO }

  return (
    <motion.a
      href={href}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className={`relative block w-fit overflow-hidden whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
    >
      <span className={`block ${padding}`}>{children}</span>
      <motion.span
        aria-hidden
        variants={{ rest: { y: '101%' }, hover: { y: '0%' } }}
        transition={transition}
        className={`absolute inset-0 block ${padding} ${rollClassName}`}
      >
        <motion.span
          variants={{ rest: { y: '160%' }, hover: { y: '0%' } }}
          transition={transition}
          className="block"
        >
          {children}
        </motion.span>
      </motion.span>
    </motion.a>
  )
}
