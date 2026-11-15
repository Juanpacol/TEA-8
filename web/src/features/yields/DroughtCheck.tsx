import { useI18n } from '../../shared/i18n/index.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { DROUGHT_SHARE, agreement, checksFor } from './drought-check.ts'

/** Cross-checks our dry summers against the US Drought Monitor, an independent source. Shows nothing without its data. */
export function DroughtCheck({ data, year }: { data: TEA8DataFile; year: number }) {
  const { lang, t } = useI18n()
  const checks = checksFor(data)
  const dry = checks.filter((check) => check.dry)
  if (dry.length === 0) return null
  const { confirmed, notConfirmed, missed } = agreement(checks)
  const list = new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' })
  const years = (items: typeof checks) => list.format(items.map((check) => String(check.year)))
  const thisYear = checks.find((check) => check.year === year)
  const rows = checks.filter((check) => check.dry || check.share > DROUGHT_SHARE)

  return (
    <details className="relation">
      <summary>{t('drought.title')}</summary>
      {thisYear && <p>{t('drought.year', { year, share: Math.round(thisYear.share) })}</p>}
      <p>
        {t('drought.summary', { dry: dry.length, confirmed: confirmed.length, years: years(confirmed) })}{' '}
        {notConfirmed.length > 0 && `${t('drought.notConfirmed', { years: years(notConfirmed) })} `}
        {missed.length > 0 ? t('drought.missed', { years: years(missed) }) : t('drought.noneMissed')}
      </p>
      <ul className="relation__rows">
        {rows.map((check) => (
          <li key={check.year}>
            {t('drought.row', {
              year: check.year,
              share: Math.round(check.share),
              deviation: check.deviation ?? '?',
              flag: t(check.dry ? 'drought.flagged' : 'drought.notFlagged'),
            })}
          </li>
        ))}
      </ul>
      <p className="relation__caution">{t('drought.caution')}</p>
    </details>
  )
}
