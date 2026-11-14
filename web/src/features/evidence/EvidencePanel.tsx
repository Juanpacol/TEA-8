import { OriginLabel, Panel } from '../../shared/components/index.ts'
import type { Rotation } from '../../shared/lib/rotation.ts'
import { splitCitation } from './citation.ts'
import { OriginKey } from './OriginKey.tsx'
import './evidence.css'

type Statement = Rotation['explanation']['why'][number]

function Section({ title, statements }: { title: string; statements: Statement[] }) {
  return (
    <section className="evidence__section">
      <h3>{title}</h3>
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
    </section>
  )
}

/** Why a rotation is suggested, its evidence, gaps and risks. Every sentence shows its origin. */
export function EvidencePanel({ rotation }: { rotation: Rotation }) {
  const { why, evidence, gaps, risks } = rotation.explanation
  return (
    <Panel title={`Evidence: ${rotation.name}`}>
      <OriginKey />
      <Section title="Why it is shown" statements={why} />
      <Section title="Evidence" statements={evidence} />
      <Section title="What we do not know" statements={gaps} />
      <Section title="Risks for a local expert to review" statements={risks} />
    </Panel>
  )
}
