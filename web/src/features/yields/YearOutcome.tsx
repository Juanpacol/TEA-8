import type { Rotation, TEA8DataFile } from '../../shared/lib/data-types.ts'
import { describeChange, dryRange, outcomesFor, signed, summerVerdict } from './yields.ts'
import './yields.css'

type Props = { data: TEA8DataFile; rotation: Rotation; year: number }

/** What the county yields say about the chosen summer for the crops of the chosen rotation. */
export function YearOutcome({ data, rotation, year }: Props) {
  const season = data.seasons.find((s) => s.year === year)
  const outcomes = outcomesFor(data, rotation.sequence, year)
  const ranges = rotation.sequence
    .map((crop) => dryRange(data, crop))
    .filter((range): range is NonNullable<typeof range> => range !== null)
  const rule = data.dry_summer_rule

  return (
    <section className="outcome" aria-label={`What happened in ${year}`}>
      <h4 className="outcome__title">
        {year} was {summerVerdict(season?.dry)}
      </h4>
      <ul className="outcome__list">
        {outcomes.map((outcome) =>
          outcome.kind === 'yield' ? (
            <li key={outcome.crop}>
              <strong>{outcome.crop}</strong> {outcome.record.yield.value} {outcome.record.yield.unit}:{' '}
              {describeChange(outcome.record.change_vs_trend.value)} ({outcome.record.expected.value} expected)
            </li>
          ) : (
            <li key={outcome.crop} className="outcome__none">
              <strong>{outcome.crop}</strong>{' '}
              {outcome.reason === 'not-published' ? `no county yield published for ${year} yet` : 'no county yield data in this tool'}
            </li>
          ),
        )}
      </ul>
      {ranges.map((range) => (
        <p key={range.crop} className="outcome__range">
          In the {range.count} dry summers since 2001, {range.crop} went from {signed(range.lowest)} to {signed(range.highest)} against its
          trend.
        </p>
      ))}
      <details className="outcome__how">
        <summary>How this is worked out</summary>
        <p>
          Yields are county averages from USDA NASS surveys, not measurements of these fields or of this rotation. The expected yield is a
          straight line through the years that were not dry summers.
        </p>
        {rule && (
          <p>
            Dry summer: {rule.rationale} (threshold {rule.threshold} {rule.unit}).
          </p>
        )}
      </details>
    </section>
  )
}
