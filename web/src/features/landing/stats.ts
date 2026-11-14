// Pure helpers: the figures on the landing page come from the data file, never from the text.
import { DEFAULT_BASELINE, baselineRange } from '../../shared/lib/baseline.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'

type Season = TEA8DataFile['seasons'][number]

export type DriestSummer = { year: number; wetness: number; baselineMean: number }

/** The driest summer of the baseline (the data file's own, else 2001-2023) by root-zone wetness, and the mean of that period. */
export function driestSummer(seasons: readonly Season[], baseline?: string): DriestSummer | null {
  const [first, last] = baselineRange(baseline) ?? (baselineRange(DEFAULT_BASELINE) as [number, number])
  const known = seasons
    .filter((s) => s.year >= first && s.year <= last)
    .flatMap((s) => (s.root_wetness.value === null ? [] : [{ year: s.year, wetness: s.root_wetness.value }]))
  if (known.length === 0) return null
  const driest = known.reduce((a, b) => (b.wetness < a.wetness ? b : a))
  const baselineMean = known.reduce((sum, s) => sum + s.wetness, 0) / known.length
  return { ...driest, baselineMean }
}
