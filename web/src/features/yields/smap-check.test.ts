import { describe, expect, it } from 'vitest'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { smapAgreement, smapPairs } from './smap-check.ts'

const figure = (value: number | null) => ({ value, unit: 'u', source: 's', parameter: 'p', queried_on: '2026-11-14' })
const season = (year: number, power: number | null, smap: number | null) =>
  ({ year, root_wetness: figure(power), ...(smap === null ? {} : { smap_root_zone: figure(smap) }) })
const data = (seasons: ReturnType<typeof season>[]) => ({ seasons }) as unknown as TEA8DataFile

describe('smapPairs', () => {
  it('keeps only summers with both figures, oldest first', () => {
    const pairs = smapPairs(data([season(2023, 0.56, 0.28), season(2012, 0.51, null), season(2016, null, 0.34), season(2015, 0.74, 0.37)]))
    expect(pairs.map((pair) => pair.year)).toEqual([2015, 2023])
  })
})

describe('smapAgreement', () => {
  it('finds a perfect correlation and the driest summer of each source', () => {
    const result = smapAgreement(smapPairs(data([season(2015, 0.7, 0.37), season(2016, 0.65, 0.33), season(2023, 0.56, 0.28), season(2024, 0.62, 0.31)])))
    expect(result?.r).toBeCloseTo(0.99, 1)
    expect(result?.driestSmap).toBe(2023)
    expect(result?.driestPower).toBe(2023)
  })

  it('is null with fewer than three summers', () => {
    expect(smapAgreement(smapPairs(data([season(2015, 0.7, 0.37), season(2016, 0.65, 0.33)])))).toBeNull()
  })

  it('reports different driest summers when the sources disagree', () => {
    const result = smapAgreement(smapPairs(data([season(2015, 0.5, 0.4), season(2016, 0.6, 0.3), season(2017, 0.7, 0.35)])))
    expect(result?.driestPower).toBe(2015)
    expect(result?.driestSmap).toBe(2016)
  })
})
