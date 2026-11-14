import { useI18n } from '../../shared/i18n/index.ts'
import { Button } from '../../shared/components/index.ts'
import './landing.css'

/** A silent looping clip of the tool in a window frame, with the way into the real tool. */
export function Demo() {
  const { t } = useI18n()
  return (
    <section className="demo">
      <h2>{t('demo.title')}</h2>
      <div className="demo__frame">
        <div className="demo__bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <video
          className="demo__video"
          src={`${import.meta.env.BASE_URL}demo/tea8-demo.mp4`}
          poster={`${import.meta.env.BASE_URL}demo/tea8-demo-poster.webp`}
          aria-label={t('demo.aria')}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      </div>
      <p className="demo__note">{t('demo.note')}</p>
      <a href="#/tool">
        <Button>{t('cta.open')}</Button>
      </a>
    </section>
  )
}
