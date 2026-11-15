import './landing.css'

const REPO = 'https://github.com/Juanpacol/TEA-8'

export function OpenSource() {
  return (
    <section className="open-source">
      <h2>Open code, open data</h2>
      <p>
        Every number comes from public NASA and USDA services, and the code is public, so anyone can check where a
        figure comes from or challenge it.
      </p>
      <a className="outline-link" href={REPO}>
        View the repository
      </a>
      <p className="open-source__note">
        AI assistants helped write the code and the text, and Muse Spark answers questions in the tool.{' '}
        <a href="#/ai">See how we use AI</a>.
      </p>
    </section>
  )
}
