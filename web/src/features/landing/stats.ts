// Pure helpers: the figures on the landing page come from the data file, never from the text.
import { DEFAULT_BASELINE, baselineRange } from '../../shared/lib/baseline.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { agreement, checksFor } from '../yields/drought-check.ts'
import { biggestSwing, pairsFor, pearson } from '../yields/relation.ts'
import { smapAgreement, smapPairs } from '../yields/smap-check.ts'

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

export type McleanStory = { year: number; cornChange: number | null; droughtShare: number | null }

/** What happened in the driest summer of the baseline: how corn did against its trend and how much of the county the US Drought Monitor had in drought. */
export function mcleanStory(data: TEA8DataFile): McleanStory | null {
  const driest = driestSummer(data.seasons, data.dry_summer_rule?.baseline)
  if (!driest) return null
  const corn = (data.yields ?? []).find((record) => record.crop === 'corn' && record.year === driest.year)
  const season = data.seasons.find((s) => s.year === driest.year)
  return {
    year: driest.year,
    cornChange: corn?.change_vs_trend.value ?? null,
    droughtShare: season?.drought_monitor?.value ?? null,
  }
}

export type Proof = {
  /** Our dry summers, and how many of them the US Drought Monitor also puts in drought. */
  drought: { dry: number; confirmed: number } | null
  /** How well NASA SMAP and the soil moisture we use move together. */
  smap: { r: number; years: number } | null
  /** How weakly soil moisture and corn yield move together, and the summer that drives it. */
  link: { r: number; years: number; year: number } | null
}

/** The figures the landing page quotes as proof, all computed from the data file. Each is null when its data is missing. */
export function proofFigures(data: TEA8DataFile): Proof {
  const checks = checksFor(data)
  const dry = checks.filter((check) => check.dry)
  const { confirmed } = agreement(checks)
  const pairs = smapPairs(data)
  const smap = smapAgreement(pairs)
  const [first, last] = baselineRange(data.dry_summer_rule?.baseline ?? DEFAULT_BASELINE) ?? [0, 9999]
  const corn = pairsFor(data, 'corn', first, last)
  const r = pearson(corn)
  const swing = biggestSwing(corn)
  return {
    drought: dry.length > 0 ? { dry: dry.length, confirmed: confirmed.length } : null,
    smap: smap && smap.r !== null ? { r: smap.r, years: pairs.length } : null,
    link: r !== null && swing !== null ? { r, years: corn.length, year: swing.year } : null,
  }
}

export type YearBar = { year: number; change: number; dry: boolean }

/** Corn yield against its usual for the year, one bar per year the data has, with the dry summers flagged. */
export function cornYearBars(data: TEA8DataFile): YearBar[] {
  const dry = new Set(data.seasons.filter((s) => s.dry === true).map((s) => s.year))
  return (data.yields ?? [])
    .flatMap((y) => (y.crop === 'corn' && y.change_vs_trend.value !== null ? [{ year: y.year, change: y.change_vs_trend.value, dry: dry.has(y.year) }] : []))
    .sort((a, b) => a.year - b.year)
}
