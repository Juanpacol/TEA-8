import type { ButtonHTMLAttributes } from 'react'
import './components.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return <button className={`btn btn--${variant} ${className}`.trim()} {...rest} />
}
