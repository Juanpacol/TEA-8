import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

export function Problem() {
  const { t } = useI18n()
  return (
    <section className="section">
      <h2>{t('problem.title')}</h2>
      <p className="section__big">{t('problem.big')}</p>
      <p>{t('problem.text')}</p>
      <p className="section__note">{t('problem.note')}</p>
    </section>
  )
}
