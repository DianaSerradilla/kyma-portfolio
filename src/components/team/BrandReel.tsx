import { useEffect, useRef, useState } from 'react'
import brandboardPoster from '../../assets/brandboard/brandboard-poster.jpg'
import brandboardVideo from '../../assets/brandboard/brandboard.mp4'

type BrandReelProps = {
  /** The video plays only while this is true (and the frame is on screen). */
  open: boolean
  /** The picture is drawn elsewhere (the 3D scene), so the video itself stays invisible. */
  hidden?: boolean
}

const buttonClass =
  'grid size-11 place-items-center rounded-full bg-paper text-ink transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

type IconProps = { children: React.ReactNode }

function Icon({ children }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 fill-none stroke-current stroke-2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const PlayIcon = () => (
  <Icon>
    <path d="M8 5.5v13l10.5-6.5z" className="fill-current" />
  </Icon>
)
const PauseIcon = () => (
  <Icon>
    <path d="M8.5 5.5v13M15.5 5.5v13" />
  </Icon>
)
const RestartIcon = () => (
  <Icon>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5M4.5 4.5v4h4" />
  </Icon>
)
const SoundOnIcon = () => (
  <Icon>
    <path d="M4.5 9.5h3l4.5-3.5v12l-4.5-3.5h-3zM15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  </Icon>
)
const SoundOffIcon = () => (
  <Icon>
    <path d="M4.5 9.5h3l4.5-3.5v12l-4.5-3.5h-3zM16 9.5l5 5M21 9.5l-5 5" />
  </Icon>
)

// The animated brandboard: shows its first frame until it is opened, then plays on loop.
// The parent decides the size; the controls appear when the parent sets data-full="1" and
// it has the `group` class.
export function BrandReel({ open, hidden = false }: BrandReelProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Someone who prefers less motion starts paused and presses play themselves.
  const userPaused = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (open && visible && !userPaused.current) void video.play().catch(() => undefined)
    else video.pause()
  }, [open, visible])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    userPaused.current = !video.paused
    if (video.paused) void video.play().catch(() => undefined)
    else video.pause()
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    userPaused.current = false
    void video.play().catch(() => undefined)
  }

  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div ref={rootRef} className="relative size-full">
      <video
        ref={videoRef}
        src={brandboardVideo}
        poster={brandboardPoster}
        muted
        loop
        playsInline
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="Brandboard animado"
        // Kept in the page, at one pixel, because some browsers only decode video that is attached.
        className={hidden ? 'pointer-events-none absolute left-0 top-0 size-px opacity-0' : 'size-full object-cover'}
      />

      {/* Icon buttons in a column; the words live in aria-label / title. */}
      <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-data-[full=1]:pointer-events-auto group-data-[full=1]:opacity-100 md:bottom-16 md:right-6">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          title={playing ? 'Pausar' : 'Reproducir'}
          className={buttonClass}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" onClick={restart} aria-label="Volver a empezar" title="Volver a empezar" className={buttonClass}>
          <RestartIcon />
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          title={muted ? 'Activar sonido' : 'Silenciar'}
          className={buttonClass}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
      </div>
    </div>
  )
}
