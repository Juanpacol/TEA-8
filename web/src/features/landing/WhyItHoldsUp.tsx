import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

const POINTS = [1, 2, 3, 4] as const

export function WhyItHoldsUp() {
  const { t } = useI18n()
  return (
    <section className="differentiators">
      <h2>{t('why.title')}</h2>
      <div className="differentiators__grid">
        {POINTS.map((n) => (
          <div key={n} className="differentiators__card">
            <h3>{t(`why.${n}.title`)}</h3>
            <p>{t(`why.${n}.text`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
