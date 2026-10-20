export function Brandboard() {
  return (
    <section
      id="brandboard"
      aria-labelledby="brandboard-title"
      className="relative flex min-h-[70svh] items-center justify-center rounded-t-section bg-ink text-paper"
    >
      <h2 id="brandboard-title" className="absolute left-5 top-6 text-xs font-medium md:left-8 md:top-8">
        Brandboard animado
      </h2>

      {/* Placeholder for the animated brandboard (video / animation) */}
      <svg aria-hidden viewBox="0 0 24 24" className="size-14 fill-current md:size-20">
        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
      </svg>
    </section>
  )
}
