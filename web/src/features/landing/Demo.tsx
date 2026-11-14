import { useI18n } from '../../shared/i18n/index.ts'
import { Button } from '../../shared/components/index.ts'
import './landing.css'

/** The way into the real tool. The clip that used to sit here was never published, so it is gone rather than a broken player. */
export function Demo() {
  const { t } = useI18n()
  return (
    <section className="demo">
      <h2>{t('demo.title')}</h2>
      <p className="demo__note">{t('demo.note')}</p>
      <a href="#/tool">
        <Button>{t('cta.open')}</Button>
      </a>
    </section>
  )
}
