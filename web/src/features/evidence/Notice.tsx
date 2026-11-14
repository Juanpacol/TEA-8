import { useI18n } from '../../shared/i18n/index.ts'
import './evidence.css'

/** Fixed notice shown on every screen of the tool: one line. */
export function Notice() {
  const { t } = useI18n()
  const english = t('data.englishNote')
  return (
    <aside className="notice" role="note">
      <strong>{t('notice.strong')}</strong> {t('notice.rest')}
      {english && <span className="notice__language"> {english}</span>}
    </aside>
  )
}
