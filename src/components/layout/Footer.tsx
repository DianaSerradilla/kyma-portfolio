import { Isotype } from '../brand/Logo'

// TODO: replace "#" with the real Instagram profile and mail address.
const contactLinks = [
  { label: 'Instagram', href: '#' },
  { label: 'Mail', href: '#' },
] as const

const siteMap = [
  { label: 'Inicio', href: '#top' },
  { label: 'Quienes Somos', href: '#quienes-somos' },
  { label: 'Portafolio', href: '#portafolio' },
  { label: 'Manifiesto', href: '#manifiesto' },
] as const

const linkClass =
  'transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'

export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-16 px-5 pb-28 pt-20 md:px-8 md:pt-28 lg:flex-row lg:items-end lg:justify-between">
        <p className="font-display text-[clamp(3rem,9vw,8rem)] font-light uppercase leading-[0.9]">
          Ideas <Isotype className="h-[0.85em] align-[-0.08em] text-primary" /> en
          <strong className="block font-bold">Movimiento</strong>
        </p>

        <div className="flex gap-16 text-xs md:gap-24">
          <div>
            <h2 className="mb-3 font-bold uppercase">Contactanos</h2>
            <ul className="space-y-1 uppercase">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Mapa de sitio</h2>
            <ul className="space-y-1 uppercase">
              {siteMap.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
