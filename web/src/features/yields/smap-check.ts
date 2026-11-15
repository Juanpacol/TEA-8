// Does a satellite-driven source agree with the soil moisture we use? Pure: no React, no fetch.
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { correlation } from './relation.ts'

export type SmapPair = { year: number; smap: number; power: number }

/** Every summer that has both the SMAP figure and the NASA POWER root-zone wetness, oldest first. */
export function smapPairs(data: TEA8DataFile): SmapPair[] {
  const pairs: SmapPair[] = []
  for (const season of data.seasons ?? []) {
    const smap = season.smap_root_zone?.value
    const power = season.root_wetness.value
    if (smap === null || smap === undefined || power === null) continue
    pairs.push({ year: season.year, smap, power })
  }
  return pairs.sort((a, b) => a.year - b.year)
}

export type SmapAgreement = {
  /** Correlation between the two series, or null with fewer than 3 summers. */
  r: number | null
  /** The summer each source ranks driest. */
  driestSmap: number
  driestPower: number
}

export function smapAgreement(pairs: readonly SmapPair[]): SmapAgreement | null {
  if (pairs.length < 3) return null
  const lowest = (pick: (pair: SmapPair) => number) => pairs.reduce((best, pair) => (pick(pair) < pick(best) ? pair : best)).year
  return {
    r: correlation(pairs.map((p) => p.smap), pairs.map((p) => p.power)),
    driestSmap: lowest((p) => p.smap),
    driestPower: lowest((p) => p.power),
  }
}
