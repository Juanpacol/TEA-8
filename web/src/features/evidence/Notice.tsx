import { useI18n } from '../../shared/i18n/index.ts'
import './evidence.css'

/** Fixed notice shown on every screen of the tool: one line. */
export function Notice() {
  const { t } = useI18n()
  const english = t('data.englishNote')
  return (
    <aside className="notice" role="note">
      <span className="notice__icon" aria-hidden="true">
        i
      </span>
      <div className="notice__body">
        <p className="notice__main">
          <strong>{t('notice.strong')}</strong> {t('notice.rest')}
        </p>
        {english && <p className="notice__language">{english}</p>}
      </div>
    </aside>
  )
}
