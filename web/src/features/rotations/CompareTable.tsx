import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { capitalize } from './labels.ts'
import { outcomesFor, plainChange } from '../yields/yields.ts'
import './compare-table.css'

type Props = { data: TEA8DataFile; year: number; selectedId: string; onSelect: (id: string) => void }

/** The rotations side by side, one card each. It gives no score and no ranking: the decision belongs to the farmer. */
export function CompareTable({ data, year, selectedId, onSelect }: Props) {
  return (
    <div className="compare">
      <p className="compare__note">
        What each crop did in {year} against its usual yield, as county figures. It is not a result for the rotation.
      </p>
      <ul className="compare__list">
        {data.rotations.map((rotation) => (
          <li key={rotation.id} className="compare__card" data-selected={rotation.id === selectedId}>
            <button type="button" className="compare__pick" onClick={() => onSelect(rotation.id)}>
              {capitalize(rotation.sequence.join(' + '))}
            </button>
            <span className="compare__status">{rotation.hypothetical ? 'Hypothetical' : 'In use today'}</span>
            <ul className="compare__crops">
              {outcomesFor(data, rotation.sequence, year).map((outcome) => (
                <li key={outcome.crop}>
                  <strong>{capitalize(outcome.crop)}</strong>{' '}
                  {outcome.kind === 'yield' ? plainChange(outcome.record.change_vs_trend.value) : 'no county data in this tool'}
                </li>
              ))}
            </ul>
            <span className="compare__gaps">What we do not know: {rotation.explanation.gaps.length}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
