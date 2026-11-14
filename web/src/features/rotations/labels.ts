// Pure wording for the counts on a rotation card.
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

type Labelled = { isCurrent: boolean; sequence: readonly string[] }

/** A rotation named by its crops, in order: "Corn + soybeans". */
export function rotationName(summary: Labelled): string {
  const crops = summary.sequence.join(' + ')
  return crops.charAt(0).toUpperCase() + crops.slice(1)
}
