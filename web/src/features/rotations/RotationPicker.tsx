import type { RotationSummary } from './compare.ts'
import { rotationName } from './labels.ts'
import './rotations.css'

type Props = { summaries: RotationSummary[]; selectedId: string; onSelect: (id: string) => void }

/** The rotations as one choice, each named by its crops. No score and no "best" marker. */
export function RotationPicker({ summaries, selectedId, onSelect }: Props) {
  return (
    <div className="picker" role="radiogroup" aria-label="Crop rotation">
      {summaries.map((summary) => (
        <button
          key={summary.id}
          type="button"
          role="radio"
          aria-checked={summary.id === selectedId}
          className="picker__option"
          onClick={() => onSelect(summary.id)}
        >
          <strong>{rotationName(summary)}</strong>
          <span>{summary.isCurrent ? 'In use today' : 'Hypothetical: not seen in the observed fields'}</span>
        </button>
      ))}
    </div>
  )
}
