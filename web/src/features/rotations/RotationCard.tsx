import { Button, Card } from '../../shared/components/index.ts'
import type { RotationSummary } from './compare.ts'
import './rotations.css'

type Props = { summary: RotationSummary; selected: boolean; onSelect: () => void }

export function RotationCard({ summary, selected, onSelect }: Props) {
  return (
    <Card highlighted={selected} className="rotation">
      <h3>{summary.name}</h3>
      <p className="rotation__tag">{summary.isCurrent ? 'In use today' : 'Hypothetical: not seen in the observed fields'}</p>
      <ol className="rotation__sequence" aria-label="Crops in order">
        {summary.sequence.map((crop, index) => (
          <li key={`${crop}-${index}`}>{crop}</li>
        ))}
      </ol>
      {summary.addedCrops.length > 0 && <p className="rotation__added">Adds: {summary.addedCrops.join(', ')}</p>}
      <ul className="rotation__counts">
        <li>{summary.sourcesRead} source(s) read</li>
        <li>{summary.sourcesToVerify} source(s) still to verify</li>
        <li>{summary.gaps} gap(s)</li>
        <li>{summary.risks} risk(s) for local review</li>
      </ul>
      <Button variant={selected ? 'primary' : 'ghost'} onClick={onSelect} aria-pressed={selected}>
        {selected ? 'Showing evidence' : 'Show evidence'}
      </Button>
    </Card>
  )
}
