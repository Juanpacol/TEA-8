import { describe, expect, it } from 'vitest'
import { driestSummer } from './stats.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'

const figure = (value: number | null) => ({
  value,
  unit: 'fraction',
  source: 'NASA POWER',
  parameter: 'GWETROOT',
  queried_on: '2026-11-14',
})
const season = (year: number, value: number | null): TEA8DataFile['seasons'][number] => ({
  year,
  root_wetness: figure(value),
  root_wetness_deviation: figure(0),
  rainfall: figure(0),
  temperature: figure(0),
})

describe('driestSummer', () => {
  it('finds the driest year and the mean of 2001-2023', () => {
    const result = driestSummer([season(2011, 0.6), season(2012, 0.5), season(2013, 0.7)])
    expect(result?.year).toBe(2012)
    expect(result?.wetness).toBe(0.5)
    expect(result?.baselineMean).toBeCloseTo(0.6, 5)
  })

  it('ignores unknown values and years outside the period', () => {
    const result = driestSummer([season(2012, 0.5), season(2013, null), season(2025, 0.1)])
    expect(result).toMatchObject({ year: 2012, wetness: 0.5, baselineMean: 0.5 })
  })

  it('returns null when nothing is known', () => {
    expect(driestSummer([season(2012, null)])).toBeNull()
  })
})

describe('driestSummer with the data file baseline', () => {
  it('uses the range the file declares', () => {
    const seasons = [season(2005, 0.4), season(2012, 0.5), season(2013, 0.7)]
    expect(driestSummer(seasons, '2010-2013')?.year).toBe(2012)
    expect(driestSummer(seasons)?.year).toBe(2005)
  })
})
