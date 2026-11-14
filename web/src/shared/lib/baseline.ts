/** The years of a baseline written as "2001-2023", or null when the text has no such range. */
export function baselineRange(baseline: string | undefined): [number, number] | null {
  const match = baseline?.match(/^(\d{4})-(\d{4})$/)
  return match ? [Number(match[1]), Number(match[2])] : null
}

/** What the data file calls its baseline when it does not say. McLean County's file says so itself. */
export const DEFAULT_BASELINE = '2001-2023'
