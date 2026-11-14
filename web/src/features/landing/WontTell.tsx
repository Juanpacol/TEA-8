import './landing.css'

const LIMITS = [
  'It gives no final score and no "best option".',
  'Alternative rotations are hypothetical and rest on cited studies.',
  'Climate data comes from a grid of about 50 km, not from a plot.',
  'Satellite and model data are estimates seen from above, not measurements taken in the field.',
  'Without real yields, the comparison measures stress and exposure, not outcomes.',
]

export function WontTell() {
  return (
    <section className="section">
      <h2>What it won&rsquo;t tell you</h2>
      <ul className="checklist">
        {LIMITS.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
    </section>
  )
}
