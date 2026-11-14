import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'

/**
 * Inertial smooth scrolling for the page that calls it. Does nothing when the visitor asks for
 * reduced motion. Stops when the component unmounts, so other routes keep native scrolling.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ anchors: true })
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
