import '@fontsource-variable/nunito'
import '@fontsource/pinyon-script'

export type FontSpec = {
  family: string
  weight: number
  uppercase?: boolean
  /** Used while the typeface is missing or loading. */
  fallback: string
}

// The brand typefaces, in the order the hero word rotates through them.
// Pinyon Script is the accent (very striking titles, used sparingly). Stolzl is declared in
// index.css (@font-face); the fallback only applies while it loads.
export const FONTS: FontSpec[] = [
  { family: 'Pinyon Script', weight: 400, fallback: 'cursive' },
  { family: 'Nunito Variable', weight: 800, uppercase: true, fallback: 'sans-serif' },
  { family: 'Stolzl', weight: 700, fallback: '"Nunito Variable", sans-serif' },
]

export const fontStack = (font: FontSpec) => `"${font.family}", ${font.fallback}`
