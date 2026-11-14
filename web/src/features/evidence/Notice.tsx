import './evidence.css'

/** Fixed notice shown on every screen of the tool: one line. */
export function Notice() {
  return (
    <aside className="notice" role="note">
      <strong>Supports a decision, does not replace it.</strong> No score and no &ldquo;best option&rdquo;: review every
      rotation with local expertise.
    </aside>
  )
}
