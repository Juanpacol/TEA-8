import type { HTMLAttributes } from 'react'
import './components.css'

type Props = HTMLAttributes<HTMLElement> & { highlighted?: boolean }

export function Card({ highlighted = false, className = '', ...rest }: Props) {
  return <article className={`card ${highlighted ? 'card--highlighted' : ''} ${className}`.trim()} {...rest} />
}
