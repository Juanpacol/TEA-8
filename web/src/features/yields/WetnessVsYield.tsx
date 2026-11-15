import { useI18n } from '../../shared/i18n/index.ts'
import { DEFAULT_BASELINE, baselineRange } from '../../shared/lib/baseline.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { biggestSwing, pairsFor, pearson, strengthOf } from './relation.ts'
import { percentFromUsual } from './yields.ts'

const WIDTH = 320
const HEIGHT = 190
const LEFT = 38
const RIGHT = 8
const TOP = 10
const BOTTOM = 34
const X_MAX = 2.5

/** Soil moisture against county corn yield, one point per summer, with what the correlation does and does not say. */
export function WetnessVsYield({ data, year }: { data: TEA8DataFile; year: number }) {
  const { t } = useI18n()
  const [first, last] = baselineRange(data.dry_summer_rule?.baseline ?? DEFAULT_BASELINE) ?? [0, 9999]
  const pairs = pairsFor(data, 'corn', first, last)
  const r = pearson(pairs)
  const swing = biggestSwing(pairs)
  if (r === null || swing === null) return null
  const without = pearson(pairs.filter((pair) => pair.year !== swing.year))

  const changes = pairs.map((pair) => pair.change)
  const yMin = Math.min(-10, Math.floor(Math.min(...changes) / 10) * 10)
  const yMax = Math.max(10, Math.ceil(Math.max(...changes) / 10) * 10)
  const x = (deviation: number) => LEFT + ((Math.min(Math.max(deviation, -X_MAX), X_MAX) + X_MAX) / (2 * X_MAX)) * (WIDTH - LEFT - RIGHT)
  const y = (change: number) => TOP + ((yMax - change) / (yMax - yMin)) * (HEIGHT - TOP - BOTTOM)
  const rounded = (value: number) => value.toFixed(2)

  return (
    <details className="relation">
      <summary>{t('relation.title')}</summary>
      <svg
        className="relation__chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t('relation.aria', { n: pairs.length, r: rounded(r) })}
      >
        <line className="relation__zero" x1={LEFT} x2={WIDTH - RIGHT} y1={y(0)} y2={y(0)} />
        <line className="relation__zero" x1={x(0)} x2={x(0)} y1={TOP} y2={HEIGHT - BOTTOM} />
        <text className="relation__tick" x={LEFT - 4} y={y(0) + 3} textAnchor="end">0</text>
        <text className="relation__tick" x={LEFT - 4} y={y(yMax) + 3} textAnchor="end">{`+${yMax}`}</text>
        <text className="relation__tick" x={LEFT - 4} y={y(yMin) + 3} textAnchor="end">{yMin}</text>
        <text className="relation__axis" x={(LEFT + WIDTH - RIGHT) / 2} y={HEIGHT - 6} textAnchor="middle">{t('relation.xAxis')}</text>
        <text className="relation__axis" transform={`translate(10 ${(TOP + HEIGHT - BOTTOM) / 2}) rotate(-90)`} textAnchor="middle">{t('relation.yAxis')}</text>
        {pairs.map((pair) => (
          <g key={pair.year}>
            {pair.year === year && <circle className="relation__chosen" cx={x(pair.deviation)} cy={y(pair.change)} r={8} />}
            <circle className={pair.dry ? 'relation__dot relation__dot--dry' : 'relation__dot'} cx={x(pair.deviation)} cy={y(pair.change)} r={4}>
              <title>{t('relation.point', { year: pair.year, deviation: pair.deviation, change: pair.change })}</title>
            </circle>
          </g>
        ))}
        <text className="relation__label" x={x(swing.deviation) + 8} y={y(swing.change) + 3}>{swing.year}</text>
      </svg>
      <p className="relation__key">
        <i className="relation__swatch relation__swatch--dry" aria-hidden="true" /> {t('relation.dryKey')}{' '}
        <i className="relation__swatch" aria-hidden="true" /> {t('relation.otherKey')}
      </p>
      <p>
        {t('relation.summary', {
          n: pairs.length,
          strength: t(`relation.${strengthOf(r)}`),
          r: rounded(r),
          year: swing.year,
          change: percentFromUsual(t, swing.change),
        })}{' '}
        {without !== null && t('relation.without', { year: swing.year, r2: rounded(without) })}
      </p>
      <p className="relation__caution">{t('relation.caution')}</p>
    </details>
  )
}
