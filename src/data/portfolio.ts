export const categories = [
  'Diseño gráfico',
  'Diseño Web',
  'Modelado 3D',
  'Branding',
  'Motion Graphic',
] as const

// Placeholder works taken from the wireframe. Replace with the real projects.
// `layout` holds the static size/offset of each thumbnail in the strip.
export const works = [
  { id: 'taffyta', title: 'Animación 3D - Taffyta Muttonfudge', layout: 'mt-0 w-[22%]' },
  { id: 'duolingo', title: 'Animación 2D - Duolingo', layout: 'mt-32 w-[10%]' },
  { id: 'starbucks', title: 'Animación 2D - Starbucks', layout: 'mt-10 w-[15%]' },
  { id: 'deportivo', title: 'Animación 2D - Deportivo', layout: '-mt-6 w-[12%]' },
  { id: 'cepita', title: 'Animación 2D - Cepita', layout: 'mt-16 w-[20%]' },
] as const
