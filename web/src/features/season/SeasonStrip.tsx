import { useI18n } from '../../shared/i18n/index.ts'
import type { Season } from '../../shared/lib/data-types.ts'
import { formatFigure, seasonHeadline } from './season.ts'
import './season.css'

type Props = { year: number; season: Season | undefined; pointLabel: string; baseline?: string; afterBaseline?: boolean }

/** One sentence and three figures for the summer on the map. The sources are one click away. */
export function SeasonStrip({ year, season, pointLabel, baseline, afterBaseline = false }: Props) {
  const { t } = useI18n()
  const none = t('field.noData')
  return (
    <div className="season-strip">
      <p className="season__headline">{seasonHeadline(t, season, year)}</p>
      {afterBaseline && (
        <p className="season-strip__baseline" role="note">
          {t('season.afterBaseline', { year, baseline: baseline ?? '' })}
        </p>
      )}
      {season !== undefined && (
        <>
          <p className="season-strip__numbers">
            {t('season.rain')} {formatFigure(season.rainfall) ?? none} · {t('season.temp')} {formatFigure(season.temperature) ?? none} ·{' '}
            {t('season.moisture')} {formatFigure(season.root_wetness) ?? none} {t('season.moistureScale')}
          </p>
          <details className="season-strip__sources">
            <summary>{t('season.sources')}</summary>
            <ul>
              {[season.rainfall, season.temperature, season.root_wetness, season.root_wetness_deviation].map((figure) => (
                <li key={figure.parameter}>
                  {t('season.sourceLine', { parameter: figure.parameter, source: figure.source, date: figure.queried_on })}
                </li>
              ))}
            </ul>
            <p>
              {t('season.gridNote', { point: pointLabel })}
            </p>
          </details>
        </>
      )}
    </div>
  )
}
