import { cropName, pointName, useI18n } from '../../shared/i18n/index.ts'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { describePlace, type Place } from '../map/index.ts'
import { alternatesEveryYear, cropLetter, cropOfYear, distinctCrops } from './field.ts'
import './field.css'

type Props = {
  points: CasePoint[]
  year: number
  onSelectYear: (year: number) => void
  /** The spot chosen on the map, so its nearest case point is marked here. */
  place: Place | null
  onShowOnMap: (place: Place) => void
}

/** The soil and the crops grown at each case point, so the comparison shows what it assumes. */
export function FieldPanel({ points, year, onSelectYear, place, onShowOnMap }: Props) {
  const { t } = useI18n()
  const chosenId = place ? describePlace(t, place, points, year).pointId : null
  return (
    <div className="field">
      {points.map((point) => (
        <section key={point.id} className="field__point" aria-label={pointName(t, point.label)}>
          <h4 className="field__title">
            {pointName(t, point.label)}
            {point.id === chosenId && <span className="field__chosen"> {t('field.chosen')}</span>}
          </h4>
          <button type="button" className="field__show" onClick={() => onShowOnMap({ lat: point.lat, lon: point.lon })}>
            {t('field.show', { label: pointName(t, point.label) })}
          </button>
          <p className="field__soil">
            {t('field.soilLine', { name: point.soil.name, drainage: point.soil.drainage.toLowerCase(), group: point.soil.hydrologic_group })}
          </p>
          <ul className="field__figures">
            <li>
              {t('field.organic', { value: point.soil.organic_matter.value ?? t('field.noData'), unit: point.soil.organic_matter.unit })}
            </li>
            <li>
              {t('field.water', { value: point.soil.available_water.value ?? t('field.noData'), unit: point.soil.available_water.unit })}
            </li>
          </ul>
          <p className="field__source">
            {t('field.queried', { source: point.soil.organic_matter.source, date: point.soil.organic_matter.queried_on })}
          </p>

          <p className="field__subtitle">
            {t('field.cropEach', { alternated: alternatesEveryYear(point) ? t('field.alternated') : '' })}
          </p>
          <ol className="field__years">
            {[...point.crop_history]
              .sort((a, b) => a.year - b.year)
              .map(({ year: y }) => {
                const crop = cropOfYear(point, y)
                return (
                  <li key={y}>
                    <button
                      type="button"
                      className="field__year"
                      aria-pressed={y === year}
                      aria-label={t('field.yearAria', { year: y, crop: crop ? cropName(t, crop) : t('field.noData') })}
                      onClick={() => onSelectYear(y)}
                    >
                      <span className="field__letter" data-crop={crop ?? ''}>
                        {cropLetter(crop)}
                      </span>
                      <span className="field__number">{String(y).slice(2)}</span>
                    </button>
                  </li>
                )
              })}
          </ol>
          <p className="field__legend">
            {distinctCrops(point).map((crop) => `${cropLetter(crop)} ${cropName(t, crop)}`).join(' · ')}. {t('field.years')}
          </p>
          <p className="field__source">
            {t('field.onePixel', { source: point.crop_history[0]?.source ?? '', date: point.crop_history[0]?.queried_on ?? '' })}
          </p>
        </section>
      ))}
    </div>
  )
}
