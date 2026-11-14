import './evidence.css'

/** Fixed notice shown on every screen of the tool. */
export function Notice() {
  return (
    <aside className="notice" role="note">
      <strong>TEA-8 supports a decision and does not replace it.</strong> It gives no final score and no
      &ldquo;best option&rdquo;. Review every rotation with local agricultural expertise before acting.
    </aside>
  )
}
