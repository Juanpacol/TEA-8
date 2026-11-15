import type { CSSProperties } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR } from './gibs.ts'
import { barShare, type YearBar } from './wetness-bars.ts'
import './map.css'

type Props = { year: number; onChange: (year: number) => void; bars?: YearBar[] }

/** Picks the summer: one step back or forward, or a slide, with one bar per summer showing how wet the soil was (dry summers in ochre). */
export function YearControl({ year, onChange, bars = [] }: Props) {
  const { t } = useI18n()
  const last = NDVI_LAST_YEAR
  const span = last - NDVI_FIRST_YEAR
  const anyDry = bars.some((bar) => bar.dry)
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
            style={{ '--fill': `${((year - NDVI_FIRST_YEAR) / span) * 100}%` } as CSSProperties}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          <div className="year-control__marks" aria-hidden="true">
            {bars.map((bar) => (
              <button
                key={bar.year}
                type="button"
                tabIndex={-1}
                className={`year-control__bar${bar.dry ? ' year-control__bar--dry' : ''}${bar.year === year ? ' year-control__bar--on' : ''}`}
                title={t('year.barTitle', { year: bar.year, deviation: bar.deviation === null ? t('field.noData') : `${bar.deviation > 0 ? '+' : ''}${bar.deviation}`, dry: bar.dry ? ` · ${t('year.dry')}` : '' })}
                style={{ left: `calc(8px + (100% - 16px) * ${(bar.year - NDVI_FIRST_YEAR) / span})`, height: `${barShare(bar.deviation) * 100}%` }}
                onClick={() => onChange(bar.year)}
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
      {bars.length > 0 && (
        <p className="year-control__legend">
          {anyDry && <i aria-hidden="true" />} {t('year.barsLegend')}
        </p>
      )}
    </div>
  )
}
