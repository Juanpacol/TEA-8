import { OriginLabel } from '../../shared/components/index.ts'
import type { Rotation } from '../../shared/lib/rotation.ts'
import { splitCitation } from './citation.ts'
import './evidence.css'

type Statement = Rotation['explanation']['why'][number]

export function EvidenceSection({ title, statements, collapsed = false }: { title: string; statements: Statement[]; collapsed?: boolean }) {
  const body = (
    <>
      {statements.length === 0 ? (
        <p className="evidence__empty">Nothing recorded.</p>
      ) : (
        <ul className="evidence__list">
          {statements.map((statement) => (
            <li key={statement.text}>
              <OriginLabel origin={statement.origin} /> {statement.text}
              {statement.citation && (
                <details className="evidence__citation">
                  <summary>Source</summary>
                  {splitCitation(statement.citation).map((part, index) =>
                    part.kind === 'link' ? (
                      <a key={index} href={part.value} target="_blank" rel="noopener noreferrer">
                        {part.value}
                      </a>
                    ) : (
                      <span key={index}>{part.value}</span>
                    ),
                  )}
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
  return collapsed ? (
    <details className="evidence__section evidence__fold">
      <summary>
        {title} ({statements.length})
      </summary>
      {body}
    </details>
  ) : (
    <section className="evidence__section">
      <h3>{title}</h3>
      {body}
    </section>
  )
}
