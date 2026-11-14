import type { Translate } from '../i18n/index.ts'
import type { Origin } from '../lib/data-types.ts'

type OriginInfo = { label: string; className: string; description: string }

const CLASSES: Record<Origin, string> = {
  nasa_data: 'origin--nasa',
  platform_calculation: 'origin--platform',
  model_text: 'origin--model',
  citation: 'origin--citation',
  citation_to_verify: 'origin--unverified',
}

/** All origins, in the order the key lists them. */
export const ORIGIN_ORDER: Origin[] = ['nasa_data', 'platform_calculation', 'citation', 'citation_to_verify', 'model_text']

export function originInfo(t: Translate, origin: Origin): OriginInfo {
  return { label: t(`origin.${origin}.label`), className: CLASSES[origin], description: t(`origin.${origin}.desc`) }
}
