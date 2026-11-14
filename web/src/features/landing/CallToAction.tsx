import { useI18n } from '../../shared/i18n/index.ts'
import { Button } from '../../shared/components/index.ts'
import './landing.css'

export function CallToAction() {
  const { t } = useI18n()
  return (
    <section className="cta">
      <h2>{t('end.title')}</h2>
      <a href="#/tool">
        <Button>{t('cta.open')}</Button>
      </a>
      <a className="cta__link" href="https://github.com/Juanpacol/TEA-8">
        {t('end.github')}
      </a>
      <div className="cta__team">
        <p className="cta__team-label">{t('end.builtBy')}</p>
        <p className="cta__team-name">Juan Pablo Botero</p>
      </div>
    </section>
  )
}
