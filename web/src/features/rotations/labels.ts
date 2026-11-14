import { capitalize, cropName, type Translate } from '../../shared/i18n/index.ts'

// Pure wording for the counts on a rotation card.
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

type Labelled = { sequence: readonly string[] }

/** A rotation named by its crops, in order: "Corn + soybeans". */
export function rotationName(t: Translate, summary: Labelled): string {
  return capitalize(summary.sequence.map((crop) => cropName(t, crop)).join(' + '))
}
