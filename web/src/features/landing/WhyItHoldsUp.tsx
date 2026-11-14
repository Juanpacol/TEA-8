import './landing.css'

const POINTS = [
  ['Says when it isn’t sure', 'Unknown data stays unknown, and the limits are on screen.'],
  ['Every claim shows its source', 'Each sentence carries a label: NASA data, a calculation, AI text or a citation.'],
  ['Built on open, public data', 'NASA and USDA services that need no account.'],
  ['No account needed', 'The page runs from static data. Questions to the AI are optional.'],
]

export function WhyItHoldsUp() {
  return (
    <section className="differentiators">
      <h2>Why it holds up</h2>
      <div className="differentiators__grid">
        {POINTS.map(([title, text]) => (
          <div key={title} className="differentiators__card">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
