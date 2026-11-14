import type { Origin } from '../lib/data-types.ts'

type OriginInfo = { label: string; className: string }

const ORIGINS: Record<Origin, OriginInfo> = {
  nasa_data: { label: 'NASA data', className: 'origin--nasa' },
  platform_calculation: { label: 'Platform calculation', className: 'origin--platform' },
  model_text: { label: 'AI model text', className: 'origin--model' },
  citation: { label: 'Cited source (read)', className: 'origin--citation' },
  citation_to_verify: { label: 'Citation still to verify', className: 'origin--unverified' },
}

export function originInfo(origin: Origin): OriginInfo {
  return ORIGINS[origin]
}
