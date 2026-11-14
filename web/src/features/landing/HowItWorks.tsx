import './landing.css'

const STEPS = [
  'Reads the weather and the soil: NASA POWER and the USDA soil survey.',
  'Looks at what grew: CropScape history, year by year.',
  'Compares three rotations, including the one in use today.',
  'Shows its work: every statement is tagged with its source.',
]

export function HowItWorks() {
  return (
    <section className="section">
      <h2>How it works</h2>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}
