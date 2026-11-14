import { useI18n } from '../../shared/i18n/index.ts'
import { Button } from '../../shared/components/index.ts'
import { useReveal } from '../../shared/hooks/useReveal.ts'
import type { DriestSummer } from './stats.ts'
import './landing.css'

export function Intro({ driest }: { driest: DriestSummer | null }) {
  const { t } = useI18n()
  const { ref, visible } = useReveal<HTMLElement>()

  return (
    <section id="intro" ref={ref} className={`intro reveal${visible ? ' reveal--visible' : ''}`}>
      <div className="intro__art" aria-hidden="true" />
      <div className="intro__inner">
        <h2>{t('intro.title')}</h2>
        {driest && (
          <p className="intro__figure">
            {t('intro.figure', { year: driest.year, wetness: driest.wetness.toFixed(2), mean: driest.baselineMean.toFixed(2) })}
          </p>
        )}
        <a href="#/tool">
          <Button>{t('cta.open')}</Button>
        </a>
      </div>
    </section>
  )
}
