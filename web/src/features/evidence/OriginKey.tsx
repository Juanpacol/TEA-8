import { useI18n } from '../../shared/i18n/index.ts'
import { ORIGIN_ORDER, OriginLabel, originInfo } from '../../shared/components/index.ts'
import './evidence.css'

/** What each origin label means, so a reader can weigh a sentence by where it comes from. */
export function OriginKey() {
  const { t } = useI18n()
  return (
    <details className="origin-key">
      <summary>{t('origin.key')}</summary>
      <dl>
        {ORIGIN_ORDER.map((origin) => (
          <div key={origin} className="origin-key__row">
            <dt>
              <OriginLabel origin={origin} />
            </dt>
            <dd>{originInfo(t, origin).description}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
