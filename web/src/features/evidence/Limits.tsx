import { useI18n } from '../../shared/i18n/index.ts'
import './evidence.css'

type Props = { limits: string[] }

/** What the data cannot tell the farmer. */
export function Limits({ limits }: Props) {
  return (
    <ul className="limits">
      {limits.map((limit) => (
        <li key={limit}>{limit}</li>
      ))}
    </ul>
  )
}

/** Shown outside the tabs whenever the data file is simulated, so it can never be missed. */
export function SimulatedNotice() {
  const { t } = useI18n()
  return <p className="limits__simulated">{t('sim.notice')}</p>
}
