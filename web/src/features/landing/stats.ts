// Pure helpers: the figures on the landing page come from the data file, never from the text.
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'

type Season = TEA8DataFile['seasons'][number]

const BASELINE_FIRST = 2001
const BASELINE_LAST = 2023

export type DriestSummer = { year: number; wetness: number; baselineMean: number }

/** The driest summer of 2001-2023 by root-zone wetness, and the mean of that period. */
export function driestSummer(seasons: readonly Season[]): DriestSummer | null {
  const known = seasons
    .filter((s) => s.year >= BASELINE_FIRST && s.year <= BASELINE_LAST)
    .flatMap((s) => (s.root_wetness.value === null ? [] : [{ year: s.year, wetness: s.root_wetness.value }]))
  if (known.length === 0) return null
  const driest = known.reduce((a, b) => (b.wetness < a.wetness ? b : a))
  const baselineMean = known.reduce((sum, s) => sum + s.wetness, 0) / known.length
  return { ...driest, baselineMean }
}
