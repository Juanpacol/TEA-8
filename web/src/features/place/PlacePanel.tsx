import { useI18n } from '../../shared/i18n/index.ts'
import { isUnavailable, type PlaceClimate, type PlaceEvidence, type Unavailable } from '../../shared/lib/placeApi.ts'
import { useRef } from 'react'
import { formatCoords } from '../map/index.ts'
import { PlaceAsk } from './PlaceAsk.tsx'
import { ReportActions } from './ReportActions.tsx'
import { placeKey, usePlaceEvidence } from './usePlaceEvidence.ts'
import './place.css'

type Props = { place: { lat: number; lon: number } }

/** The limits the service sends with every answer (in English, like the evidence). */
export function Limits({ limits }: { limits: string[] }) {
  const { t } = useI18n()
  return (
    <section>
      <h4>{t('report.limits')}</h4>
      <ul className="place-panel__limits">
        {limits.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
    </section>
  )
}

/** The summer climate of the grid cell, with the dry summers of the project rule. Shared by a point and a field. */
export function ClimateSection({ climate }: { climate: PlaceClimate | Unavailable }) {
  const { t } = useI18n()
  return (
    <section>
      <h4>{t('placePanel.climate')}</h4>
      {isUnavailable(climate) ? (
        <p>{t('placePanel.unavailable')}</p>
      ) : (
        <>
          <p>
            {climate.dry_years.length
              ? t('placePanel.dryYears', { years: climate.dry_years.join(', '), baseline: climate.baseline })
              : t('placePanel.noDryYears', { baseline: climate.baseline })}
          </p>
          <ol className="place-panel__years" aria-label={t('placePanel.wetnessAria')}>
            {climate.seasons.map((season) => (
              <li key={season.year} className={season.dry ? 'is-dry' : undefined}>
                <span>{season.year}</span>
                <span>{season.root_wetness.toFixed(2)}</span>
              </li>
            ))}
          </ol>
          <p className="place-panel__source">{t('placePanel.climateNote')} {climate.source}.</p>
        </>
      )}
    </section>
  )
}

function Result({ evidence }: { evidence: PlaceEvidence }) {
  const { t } = useI18n()
  const { climate, soil, crops } = evidence
  return (
    <div className="place-panel__result">
      <ClimateSection climate={climate} />
      <section>
        <h4>{t('placePanel.soil')}</h4>
        {soil === null ? (
          <p>{t('placePanel.noSoil')}</p>
        ) : isUnavailable(soil) ? (
          <p>{t('placePanel.unavailable')}</p>
        ) : (
          <>
            <p>
              {t('placePanel.soilLine', {
                name: soil.name,
                drainage: (soil.drainage ?? t('field.noData')).toLowerCase(),
                group: soil.hydrologic_group ?? t('field.noData'),
              })}
            </p>
            <p>
              {t('placePanel.soilFigures', {
                organic: soil.organic_matter_pct ?? t('field.noData'),
                water: soil.available_water ?? t('field.noData'),
              })}
            </p>
            <p className="place-panel__source">{soil.source}.</p>
          </>
        )}
      </section>
      <section>
        <h4>{t('placePanel.crops')}</h4>
        {isUnavailable(crops) ? (
          <p>{t('placePanel.unavailable')}</p>
        ) : (
          <>
            <ol className="place-panel__years place-panel__years--crops">
              {Object.entries(crops.years).map(([year, crop]) => (
                <li key={year}>
                  <span>{year}</span>
                  <span>{crop ?? t('field.noData')}</span>
                </li>
              ))}
            </ol>
            <p className="place-panel__source">{t('placePanel.cropsNote')} {crops.source}.</p>
          </>
        )}
      </section>
      <Limits limits={evidence.limits} />
      <p className="place-panel__source">{t('placePanel.queried', { date: evidence.queried_on })}</p>
    </div>
  )
}

/** The evidence of the place chosen on the map, asked from the sources when the person wants it. */
export function PlacePanel({ place }: Props) {
  const { t } = useI18n()
  const { state, analyze } = usePlaceEvidence()
  const report = useRef<HTMLElement>(null)
  const current = state.status !== 'idle' && state.key === placeKey(place) ? state : { status: 'idle' as const }
  return (
    <section ref={report} className="place-panel" aria-label={t('placePanel.aria')}>
      <header className="place-panel__report-head">
        <h3>{t('report.titlePlace')}</h3>
        <p>{formatCoords(t, place)}</p>
      </header>
      <div className="place-panel__head">
        <p>{t('placePanel.intro')}</p>
        <button type="button" disabled={current.status === 'loading'} onClick={() => void analyze(place)}>
          {t(current.status === 'loading' ? 'placePanel.loading' : 'placePanel.analyze')}
        </button>
      </div>
      <div role="status">
        {current.status === 'loading' && <p>{t('placePanel.wait')}</p>}
        {current.status === 'failed' && <p>{t('placePanel.failed')}</p>}
      </div>
      {current.status === 'ready' && (
        <>
          <Result evidence={current.evidence} />
          <ReportActions target={{ place }} report={report} />
          <PlaceAsk
            context={{ place: { lat: Number(place.lat.toFixed(5)), lon: Number(place.lon.toFixed(5)) } }}
            examples={["Which summers were dry here?", "What soil is at this point?", "What was grown here since 2008?"]}
          />
        </>
      )}
    </section>
  )
}
