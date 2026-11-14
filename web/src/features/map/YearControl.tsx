import { useI18n } from '../../shared/i18n/index.ts'
import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR } from './gibs.ts'
import './map.css'

type Props = { year: number; onChange: (year: number) => void; dryYears?: number[] }

/** Picks the summer: one step back or forward, or a slide, with the dry summers marked on the track. */
export function YearControl({ year, onChange, dryYears = [] }: Props) {
  const { t } = useI18n()
  const last = NDVI_LAST_YEAR
  const span = last - NDVI_FIRST_YEAR
  const marks = dryYears.filter((y) => y >= NDVI_FIRST_YEAR && y <= last)
  const step = (by: number) => onChange(Math.min(last, Math.max(NDVI_FIRST_YEAR, year + by)))

  return (
    <div className="year-control">
      <span className="year-control__label">{t('year.label')}</span>
      <strong className="year-control__value">{year}</strong>
      <div className="year-control__row">
        <button type="button" className="year-control__step" aria-label={t('year.prev')} disabled={year <= NDVI_FIRST_YEAR} onClick={() => step(-1)}>
          ‹
        </button>
        <div className="year-control__track">
          <input
            type="range"
            min={NDVI_FIRST_YEAR}
            max={last}
            value={year}
            aria-label={t('year.label')}
            aria-valuetext={t('year.valuetext', { year })}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          <div className="year-control__marks" aria-hidden="true">
            {marks.map((y) => (
              <button
                key={y}
                type="button"
                tabIndex={-1}
                className="year-control__mark"
                title={`${y}: ${t('year.dry')}`}
                style={{ left: `calc(8px + (100% - 16px) * ${(y - NDVI_FIRST_YEAR) / span})` }}
                onClick={() => onChange(y)}
              />
            ))}
          </div>
          <div className="year-control__ends" aria-hidden="true">
            <span>{NDVI_FIRST_YEAR}</span>
            <span>{last}</span>
          </div>
        </div>
        <button type="button" className="year-control__step" aria-label={t('year.next')} disabled={year >= last} onClick={() => step(1)}>
          ›
        </button>
      </div>
      {marks.length > 0 && (
        <p className="year-control__legend">
          <i aria-hidden="true" /> {t('year.dry')}
        </p>
      )}
    </div>
  )
}
