import { Button } from '../../shared/components/index.ts'
import './landing.css'

export function CallToAction() {
  return (
    <section className="section section--center">
      <h2>See what the data says</h2>
      <a href="#/tool">
        <Button>Try the tool</Button>
      </a>
      <p>
        <a href="https://github.com/Juanpacol/TEA-8">View the code</a>
      </p>
    </section>
  )
}
