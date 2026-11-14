import { Segmented } from '../../shared/components/index.ts'
import type { RotationSummary } from './compare.ts'
import { shortLabel } from './labels.ts'
import './rotations.css'

type Props = { summaries: RotationSummary[]; selectedId: string; onSelect: (id: string) => void }

/** Three rotations as one choice. The chosen one is described below. No score and no "best" marker. */
export function RotationPicker({ summaries, selectedId, onSelect }: Props) {
  const selected = summaries.find((summary) => summary.id === selectedId) ?? summaries[0]
  return (
    <div className="picker">
      <Segmented
        kind="radio"
        label="Crop rotation"
        options={summaries.map((summary) => ({ id: summary.id, label: shortLabel(summary) }))}
        value={selected.id}
        onChange={onSelect}
      />
      <div key={selected.id} className="picker__detail">
        <h4 className="picker__name">{selected.name}</h4>
        <ol className="picker__sequence" aria-label="Crops in order">
          {selected.sequence.map((crop, index) => (
            <li key={`${crop}-${index}`}>{crop}</li>
          ))}
        </ol>
        <p className="picker__tag">
          {selected.isCurrent ? 'In use today' : 'Hypothetical: not seen in the observed fields'}
        </p>
      </div>
    </div>
  )
}
