import type { HTMLAttributes } from 'react'
import './components.css'

type Props = HTMLAttributes<HTMLElement> & { title?: string }

export function Panel({ title, children, className = '', ...rest }: Props) {
  return (
    <section className={`panel ${className}`.trim()} {...rest}>
      {title && <h2 className="panel__title">{title}</h2>}
      {children}
    </section>
  )
}
