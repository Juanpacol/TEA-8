import type { Rotation, TEA8DataFile } from '../../shared/lib/data-types.ts'
import type { CropOutcome } from './yields.ts'
import { barShares, dryRange, outcomesFor, percentFromUsual, plainChange, plainUnit, summerVerdict, toneOf } from './yields.ts'
import './yields.css'

type Props = { data: TEA8DataFile; rotation: Rotation; year: number }

/** One crop: what it did against usual in words, a bar against the usual yield, and the figures. */
function CropRow({ outcome }: { outcome: Extract<CropOutcome, { kind: 'yield' }> }) {
  const { record, crop } = outcome
  const actual = record.yield.value ?? 0
  const usual = record.expected.value ?? 0
  const { fill, usual: usualAt } = barShares(actual, usual)
  const change = record.change_vs_trend.value
  return (
    <li className="crop-row">
      <p className="crop-row__head">
        <strong>{crop}</strong> {plainChange(change)}
      </p>
      <div
        className={`crop-row__bar crop-row__bar--${toneOf(change)}`}
        role="img"
        aria-label={`${crop}: ${Math.round(actual)} against ${Math.round(usual)} usually`}
      >
        <span className="crop-row__fill" style={{ width: `${fill * 100}%` }} />
        <span className="crop-row__usual" style={{ left: `${usualAt * 100}%` }} />
      </div>
      <p className="crop-row__figures">
        {Math.round(actual)} {plainUnit(record.yield.unit)}, against about {Math.round(usual)} usually
      </p>
    </li>
  )
}

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
            <CropRow key={outcome.crop} outcome={outcome} />
          ) : (
            <li key={outcome.crop} className="outcome__none">
              <strong>{outcome.crop}</strong>{' '}
              {outcome.reason === 'not-published' ? `no county yield published for ${year} yet` : 'no county yield data in this tool'}
            </li>
          ),
        )}
      </ul>
      {outcomes.some((outcome) => outcome.kind === 'yield') && (
        <p className="outcome__range">The white mark on each bar is the usual yield.</p>
      )}
      {ranges.map((range) => (
        <p key={range.crop} className="outcome__range">
          In the {range.count} dry summers since 2001, {range.crop} went from {percentFromUsual(range.lowest)} to{' '}
          {percentFromUsual(range.highest)}.
        </p>
      ))}
      <details className="outcome__how">
        <summary>How we worked this out</summary>
        <p>
          Yields are county averages from USDA NASS surveys, not measurements of these fields or of this rotation. The usual yield is a
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
