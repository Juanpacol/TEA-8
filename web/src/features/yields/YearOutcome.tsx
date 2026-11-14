import { cropName, useI18n } from '../../shared/i18n/index.ts'
import type { Rotation, TEA8DataFile } from '../../shared/lib/data-types.ts'
import type { CropOutcome } from './yields.ts'
import { barShares, dryRange, outcomesFor, percentFromUsual, plainChange, plainUnit, summerVerdict, toneOf } from './yields.ts'
import './yields.css'

type Props = { data: TEA8DataFile; rotation: Rotation; year: number }

/** One crop: what it did against usual in words, a bar against the usual yield, and the figures. */
function CropRow({ outcome }: { outcome: Extract<CropOutcome, { kind: 'yield' }> }) {
  const { t } = useI18n()
  const { record } = outcome
  const crop = cropName(t, outcome.crop)
  const actual = record.yield.value ?? 0
  const usual = record.expected.value ?? 0
  const { fill, usual: usualAt } = barShares(actual, usual)
  const change = record.change_vs_trend.value
  return (
    <li className="crop-row">
      <p className="crop-row__head">
        <strong>{crop}</strong> {plainChange(t, change)}
      </p>
      <div
        className={`crop-row__bar crop-row__bar--${toneOf(change)}`}
        role="img"
        aria-label={t('outcome.barAria', { crop, actual: Math.round(actual), usual: Math.round(usual) })}
      >
        <span className="crop-row__fill" style={{ width: `${fill * 100}%` }} />
        <span className="crop-row__usual" style={{ left: `${usualAt * 100}%` }} />
      </div>
      <p className="crop-row__figures">
        {t('outcome.figures', { actual: Math.round(actual), unit: plainUnit(t, record.yield.unit), usual: Math.round(usual) })}
      </p>
    </li>
  )
}

/** What the county yields say about the chosen summer for the crops of the chosen rotation. */
export function YearOutcome({ data, rotation, year }: Props) {
  const { t } = useI18n()
  const season = data.seasons.find((s) => s.year === year)
  const outcomes = outcomesFor(data, rotation.sequence, year)
  const ranges = rotation.sequence
    .map((crop) => dryRange(data, crop))
    .filter((range): range is NonNullable<typeof range> => range !== null)
  const rule = data.dry_summer_rule

  return (
    <section className="outcome" aria-label={t('outcome.aria', { year })}>
      <h4 className="outcome__title">
        {t('outcome.title', { year, verdict: summerVerdict(t, season?.dry) })}
      </h4>
      <ul className="outcome__list">
        {outcomes.map((outcome) =>
          outcome.kind === 'yield' ? (
            <CropRow key={outcome.crop} outcome={outcome} />
          ) : (
            <li key={outcome.crop} className="outcome__none">
              <strong>{cropName(t, outcome.crop)}</strong>{' '}
              {outcome.reason === 'not-published' ? t('outcome.notPublished', { year }) : t('outcome.notCovered')}
            </li>
          ),
        )}
      </ul>
      {outcomes.some((outcome) => outcome.kind === 'yield') && (
        <p className="outcome__range">{t('outcome.legend')}</p>
      )}
      {ranges.map((range) => (
        <p key={range.crop} className="outcome__range">
          {t('outcome.range', { count: range.count, crop: cropName(t, range.crop), low: percentFromUsual(t, range.lowest), high: percentFromUsual(t, range.highest) })}
        </p>
      ))}
      <details className="outcome__how">
        <summary>{t('outcome.how')}</summary>
        <p>{t('outcome.how1')}</p>
        {rule && (
          <p>
            {t('outcome.rule', { rationale: rule.rationale, threshold: rule.threshold, unit: rule.unit })}
          </p>
        )}
      </details>
    </section>
  )
}
