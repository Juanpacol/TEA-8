import { useI18n } from '../../shared/i18n/index.ts'
import { NDVI_LEGEND_STOPS } from './gibs.ts'
import './map.css'

const GRADIENT = `linear-gradient(to right, ${NDVI_LEGEND_STOPS.join(', ')})`

/** What the colors of the map mean, and which image is being shown. */
export function MapLegend({ year }: { year: number }) {
  const { t } = useI18n()
  const county = t('county.name')
  return (
    <figure className="legend">
      <div className="legend__row">
        <span>{t('legend.few')}</span>
        <div className="legend__bar" style={{ backgroundImage: GRADIENT }} role="img" aria-label={t('legend.scaleAria')} />
        <span>{t('legend.many')}</span>
      </div>
      <p className="legend__key">
        <span className="legend__line" aria-hidden="true" /> {t('legend.key', { county })}
      </p>
      <figcaption className="legend__caption">
        <details>
          <summary>{t('legend.about')}</summary>
          <p>{t('legend.p1', { county })}</p>
          <p>{t('legend.p2', { year })}</p>
        </details>
      </figcaption>
    </figure>
  )
}
