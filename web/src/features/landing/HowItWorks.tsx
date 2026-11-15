import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

const STEPS = ['how.1', 'how.2', 'how.3', 'how.4', 'how.5'] as const

export function HowItWorks() {
  const { t } = useI18n()
  return (
    <section className="section how">
      <div className="how__hole" aria-hidden="true" />
      <h2>{t('how.title')}</h2>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step}>{t(step)}</li>
        ))}
      </ol>
    </section>
  )
}
