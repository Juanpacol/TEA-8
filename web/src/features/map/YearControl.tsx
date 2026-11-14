import { useI18n } from '../../shared/i18n/index.ts'
import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR } from './gibs.ts'
import './map.css'

type Props = { year: number; onChange: (year: number) => void }

export function YearControl({ year, onChange }: Props) {
  const { t } = useI18n()
  return (
    <label className="year-control">
      <span>
        {t('year.label')} <strong>{year}</strong>
      </span>
      <input
        type="range"
        min={NDVI_FIRST_YEAR}
        max={NDVI_LAST_YEAR}
        value={year}
        aria-valuetext={t('year.valuetext', { year })}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
