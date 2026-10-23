import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { DockNav } from './components/layout/DockNav'
import { Header } from './components/layout/Header'
import { MobileMenu } from './components/layout/MobileMenu'
import { Preloader } from './components/preloader/Preloader'
import { Cursor } from './components/ui/Cursor'
import { initSmoothScroll } from './lib/smoothScroll'
import { About } from './sections/About'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import { Services } from './sections/Services'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => initSmoothScroll(), [])

  // Pinned sections measured their size while scrolling was locked; measure again once it is not.
  useEffect(() => {
    if (ready) ScrollTrigger.refresh()
  }, [ready])

  // Measure pinned sections again whenever the window width changes.
  useEffect(() => {
    let timer = 0
    let width = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === width) return
      width = window.innerWidth
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      {/* Outside #top: the preloader blurs #top and must not be blurred itself. */}
      <Preloader onDone={() => setReady(true)} />
      {/* Fine grain over every background; see .site-grain in index.css. */}
      <div aria-hidden className="site-grain" />
      <div id="top" className="relative">
        <Cursor />
        <Header />
        <DockNav />
        <MobileMenu />
        <main>
          <Hero start={ready} />
          <About />
          <Services />
          <Manifesto />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
