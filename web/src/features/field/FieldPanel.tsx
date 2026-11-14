import type { CasePoint } from '../../shared/lib/data-types.ts'
import { alternatesEveryYear, cropLetter, cropOfYear, distinctCrops } from './field.ts'
import './field.css'

type Props = { points: CasePoint[]; year: number; onSelectYear: (year: number) => void }

/** The soil and the crops grown at each case point, so the comparison shows what it assumes. */
export function FieldPanel({ points, year, onSelectYear }: Props) {
  return (
    <div className="field">
      {points.map((point) => (
        <section key={point.id} className="field__point" aria-label={point.label}>
          <h4 className="field__title">{point.label}</h4>
          <p className="field__soil">
            {point.soil.name}, {point.soil.drainage.toLowerCase()}, hydrologic group {point.soil.hydrologic_group}.
          </p>
          <ul className="field__figures">
            <li>
              Organic matter {point.soil.organic_matter.value ?? 'no data'} {point.soil.organic_matter.unit}
            </li>
            <li>
              Available water {point.soil.available_water.value ?? 'no data'} {point.soil.available_water.unit}
            </li>
          </ul>
          <p className="field__source">
            {point.soil.organic_matter.source}, queried {point.soil.organic_matter.queried_on}.
          </p>

          <p className="field__subtitle">
            Crop each year{alternatesEveryYear(point) ? ': it alternated every year' : ''}. Pick a year to show its summer.
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
                      aria-label={`${y}: ${crop ?? 'no data'}. Show this summer.`}
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
            {distinctCrops(point).map((crop) => `${cropLetter(crop)} ${crop.toLowerCase()}`).join(' · ')}. Years 2008 to 2023.
          </p>
          <p className="field__source">
            {point.crop_history[0]?.source}, queried {point.crop_history[0]?.queried_on}. One pixel at the point, not the whole field.
          </p>
        </section>
      ))}
    </div>
  )
}
