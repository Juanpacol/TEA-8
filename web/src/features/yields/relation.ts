// How soil moisture and county yield move together across summers. Pure: no React, no fetch.
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'

export type Pair = { year: number; deviation: number; change: number; dry: boolean }

/** One point per summer in the baseline with both a soil moisture deviation and a yield change against trend. */
export function pairsFor(data: TEA8DataFile, crop: string, first: number, last: number): Pair[] {
  const seasons = new Map((data.seasons ?? []).map((season) => [season.year, season]))
  const pairs: Pair[] = []
  for (const record of data.yields ?? []) {
    const season = seasons.get(record.year)
    const deviation = season?.root_wetness_deviation.value
    const change = record.change_vs_trend.value
    if (record.crop !== crop || record.year < first || record.year > last) continue
    if (deviation === null || deviation === undefined || change === null) continue
    pairs.push({ year: record.year, deviation, change, dry: season?.dry === true })
  }
  return pairs.sort((a, b) => a.year - b.year)
}

/** Pearson correlation, or null when it cannot be computed (fewer than 3 points, or no spread). */
export function pearson(pairs: readonly Pair[]): number | null {
  if (pairs.length < 3) return null
  const meanX = pairs.reduce((sum, p) => sum + p.deviation, 0) / pairs.length
  const meanY = pairs.reduce((sum, p) => sum + p.change, 0) / pairs.length
  let covariance = 0
  let spreadX = 0
  let spreadY = 0
  for (const p of pairs) {
    covariance += (p.deviation - meanX) * (p.change - meanY)
    spreadX += (p.deviation - meanX) ** 2
    spreadY += (p.change - meanY) ** 2
  }
  if (spreadX === 0 || spreadY === 0) return null
  return covariance / Math.sqrt(spreadX * spreadY)
}

/** The summer whose yield moved the most from its trend, in either direction: the one that can carry a whole correlation. */
export function biggestSwing(pairs: readonly Pair[]): Pair | null {
  return pairs.reduce<Pair | null>((best, p) => (best === null || Math.abs(p.change) > Math.abs(best.change) ? p : best), null)
}

export type Strength = 'weak' | 'moderate' | 'strong'

/** Plain words for the size of a correlation. The cut points are a common rule of thumb, not a standard. */
export function strengthOf(r: number): Strength {
  const size = Math.abs(r)
  return size < 0.3 ? 'weak' : size < 0.6 ? 'moderate' : 'strong'
}
