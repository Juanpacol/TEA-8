import type { Season } from '../../shared/lib/data-types.ts'
import { formatFigure, seasonHeadline } from './season.ts'
import './season.css'

type Props = { year: number; season: Season | undefined; pointLabel: string }

/** One sentence and three figures for the summer on the map. The sources are one click away. */
export function SeasonStrip({ year, season, pointLabel }: Props) {
  return (
    <div className="season-strip">
      <p className="season__headline">{seasonHeadline(season, year)}</p>
      {season !== undefined && (
        <>
          <p className="season-strip__numbers">
            Rain {formatFigure(season.rainfall) ?? 'no data'} · Temperature {formatFigure(season.temperature) ?? 'no data'} · Soil
            moisture {formatFigure(season.root_wetness) ?? 'no data'} (0 dry, 1 wet)
          </p>
          <details className="season-strip__sources">
            <summary>Where these numbers come from</summary>
            <ul>
              {[season.rainfall, season.temperature, season.root_wetness, season.root_wetness_deviation].map((figure) => (
                <li key={figure.parameter}>
                  {figure.parameter}: {figure.source}, queried {figure.queried_on}
                </li>
              ))}
            </ul>
            <p>
              {pointLabel}, June to August. One value for a grid cell of about 50 km: it describes the area, not a plot.
            </p>
          </details>
        </>
      )}
    </div>
  )
}
