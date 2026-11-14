import type { ReactNode } from 'react'
import { useReveal } from '../../shared/hooks/useReveal.ts'
import './landing.css'

/** Fades its children in once, the first time they scroll into view. */
export function Reveal({ children }: { children: ReactNode }) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal${visible ? ' reveal--visible' : ''}`}>
      {children}
    </div>
  )
}
