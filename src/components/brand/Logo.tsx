import isoUrl from '../../assets/brand/kyma-iso.svg'
import logoUrl from '../../assets/brand/kyma-oscuro.svg'
import logotypeUrl from '../../assets/brand/kyma-logotipo.svg'

type MarkProps = {
  className?: string
  label?: string
}

type MaskedSvgProps = MarkProps & {
  src: string
  ratio: string
}

// The SVGs are single-colour, so they are used as a CSS mask:
// the mark takes the current text colour and works on any background.
function MaskedSvg({ src, ratio, className = '', label }: MaskedSvgProps) {
  const mask = `url("${src}")`

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block bg-current ${ratio} ${className}`}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}

export function Logo({ className, label = 'Kyma' }: MarkProps) {
  return <MaskedSvg src={logoUrl} ratio="aspect-[280.72/97.54]" className={className} label={label} />
}

// The wordmark on its own, without the isotype.
export function Logotype({ className, label = 'Kyma' }: MarkProps) {
  return <MaskedSvg src={logotypeUrl} ratio="aspect-[1347.87/757.7]" className={className} label={label} />
}

export function Isotype({ className, label }: MarkProps) {
  return <MaskedSvg src={isoUrl} ratio="aspect-[722.94/761.23]" className={className} label={label} />
}
