import { SectionLabel } from '../components/ui/SectionLabel'
import { categories, works } from '../data/portfolio'

export function Portfolio() {
  return (
    <section id="portafolio" aria-labelledby="portafolio-title" className="bg-secondary text-paper">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28">
        <SectionLabel id="portafolio-title" className="text-center">Portafolio</SectionLabel>

        <ul className="mt-12">
          {categories.map((category) => (
            <li key={category} className="border-b border-paper/25 py-4 font-display text-3xl font-light md:py-5 md:text-5xl">
              {category}
            </li>
          ))}
        </ul>

        <ul className="mt-12 flex items-start justify-between gap-4 pb-24 md:gap-8">
          {works.map((work) => (
            <li key={work.id} className={work.layout}>
              <p className="mb-2 text-[0.625rem] font-medium uppercase leading-tight">{work.title}</p>
              {/* Placeholder thumbnail — replace with the real piece */}
              <div aria-hidden className="aspect-square rounded-md bg-paper/85" />
            </li>
          ))}
        </ul>

        {/* Scroll progress — static for now */}
        <div aria-hidden className="h-0.5 rounded-full bg-paper/25">
          <div className="h-full w-1/4 rounded-full bg-paper" />
        </div>
      </div>
    </section>
  )
}
