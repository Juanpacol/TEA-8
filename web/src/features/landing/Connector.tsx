import type { ReactNode } from 'react'
import { useParallax } from '../../shared/hooks/useParallax.ts'
import './landing.css'

/** Two sections that share one picture crossing the line between them. */
export function Connector({ children }: { children: ReactNode }) {
  const { first } = useParallax<HTMLDivElement, HTMLDivElement>(0.05)

  return (
    <div className="connector">
      <div ref={first} className="connector__art" aria-hidden="true" />
      <div className="connector__content">{children}</div>
    </div>
  )
}
