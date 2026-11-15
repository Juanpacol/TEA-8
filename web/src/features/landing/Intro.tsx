import { useI18n } from '../../shared/i18n/index.ts'
import { useReveal } from '../../shared/hooks/useReveal.ts'
import type { DriestSummer, YearBar } from './stats.ts'
import { YearBars } from './YearBars.tsx'
import './landing.css'

export function Intro({ driest, bars }: { driest: DriestSummer | null; bars: YearBar[] }) {
  const { t } = useI18n()
  const { ref, visible } = useReveal<HTMLElement>()

  return (
    <section id="intro" ref={ref} className={`intro reveal${visible ? ' reveal--visible' : ''}`}>
      <div className="intro__photo intro__photo--left" aria-hidden="true" />
      <div className="intro__photo intro__photo--right" aria-hidden="true" />
      <div className="intro__inner">
        <h2>{t('intro.title')}</h2>
        <p className="intro__sub">{t('intro.sub')}</p>
        {driest && (
          <p className="intro__figure">
            {t('intro.figure', { year: driest.year, wetness: driest.wetness.toFixed(2), mean: driest.baselineMean.toFixed(2) })}
          </p>
        )}
        <YearBars bars={bars} />
        <a className="link-button" href="#/tool">
          {t('cta.open')}
        </a>
      </div>
    </section>
  )
}
