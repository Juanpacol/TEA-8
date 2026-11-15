// Pure helpers for the bars under the year slider: one bar per summer, taller when the soil was wetter.

/** A summer this many standard deviations from the mean (either way) fills the scale. A display choice, not a threshold. */
export const SCALE_SDS = 2.5

/** Shortest bar, as a share of the full height, so even the driest summers stay visible and clickable. */
const MIN_SHARE = 0.12

export type YearBar = { year: number; deviation: number | null; dry: boolean }

/** Height of a bar from 0 to 1: the deviation from -SCALE_SDS (driest) to +SCALE_SDS (wettest). Unknown stays at the minimum. */
export function barShare(deviation: number | null): number {
  if (deviation === null) return MIN_SHARE
  const clamped = Math.min(Math.max(deviation, -SCALE_SDS), SCALE_SDS)
  return MIN_SHARE + ((clamped + SCALE_SDS) / (2 * SCALE_SDS)) * (1 - MIN_SHARE)
}

/** The bars for the years the slider covers, in order. */
export function yearBars(
  seasons: readonly { year: number; dry?: boolean | null; root_wetness_deviation: { value: number | null } }[],
  first: number,
  last: number,
): YearBar[] {
  return seasons
    .filter((season) => season.year >= first && season.year <= last)
    .map((season) => ({ year: season.year, deviation: season.root_wetness_deviation.value, dry: season.dry === true }))
    .sort((a, b) => a.year - b.year)
}
