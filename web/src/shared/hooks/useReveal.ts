import { useEffect, useRef, useState } from 'react'

/** True once the element has entered the viewport. Stays true after the first time. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      // Fire as soon as the top edge is 80px inside the screen. A fraction of the height would keep tall sections blank for a long scroll.
      { threshold: 0, rootMargin: '0px 0px -80px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}
