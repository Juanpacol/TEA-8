import type { CasePoint } from '../../shared/lib/data-types.ts'
import { cropOfYear } from './field.ts'
import './field.css'

type Props = {
  points: CasePoint[]
  year: number
  /** The case point the user chose, or null when none is chosen. */
  selectedId: string | null
  onSelect: (point: CasePoint) => void
}

/** Big buttons to pick an example field: the quickest way in, no map reading needed. */
export function FieldCards({ points, year, selectedId, onSelect }: Props) {
  return (
    <div className="field-cards" role="group" aria-label="Pick an example field">
      {points.map((point) => {
        const crop = cropOfYear(point, year)
        return (
          <button
            key={point.id}
            type="button"
            className="field-card"
            aria-pressed={point.id === selectedId}
            onClick={() => onSelect(point)}
          >
            <strong>{point.label}</strong>
            <span>{point.soil.name} soil</span>
            <span>{crop ? `${crop} in ${year}` : `No crop record for ${year}`}</span>
          </button>
        )
      })}
    </div>
  )
}
