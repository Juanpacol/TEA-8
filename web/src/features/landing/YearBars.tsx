import { useI18n } from '../../shared/i18n/index.ts'
import type { YearBar } from './stats.ts'
import './landing.css'

const WIDTH = 640
const HEIGHT = 300
const LEFT = 44
const TOP = 36
const BOTTOM = 28

/** Corn yield against its usual, year by year. Up beat the usual, down fell short; dry summers are ochre and labeled, the worst year carries its figure. */
export function YearBars({ bars }: { bars: YearBar[] }) {
  const { t } = useI18n()
  if (bars.length < 2) return null
  const low = Math.ceil(Math.max(...bars.map((b) => Math.abs(Math.min(b.change, 0))), 10) / 10) * 10
  const high = Math.max(...bars.map((b) => b.change), 5)
  const k = (HEIGHT - TOP - BOTTOM) / (low + high)
  const zero = TOP + high * k
  const y = (value: number) => zero - value * k
  const plot = WIDTH - LEFT
  const step = plot / bars.length
  const worst = bars.reduce((a, b) => (b.change < a.change ? b : a))
  const summary = t('intro.chart.alt', { first: bars[0].year, last: bars[bars.length - 1].year, year: worst.year, change: Math.abs(Math.round(worst.change)) })
  const ticks = [-low, -low / 2, 0]

  return (
    <figure className="yearbars">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={WIDTH} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'yearbars__zero' : 'yearbars__grid'} />
            <text x={LEFT - 8} y={y(tick) + 4} textAnchor="end" className="yearbars__label">
              {tick === 0 ? t('intro.chart.usual') : `${tick}%`}
            </text>
          </g>
        ))}
        {bars.map((bar, index) => {
          const height = Math.abs(bar.change) * k
          const x = LEFT + index * step + step * 0.14
          return (
            <g key={bar.year}>
              <rect
                x={x}
                width={step * 0.72}
                y={bar.change >= 0 ? zero - height : zero}
                height={Math.max(height, 1)}
                rx="2"
                className={bar.dry ? 'yearbars__bar yearbars__bar--dry' : 'yearbars__bar'}
              />
              {bar.dry && (
                <text x={x + step * 0.36} y={HEIGHT - 8} textAnchor="middle" className="yearbars__label yearbars__label--dry">
                  {String(bar.year).slice(2)}
                </text>
              )}
            </g>
          )
        })}
        <text x={LEFT + (bars.indexOf(worst) + 1) * step + 4} y={y(worst.change / 2) + 5} className="yearbars__callout">
          {`${worst.year}: ${Math.round(worst.change)}%`}
        </text>
        <text x={LEFT} y={HEIGHT - 8} className="yearbars__label">{bars[0].year}</text>
        <text x={WIDTH} y={HEIGHT - 8} textAnchor="end" className="yearbars__label">{bars[bars.length - 1].year}</text>
      </svg>
      <figcaption>{t('intro.chart.caption')}</figcaption>
    </figure>
  )
}
