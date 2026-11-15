import { useEffect } from 'react'

/** Gives `art-loaded` to each `[data-lazy-art]` element shortly before it scrolls into view, so its CSS background is fetched only then. */
export function useLazyArt() {
  useEffect(() => {
    const items = document.querySelectorAll('[data-lazy-art]')
    if (typeof IntersectionObserver === 'undefined') {
      items.forEach((item) => item.classList.add('art-loaded'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('art-loaded')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '200px 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])
}
