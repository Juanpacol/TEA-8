import { Button, Card } from '../../shared/components/index.ts'
import type { RotationSummary } from './compare.ts'
import { plural } from './labels.ts'
import './rotations.css'

type Props = { summary: RotationSummary; selected: boolean; onSelect: () => void }

export function RotationCard({ summary, selected, onSelect }: Props) {
  return (
    <Card highlighted={selected} className="rotation">
      <h3>{summary.name}</h3>
      <p className={`rotation__tag${summary.hypothetical ? ' rotation__tag--hypothetical' : ''}`}>
        {summary.isCurrent ? 'In use today' : 'Hypothetical: not seen in the observed fields'}
      </p>
      <ol className="rotation__sequence" aria-label="Crops in order">
        {summary.sequence.map((crop, index) => (
          <li key={`${crop}-${index}`}>{crop}</li>
        ))}
      </ol>
      {summary.addedCrops.length > 0 && <p className="rotation__added">Adds: {summary.addedCrops.join(', ')}</p>}
      <ul className="rotation__counts">
        <li>{plural(summary.sourcesRead, 'source', 'sources')} read</li>
        <li>{plural(summary.sourcesToVerify, 'source', 'sources')} not yet verified</li>
        <li>{plural(summary.gaps, 'thing', 'things')} we do not know</li>
        <li>{plural(summary.risks, 'risk', 'risks')} for a local expert</li>
      </ul>
      <Button variant={selected ? 'primary' : 'ghost'} onClick={onSelect} aria-pressed={selected}>
        {selected ? 'Showing evidence' : 'Show evidence'}
      </Button>
    </Card>
  )
}
