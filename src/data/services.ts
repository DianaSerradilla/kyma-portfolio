import manifest from '../assets/portfolio/manifest.json'

export type ServiceTone = 'primary' | 'secondary' | 'ink'

export type Work = {
  id: string
  title: string
  /** Short line shown above the piece (category, kind of piece...). */
  caption: string
  /** Width divided by height of the piece. */
  ratio?: number
  media?: { kind: 'image'; src: string } | { kind: 'video'; src: string; poster: string }
}

export type Service = {
  id: string
  title: string
  tags: string[]
  description: string
  tone: ServiceTone
  works: Work[]
}

// The compressed pieces (see src/assets/portfolio/manifest.json) and their addresses once built.
const files = import.meta.glob<string>('../assets/portfolio/**/*.{mp4,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})
const urlOf = (file: string) => files[`../assets/portfolio/${file}`]

// A piece of a service, looked up by its folder and name in the manifest.
function work(service: string, slug: string, title: string, caption: string): Work {
  const entry = manifest.find((item) => item.service === service && item.slug === slug)
  if (!entry) throw new Error(`Missing portfolio piece: ${service}/${slug}`)
  const src = urlOf(entry.file)
  const ratio = entry.width / entry.height
  if (entry.kind === 'image') return { id: `${service}-${slug}`, title, caption, ratio, media: { kind: 'image', src } }
  return {
    id: `${service}-${slug}`,
    title,
    caption,
    ratio,
    media: { kind: 'video', src, poster: urlOf(`${service}/${slug}-poster.webp`) },
  }
}

// Texts and tags are a first draft; the pieces are the ones in the Portofolio folder.
export const services: Service[] = [
  {
    id: 'diseno-grafico',
    title: 'Diseño gráfico',
    tags: ['Ilustración', 'Doble exposición', 'Póster', 'Piezas gráficas'],
    description: 'Piezas visuales con intención: composición, color y tipografía al servicio de cada idea.',
    tone: 'primary',
    works: [
      work('grafico', 'arcane', 'Arcane', 'Ilustración'),
      work('grafico', 'star-wars', 'Star Wars', 'Ilustración'),
      work('grafico', 'national', 'National', 'Doble exposición'),
      work('grafico', 'joker', 'Joker', 'Póster animado'),
    ],
  },
  {
    id: 'diseno-web',
    title: 'Diseño web',
    tags: ['UI / UX', 'Sitios web', 'Landing pages', 'Interacción'],
    description: 'Sitios y experiencias interactivas pensados desde quien los usa, con animación y detalle.',
    tone: 'secondary',
    works: [
      work('web', 'greenway', 'Greenway', 'Sitio web'),
      work('web', 'landing-architecture', 'Landing arquitectura', 'Landing page'),
      work('web', 'fotografia-naturaleza', 'Fotografía y naturaleza', 'Sitio web'),
    ],
  },
  {
    id: 'modelado-3d',
    title: 'Modelado 3D',
    tags: ['Personajes', 'Producto', 'Animación', 'Render'],
    description: 'Personajes, objetos y escenas en tres dimensiones, listos para animar o renderizar.',
    tone: 'ink',
    works: [
      work('3d', 'walle', 'Wall-E', 'Render 3D'),
      work('3d', 'personaje-nay-2', 'Personaje Nay', 'Render 3D'),
      work('3d', 'auriculares', 'Auriculares', 'Animación 3D'),
      work('3d', 'tamagotchi', 'Tamagotchi', 'Animación 3D'),
      work('3d', 'personaje-nay-1', 'Personaje Nay, versión 2', 'Render 3D'),
    ],
  },
  {
    id: 'branding',
    title: 'Branding',
    tags: ['Identidad', 'Logotipo', 'Sistema visual', 'Mockups'],
    description: 'Identidades que se reconocen: del concepto al logotipo y todo el sistema que lo acompaña.',
    tone: 'primary',
    works: [
      work('branding', 'bicicleta', 'Bicicleta', 'Mockup E-bit'),
      work('branding', 'bolso', 'Bolso', 'Mockup E-bit'),
      work('branding', 'gafete', 'Gafete', 'Mockup E-bit'),
      work('branding', 'tazas', 'Tazas', 'Mockup E-bit'),
      work('branding', 'reloj', 'Reloj', 'Mockup E-bit'),
      work('branding', 'papeleria', 'Papelería', 'Mockup E-bit'),
      work('branding', 'cuaderno', 'Cuaderno', 'Mockup E-bit'),
      work('branding', 'apple-watch', 'Apple Watch', 'Mockup E-bit'),
    ],
  },
  {
    id: 'motion-graphic',
    title: 'Motion graphic',
    tags: ['Animación 2D', 'Animación 3D', 'Edición', 'Postproducción'],
    description: 'Animación que da vida a las ideas con ritmo y narrativa, en dos y tres dimensiones.',
    tone: 'secondary',
    works: [
      work('motion', 'duolingo', 'Duolingo', 'Animación 2D'),
      work('motion', 'starbucks', 'Starbucks', 'Animación 2D'),
      work('motion', 'gol', 'Gol', 'Motion graphic'),
      work('motion', 'nena', 'Nena', 'Animación'),
      work('motion', 'pato', 'Pato', 'Historia animada'),
      work('motion', 'reel-futbol', 'Reel fútbol', 'Animación'),
      work('motion', 'reel-jugo', 'Reel jugo', 'Animación'),
    ],
  },
]
