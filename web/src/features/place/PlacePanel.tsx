import { useI18n } from '../../shared/i18n/index.ts'
import { isUnavailable, type PlaceEvidence } from '../../shared/lib/placeApi.ts'
import { placeKey, usePlaceEvidence } from './usePlaceEvidence.ts'
import './place.css'

type Props = { place: { lat: number; lon: number } }

function Result({ evidence }: { evidence: PlaceEvidence }) {
  const { t } = useI18n()
  const { climate, soil, crops } = evidence
  return (
    <div className="place-panel__result">
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
      <p className="place-panel__source">{t('placePanel.queried', { date: evidence.queried_on })}</p>
    </div>
  )
}

/** The evidence of the place chosen on the map, asked from the sources when the person wants it. */
export function PlacePanel({ place }: Props) {
  const { t } = useI18n()
  const { state, analyze } = usePlaceEvidence()
  const current = state.status !== 'idle' && state.key === placeKey(place) ? state : { status: 'idle' as const }
  return (
    <section className="place-panel" aria-label={t('placePanel.aria')}>
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
      {current.status === 'ready' && <Result evidence={current.evidence} />}
    </section>
  )
}
