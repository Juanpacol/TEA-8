import type { ReactNode } from 'react'
import './landing.css'

/** The page ending: pictures on both sides, the project name as a faint ghost word, and the last sections above them. */
export function FooterConnector({ children }: { children: ReactNode }) {
  return (
    <div className="footer-connector">
      <div className="footer-connector__art footer-connector__art--left" aria-hidden="true" />
      <div className="footer-connector__art footer-connector__art--right" aria-hidden="true" />
      <span className="footer-connector__ghost" aria-hidden="true">
        TEA-8
      </span>
      <div className="footer-connector__content">{children}</div>
    </div>
  )
}
