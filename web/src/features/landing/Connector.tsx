import type { ReactNode } from 'react'
import './landing.css'

/** Two sections that read as one block: Why McLean County and How it works. */
export function Connector({ children }: { children: ReactNode }) {
  return (
    <div className="connector">
      <div className="connector__content">{children}</div>
    </div>
  )
}
