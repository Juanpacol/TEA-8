import { useI18n } from './i18n.tsx'
import './language-switch.css'

/** A globe and the current language; one click switches to the other. */
export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n()
  return (
    <button type="button" className="lang-switch" aria-label={t('lang.switch')} onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <span>{t('lang.code')}</span>
    </button>
  )
}
