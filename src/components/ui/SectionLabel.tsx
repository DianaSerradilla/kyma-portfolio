type SectionLabelProps = {
  id: string
  children: string
  className?: string
}

export function SectionLabel({ id, children, className = '' }: SectionLabelProps) {
  return (
    <h2 id={id} className={`text-xs font-medium uppercase tracking-wider ${className}`}>
      {children}
    </h2>
  )
}
