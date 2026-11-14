import { useI18n } from '../i18n/index.ts'
import type { Origin } from '../lib/data-types.ts'
import { originInfo } from './origin.ts'
import './origin.css'

export function OriginLabel({ origin }: { origin: Origin }) {
  const { t } = useI18n()
  const { label, className } = originInfo(t, origin)
  return <span className={`origin ${className}`}>{label}</span>
}
