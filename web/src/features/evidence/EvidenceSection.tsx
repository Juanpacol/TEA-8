import { useState } from 'react'
import { OriginLabel } from '../../shared/components/index.ts'
import type { Rotation } from '../../shared/lib/rotation.ts'
import { splitCitation } from './citation.ts'
import { splitLead } from './lead.ts'
import './evidence.css'

type Statement = Rotation['explanation']['why'][number]

/** How many statements show before "Show more". */
const VISIBLE = 3

export function EvidenceSection({ title, statements, collapsed = false }: { title: string; statements: Statement[]; collapsed?: boolean }) {
  const [all, setAll] = useState(false)
  const shown = all ? statements : statements.slice(0, VISIBLE)
  const body = (
    <>
      {statements.length === 0 ? (
        <p className="evidence__empty">Nothing recorded.</p>
      ) : (
        <ul className="evidence__list">
          {shown.map((statement) => {
            const { lead, rest } = splitLead(statement.text)
            return (
              <li key={statement.text} className="evidence__item">
                <OriginLabel origin={statement.origin} />
                <p className="evidence__text">
                  {rest ? (
                    <>
                      <strong>{lead}</strong> {rest}
                    </>
                  ) : (
                    <span className="evidence__single">{lead}</span>
                  )}
                </p>
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
            )
          })}
        </ul>
      )}
      {statements.length > VISIBLE && (
        <button type="button" className="evidence__more" onClick={() => setAll(!all)}>
          {all ? 'Show fewer' : `Show ${statements.length - VISIBLE} more`}
        </button>
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
