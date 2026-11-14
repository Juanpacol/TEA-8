import { useEffect, useRef } from 'react'

/**
 * Gives the layers inside an element a sense of depth: as the pointer moves over the element,
 * `--depth-x` and `--depth-y` (each between -1 and 1) follow it with easing. CSS decides how far
 * each layer moves and turns with them. Does nothing for reduced motion or touch screens.
 */
export function useDepth<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return

    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let frame = 0

    const step = () => {
      x += (targetX - x) * 0.05
      y += (targetY - y) * 0.05
      element.style.setProperty('--depth-x', x.toFixed(3))
      element.style.setProperty('--depth-y', y.toFixed(3))
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002 ? requestAnimationFrame(step) : 0
    }
    const run = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      targetX = ((event.clientX - box.left) / box.width) * 2 - 1
      targetY = ((event.clientY - box.top) / box.height) * 2 - 1
      run()
    }
    const onLeave = () => {
      targetX = 0
      targetY = 0
      run()
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return ref
}
