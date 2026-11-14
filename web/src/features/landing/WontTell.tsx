import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

const LIMITS = ['wont.1', 'wont.2', 'wont.3', 'wont.4', 'wont.5'] as const

export function WontTell() {
  const { t } = useI18n()
  return (
    <section className="safety">
      <h2>{t('wont.title')}</h2>
      <p className="safety__tagline">{t('wont.tagline')}</p>
      <div className="safety__card">
        <ul className="checklist">
          {LIMITS.map((limit) => (
            <li key={limit}>{t(limit)}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
