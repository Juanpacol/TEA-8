import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

export function CallToAction() {
  const { t } = useI18n()
  return (
    <section className="cta">
      <h2>{t('end.title')}</h2>
      <a className="link-button" href="#/tool">
        {t('cta.open')}
      </a>
      <div className="cta__links">
        <a className="link-button link-button--ghost" href="https://github.com/Juanpacol/TEA-8">
          {t('end.github')}
        </a>
        <a className="link-button link-button--ghost" href="#/ai">
          {t('cta.ai')}
        </a>
      </div>
      <div className="cta__team">
        <p className="cta__team-label">{t('end.builtBy')}</p>
        <p className="cta__team-name">Juan Pablo Botero</p>
      </div>
    </section>
  )
}
