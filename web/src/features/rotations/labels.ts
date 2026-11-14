// Pure wording for the counts on a rotation card.
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

type Labelled = { isCurrent: boolean; sequence: readonly string[] }

/** A rotation named by its crops, in order: "Corn + soybeans". */
export function rotationName(summary: Labelled): string {
  return capitalize(summary.sequence.join(' + '))
}

/** The text with only its first letter in capitals: "small grain" becomes "Small grain". */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
