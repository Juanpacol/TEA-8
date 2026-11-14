import { Button } from '../../shared/components/index.ts'
import './landing.css'

export function CallToAction() {
  return (
    <section className="cta">
      <h2>See what the data says.</h2>
      <a href="#/tool">
        <Button>Open the tool</Button>
      </a>
      <a className="cta__link" href="https://github.com/Juanpacol/TEA-8">
        GitHub repository
      </a>
      <div className="cta__team">
        <p className="cta__team-label">Built by</p>
        <p className="cta__team-name">Juan Pablo Botero</p>
      </div>
    </section>
  )
}
