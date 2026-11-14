import type { Origin } from '../../shared/lib/data-types.ts'
import { originInfo } from './origin.ts'
import './evidence.css'

export function OriginLabel({ origin }: { origin: Origin }) {
  const { label, className } = originInfo(origin)
  return <span className={`origin ${className}`}>{label}</span>
}
