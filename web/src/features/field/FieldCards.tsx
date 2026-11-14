import { cropName, pointName, useI18n } from '../../shared/i18n/index.ts'
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
  const { t } = useI18n()
  return (
    <div className="field-cards" role="group" aria-label={t('field.pick')}>
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
            <strong>{pointName(t, point.label)}</strong>
            <span>{t('field.soil', { soil: point.soil.name })}</span>
            <span>{crop ? t('field.cropIn', { crop: cropName(t, crop), year }) : t('field.noCrop', { year })}</span>
          </button>
        )
      })}
    </div>
  )
}
