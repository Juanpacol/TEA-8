import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { outcomesFor, signed } from '../yields/yields.ts'
import './compare-table.css'

type Props = { data: TEA8DataFile; year: number; selectedId: string; onSelect: (id: string) => void }

/** The rotations side by side. It gives no score and no ranking: the decision belongs to the farmer. */
export function CompareTable({ data, year, selectedId, onSelect }: Props) {
  return (
    <div className="compare">
      <p className="compare__note">
        Yield against trend is the county figure of {year} for each crop. It is not a result for the rotation.
      </p>
      <div className="compare__scroll" tabIndex={0} role="region" aria-label="Rotations side by side">
        <table className="compare__table">
          <thead>
            <tr>
              <th scope="col">Rotation</th>
              <th scope="col">Crops</th>
              <th scope="col">Yield vs trend, {year}</th>
              <th scope="col">Open gaps</th>
            </tr>
          </thead>
          <tbody>
            {data.rotations.map((rotation) => (
              <tr key={rotation.id} data-selected={rotation.id === selectedId}>
                <th scope="row">
                  <button type="button" className="compare__pick" onClick={() => onSelect(rotation.id)}>
                    {rotation.name}
                  </button>
                  <span className="compare__status">{rotation.hypothetical ? 'Hypothetical' : 'In use today'}</span>
                </th>
                <td>{rotation.sequence.join(', ')}</td>
                <td>
                  {outcomesFor(data, rotation.sequence, year).map((outcome) => (
                    <div key={outcome.crop}>
                      {outcome.crop}:{' '}
                      {outcome.kind === 'yield' && outcome.record.change_vs_trend.value !== null
                        ? signed(outcome.record.change_vs_trend.value)
                        : 'no data'}
                    </div>
                  ))}
                </td>
                <td>{rotation.explanation.gaps.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
