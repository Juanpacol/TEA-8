import { useI18n } from '../../shared/i18n/index.ts'
import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR } from './gibs.ts'
import './map.css'

type Props = { year: number; compareYear: number | null; onChange: (year: number | null) => void; driestYear?: number }

const YEARS = Array.from({ length: NDVI_LAST_YEAR - NDVI_FIRST_YEAR + 1 }, (_, i) => NDVI_LAST_YEAR - i)

/** Picks a second year to show next to the chosen one on the map. */
export function CompareControl({ year, compareYear, onChange, driestYear }: Props) {
  const { t } = useI18n()
  return (
    <div className="map-compare-group">
      {driestYear !== undefined && driestYear !== year && compareYear !== driestYear && (
        <button type="button" className="map-compare__driest" onClick={() => onChange(driestYear)}>
          {t('compare.driest', { year: driestYear })}
        </button>
      )}
      <label className="map-compare">
        {t('compare.label')}
        <select
          value={compareYear ?? ''}
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
        >
          <option value="">{t('compare.none')}</option>
          {YEARS.filter((y) => y !== year).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
