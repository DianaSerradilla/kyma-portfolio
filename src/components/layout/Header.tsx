import { navLinks } from '../../data/navigation'
import { Logotype } from '../brand/Logo'
import { NavLink } from '../ui/NavLink'

export function Header() {
  return (
    <header data-header data-cursor-iso className="absolute inset-x-0 top-0 z-50 text-paper">
      <div className="mx-auto flex max-w-[1600px] items-start justify-between px-5 py-5 md:px-8">
        <NavLink href="#top">
          <Logotype className="h-5 align-top" label="Kyma, ir al inicio" />
        </NavLink>

        {/* On phones the links live in the fixed menu button (MobileMenu). */}
        <nav aria-label="Principal" className="hidden text-xs font-medium md:block">
          <ul className="flex flex-col items-end gap-1 sm:flex-row sm:gap-6 md:gap-10">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
