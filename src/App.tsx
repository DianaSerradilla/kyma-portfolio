import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { DockNav } from './components/layout/DockNav'
import { Header } from './components/layout/Header'
import { Preloader } from './components/preloader/Preloader'
import { Cursor } from './components/ui/Cursor'
import { initSmoothScroll } from './lib/smoothScroll'
import { About } from './sections/About'
import { Brandboard } from './sections/Brandboard'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import { Portfolio } from './sections/Portfolio'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => initSmoothScroll(), [])

  // Pinned sections measured their size while scrolling was locked; measure again once it is not.
  useEffect(() => {
    if (ready) ScrollTrigger.refresh()
  }, [ready])

  return (
    <>
      {/* Outside #top: the preloader blurs #top and must not be blurred itself. */}
      <Preloader onDone={() => setReady(true)} />
      <div id="top" className="relative">
        <Cursor />
        <Header />
        <DockNav />
        <main>
          <Hero start={ready} />
          <About />
          <Brandboard />
          <Portfolio />
          <Manifesto />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
