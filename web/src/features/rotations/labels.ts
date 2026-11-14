// Pure wording for the counts on a rotation card.
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

type Labelled = { isCurrent: boolean; sequence: readonly string[] }

/** A short name for a segment: "Current", or the length of the cycle ("3-year"). */
export function shortLabel(summary: Labelled): string {
  return summary.isCurrent ? 'Current' : `${summary.sequence.length}-year`
}
