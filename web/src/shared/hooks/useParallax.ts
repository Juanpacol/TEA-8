import { useEffect, useRef } from 'react'

/** Moves two elements in opposite vertical directions as the page scrolls. Does nothing when the visitor prefers reduced motion. */
export function useParallax<A extends HTMLElement, B extends HTMLElement>(speed = 0.12) {
  const first = useRef<A>(null)
  const second = useRef<B>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const offset = window.scrollY * speed
      first.current?.style.setProperty('--parallax', `${offset}px`)
      second.current?.style.setProperty('--parallax', `${-offset}px`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [speed])

  return { first, second }
}
