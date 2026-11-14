import type { Origin } from '../lib/data-types.ts'

type OriginInfo = { label: string; className: string; description: string }

const ORIGINS: Record<Origin, OriginInfo> = {
  nasa_data: { label: 'NASA data', className: 'origin--nasa', description: 'A figure read from NASA data.' },
  platform_calculation: { label: 'Platform calculation', className: 'origin--platform', description: 'Computed or stated by TEA-8 from the data. Not from an outside source.' },
  model_text: { label: 'AI model text', className: 'origin--model', description: 'Written by an AI model. Check it against the data.' },
  citation: { label: 'Cited source (read)', className: 'origin--citation', description: 'From a published source that was opened and read.' },
  citation_to_verify: { label: 'Citation still to verify', className: 'origin--unverified', description: 'From a source that could not be opened. Treat it as unconfirmed.' },
}

/** All origins, in the order the key lists them. */
export const ORIGIN_ORDER: Origin[] = ['nasa_data', 'platform_calculation', 'citation', 'citation_to_verify', 'model_text']

export function originInfo(origin: Origin): OriginInfo {
  return ORIGINS[origin]
}
