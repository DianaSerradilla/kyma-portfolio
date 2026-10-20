import { Logo } from '../components/brand/Logo'
import { SectionLabel } from '../components/ui/SectionLabel'

export function Manifesto() {
  return (
    <section
      id="manifiesto"
      aria-labelledby="manifiesto-title"
      className="mx-auto max-w-[1600px] px-5 py-24 md:px-8 md:py-40"
    >
      <SectionLabel id="manifiesto-title" className="text-center">Manifiesto</SectionLabel>

      <p className="mt-24 flex items-center gap-6 font-display text-3xl font-medium uppercase md:mt-40 md:gap-10 md:text-5xl">
        Somos
        {/* Placeholder for the animated manifesto word */}
        <span aria-hidden className="h-16 flex-1 rounded-full bg-paper/10 md:h-24" />
        <Logo className="h-12 md:h-20" />
      </p>
    </section>
  )
}
