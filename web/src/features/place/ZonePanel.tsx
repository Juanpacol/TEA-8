import { useRef, useState } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import { ZoneRefused, fetchZoneEvidence, isUnavailable, type ZoneEvidence } from '../../shared/lib/placeApi.ts'
import { ClimateSection, Limits } from './PlacePanel.tsx'
import { PlaceAsk } from './PlaceAsk.tsx'
import { ReportActions } from './ReportActions.tsx'
import './place.css'

type Corner = { lat: number; lon: number }
type State =
  | { status: 'idle' }
  | { status: 'loading'; key: string }
  | { status: 'ready'; key: string; evidence: ZoneEvidence }
  | { status: 'failed'; key: string; code: string }

const zoneKey = (corners: Corner[]) => corners.map((c) => `${c.lat.toFixed(6)},${c.lon.toFixed(6)}`).join(';')

const REFUSALS: Record<string, 'zonePanel.tooLarge' | 'zonePanel.outside' | 'zonePanel.bad'> = {
  TOO_LARGE: 'zonePanel.tooLarge',
  OUTSIDE_COVERAGE: 'zonePanel.outside',
  BAD_REQUEST: 'zonePanel.bad',
}

function Result({ evidence }: { evidence: ZoneEvidence }) {
  const { t } = useI18n()
  const { climate, soil, crops } = evidence
  return (
    <div className="place-panel__result">
      <section>
        <h4>{t('zonePanel.soil')}</h4>
        {soil === null ? (
          <p>{t('placePanel.noSoil')}</p>
        ) : isUnavailable(soil) ? (
          <p>{t('placePanel.unavailable')}</p>
        ) : (
          <>
            <ul className="zone-panel__soils">
              {soil.soils.map((entry) => (
                <li key={`${entry.name}-${entry.drainage}`}>
                  <span className="zone-panel__bar" style={{ width: `${Math.min(entry.share_pct, 100)}%` }} aria-hidden="true" />
                  <span>
                    <strong>{entry.share_pct}%</strong> {entry.name}
                    {entry.drainage ? `, ${entry.drainage.toLowerCase()}` : ''}
                    {entry.hydrologic_group ? ` (${t('zonePanel.group', { group: entry.hydrologic_group })})` : ''}
                  </span>
                </li>
              ))}
            </ul>
            <p className="place-panel__source">{t('zonePanel.soilNote')} {soil.source}.</p>
          </>
        )}
      </section>
      <section>
        <h4>{t('zonePanel.crops')}</h4>
        {isUnavailable(crops) ? (
          <p>{t('placePanel.unavailable')}</p>
        ) : (
          <>
            <ol className="zone-panel__crops">
              {Object.entries(crops.years).map(([year, counts]) => (
                <li key={year}>
                  <span>{year}</span>
                  <span>
                    {Object.keys(counts).length
                      ? Object.entries(counts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([crop, n]) => t('zonePanel.cropCount', { crop, n, total: crops.points }))
                          .join(' · ')
                      : t('field.noData')}
                  </span>
                </li>
              ))}
            </ol>
            <p className="place-panel__source">{t('zonePanel.cropsNote', { n: crops.points })} {crops.source}.</p>
          </>
        )}
      </section>
      <ClimateSection climate={climate} />
      <Limits limits={evidence.limits} />
      <p className="place-panel__source">{t('zonePanel.queried', { date: evidence.queried_on })}</p>
    </div>
  )
}

/** The evidence of a field the person drew or loaded, asked from the sources when they want it. */
export function ZonePanel({ corners }: { corners: Corner[] }) {
  const { t } = useI18n()
  const [state, setState] = useState<State>({ status: 'idle' })
  const report = useRef<HTMLElement>(null)
  const key = zoneKey(corners)
  const current = state.status !== 'idle' && state.key === key ? state : { status: 'idle' as const }

  async function analyze() {
    setState({ status: 'loading', key })
    try {
      const evidence = await fetchZoneEvidence(corners)
      setState((now) => ('key' in now && now.key === key ? { status: 'ready', key, evidence } : now))
    } catch (failure) {
      const code = failure instanceof ZoneRefused ? failure.code : 'UNAVAILABLE'
      setState((now) => ('key' in now && now.key === key ? { status: 'failed', key, code } : now))
    }
  }

  return (
    <section ref={report} className="place-panel" aria-label={t('zonePanel.aria')}>
      <header className="place-panel__report-head">
        <h3>{t('report.titleZone')}</h3>
        {current.status === 'ready' && (
          <p>
            {t('report.zoneLine', {
              hectares: current.evidence.zone.area_ha,
              corners: current.evidence.zone.corners,
              lat: current.evidence.zone.center.lat,
              lon: current.evidence.zone.center.lon,
            })}
          </p>
        )}
      </header>
      <div className="place-panel__head">
        <p>{t('zonePanel.intro')}</p>
        <button type="button" disabled={current.status === 'loading'} onClick={() => void analyze()}>
          {t(current.status === 'loading' ? 'placePanel.loading' : 'zonePanel.analyze')}
        </button>
      </div>
      <div role="status">
        {current.status === 'loading' && <p>{t('placePanel.wait')}</p>}
        {current.status === 'failed' && <p>{t(REFUSALS[current.code] ?? 'placePanel.failed')}</p>}
      </div>
      {current.status === 'ready' && (
        <>
          <Result evidence={current.evidence} />
          <ReportActions target={{ zone: corners }} report={report} />
          <PlaceAsk
            context={{ zone: corners.map((c) => [Number(c.lat.toFixed(6)), Number(c.lon.toFixed(6))] as [number, number]) }}
            examples={["Which soils cover most of my field?", "Which summers were dry around my field?", "What was grown in my field in 2020?"]}
          />
        </>
      )}
    </section>
  )
}
