import { useEffect, useRef } from 'react'

type FitTextProps = {
  children: string
  className?: string
  /** Share of the available width the word fills (script faces overhang their box, so they take a bit less). */
  fill?: number
  /** Largest font size in px, so a short word does not become enormous. */
  max?: number
}

const PHONE = '(max-width: 767px)'

// A word that grows or shrinks until it is as wide as the space it sits in. It only does so on
// phones; from the tablet width up the class decides the size.
export function FitText({ children, className = '', fill = 1, max = Infinity }: FitTextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const word = ref.current
    const parent = word?.parentElement
    if (!word || !parent) return

    const query = window.matchMedia(PHONE)
    const fit = () => {
      if (!query.matches) {
        word.style.fontSize = ''
        return
      }
      // Measure at a known size, then scale to the width that is available.
      word.style.fontSize = '100px'
      const measured = word.getBoundingClientRect().width
      const style = getComputedStyle(parent)
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (measured > 0 && available > 0) word.style.fontSize = `${Math.min(max, (100 * available * fill) / measured)}px`
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(parent)
    query.addEventListener('change', fit)
    void document.fonts.ready.then(fit)
    return () => {
      observer.disconnect()
      query.removeEventListener('change', fit)
    }
  }, [children, fill, max])

  return (
    <span ref={ref} className={`inline-block whitespace-nowrap ${className}`}>
      {children}
    </span>
  )
}
