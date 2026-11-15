import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

const REPO = 'https://github.com/Juanpacol/TEA-8'

export function OpenSource() {
  const { t } = useI18n()
  const [before, after] = t('open.note', { link: '\u0000' }).split('\u0000')
  return (
    <section className="open-source">
      <h2>{t('open.title')}</h2>
      <p>{t('open.text')}</p>
      <a className="outline-link" href={REPO}>
        {t('open.repo')}
      </a>
      <p className="open-source__note">
        {before}
        <a href={`${REPO}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING.md</a>
        {after} <a href="#/ai">{t('open.ai')}</a>.
      </p>
    </section>
  )
}
