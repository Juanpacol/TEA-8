import { capitalize, cropName, useI18n } from '../../shared/i18n/index.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { rotationName } from './labels.ts'
import { outcomesFor, plainChange } from '../yields/yields.ts'
import './compare-table.css'

type Props = { data: TEA8DataFile; year: number; selectedId: string; onSelect: (id: string) => void }

/** The rotations side by side, one card each. It gives no score and no ranking: the decision belongs to the farmer. */
export function CompareTable({ data, year, selectedId, onSelect }: Props) {
  const { t } = useI18n()
  return (
    <div className="compare">
      <p className="compare__note">
        {t('compare.note', { year })}
      </p>
      <ul className="compare__list">
        {data.rotations.map((rotation) => (
          <li key={rotation.id} className="compare__card" data-selected={rotation.id === selectedId}>
            <button type="button" className="compare__pick" onClick={() => onSelect(rotation.id)}>
              {rotationName(t, rotation)}
            </button>
            <span className="compare__status">{t(rotation.hypothetical ? 'picker.hypothetical' : 'picker.current')}</span>
            <ul className="compare__crops">
              {outcomesFor(data, rotation.sequence, year).map((outcome) => (
                <li key={outcome.crop}>
                  <strong>{capitalize(cropName(t, outcome.crop))}</strong>{' '}
                  {outcome.kind === 'yield' ? plainChange(t, outcome.record.change_vs_trend.value) : t('compare.noData')}
                </li>
              ))}
            </ul>
            {rotation.summer_field_share?.value != null && (
              <span className="compare__gaps">{t('compare.exposure', { n: Math.round(rotation.summer_field_share.value) })}</span>
            )}
            <span className="compare__gaps">{t('compare.gaps', { n: rotation.explanation.gaps.length })}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
