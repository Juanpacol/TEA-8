import { useDepth } from '../../shared/hooks/useDepth.ts'
import { useParallax } from '../../shared/hooks/useParallax.ts'
import { useReveal } from '../../shared/hooks/useReveal.ts'
import './landing.css'

export function Hero() {
  const { first, second } = useParallax<HTMLDivElement, HTMLDivElement>()
  const { ref, visible } = useReveal<HTMLDivElement>()
  const depth = useDepth<HTMLElement>()

  return (
    <header ref={depth} className="hero">
      <div ref={first} className="hero__art hero__art--right" aria-hidden="true" />
      <div ref={second} className="hero__art hero__art--left" aria-hidden="true" />
      <div className="hero__fade" aria-hidden="true" />
      <div ref={ref} className={`hero__content reveal${visible ? ' reveal--visible' : ''}`}>
        <h1 className="hero__name">TEA-8</h1>
        <span className="hero__rule" aria-hidden="true" />
        <p className="hero__tagline">Evidence before advice</p>
        <p className="hero__meta">Crop rotations &middot; NASA data &middot; McLean County, Illinois</p>
      </div>
      <a className="hero__scroll" href="#intro">
        <span>Scroll</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </header>
  )
}
