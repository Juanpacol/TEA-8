import { Panel } from '../../shared/components/index.ts'
import type { Figure, Season } from '../../shared/lib/data-types.ts'
import { describeDeviation, formatFigure } from './season.ts'
import './season.css'

function Row({ label, figure, note }: { label: string; figure: Figure; note?: string | null }) {
  const value = formatFigure(figure)
  return (
    <div className="season__row">
      <dt>{label}</dt>
      <dd>
        {value ?? <span className="season__unknown">No data</span>}
        {value !== null && note && <span className="season__note"> ({note})</span>}
        <span className="season__source">
          {figure.source}, {figure.parameter}, queried {figure.queried_on}
        </span>
      </dd>
    </div>
  )
}

type Props = { year: number; season: Season | undefined; pointLabel: string }

/** The June to August climate of the year shown on the map, with the source of every figure. */
export function SeasonPanel({ year, season, pointLabel }: Props) {
  return (
    <Panel title={`Summer ${year} at ${pointLabel}`}>
      {season === undefined ? (
        <p className="season__unknown">The data file has no climate figures for {year}.</p>
      ) : (
        <dl className="season">
          <Row label="Rainfall (daily mean)" figure={season.rainfall} />
          <Row label="Temperature (mean)" figure={season.temperature} />
          <Row
            label="Root-zone soil wetness"
            figure={season.root_wetness}
            note="0 is dry, 1 is saturated"
          />
          <Row
            label="Compared with 2001-2023"
            figure={season.root_wetness_deviation}
            note={describeDeviation(season.root_wetness_deviation.value)}
          />
        </dl>
      )}
      <p className="season__caveat">
        June to August. NASA POWER gives one value for a grid cell of about 50 km, so it describes the area, not a plot.
      </p>
    </Panel>
  )
}
