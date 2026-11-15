import { useI18n } from '../../shared/i18n/index.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { strengthOf } from './relation.ts'
import { smapAgreement, smapPairs } from './smap-check.ts'

/** Compares the soil moisture we use (NASA POWER) with NASA SMAP, a satellite-driven source. Shows nothing without its data. */
export function SatelliteCheck({ data }: { data: TEA8DataFile }) {
  const { t } = useI18n()
  const pairs = smapPairs(data)
  const result = smapAgreement(pairs)
  if (result === null || result.r === null) return null
  const same = result.driestSmap === result.driestPower

  return (
    <details className="relation">
      <summary>{t('smap.title')}</summary>
      <p>
        {t('smap.summary', {
          first: pairs[0].year,
          last: pairs[pairs.length - 1].year,
          n: pairs.length,
          strength: t(`relation.${strengthOf(result.r)}`),
          r: result.r.toFixed(2),
        })}{' '}
        {same ? t('smap.sameDriest', { year: result.driestSmap }) : t('smap.otherDriest', { smap: result.driestSmap, power: result.driestPower })}
      </p>
      <p className="relation__caution">{t('smap.caution')}</p>
    </details>
  )
}
