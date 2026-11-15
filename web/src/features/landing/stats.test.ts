import { describe, expect, it } from 'vitest'
import { cornYearBars, driestSummer, mcleanStory, proofFigures } from './stats.ts'
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

describe('mcleanStory', () => {
  const withExtras = {
    seasons: [
      { ...season(2011, 0.6), drought_monitor: figure(18.6) },
      { ...season(2012, 0.5), drought_monitor: figure(95.2) },
    ],
    yields: [
      { year: 2012, crop: 'corn', yield: figure(110), expected: figure(195), change_vs_trend: figure(-43.8) },
      { year: 2012, crop: 'soybeans', yield: figure(52), expected: figure(59), change_vs_trend: figure(-10.7) },
    ],
  } as unknown as TEA8DataFile

  it('tells how corn and the county did in the driest summer', () => {
    expect(mcleanStory(withExtras)).toEqual({ year: 2012, cornChange: -43.8, droughtShare: 95.2 })
  })

  it('leaves out what the data does not have, instead of inventing it', () => {
    const bare = { seasons: [season(2012, 0.5)], yields: [] } as unknown as TEA8DataFile
    expect(mcleanStory(bare)).toEqual({ year: 2012, cornChange: null, droughtShare: null })
  })
})

describe('proofFigures', () => {
  it('is empty, not made up, when the data has none of the cross-checks', () => {
    const bare = { seasons: [season(2012, 0.5)], yields: [] } as unknown as TEA8DataFile
    expect(proofFigures(bare)).toEqual({ drought: null, smap: null, link: null })
  })
})

describe('cornYearBars', () => {
  it('lists corn years in order and flags the dry summers', () => {
    const data = {
      seasons: [{ ...season(2012, 0.5), dry: true }, { ...season(2013, 0.7), dry: false }],
      yields: [
        { year: 2013, crop: 'corn', change_vs_trend: figure(-4.7) },
        { year: 2012, crop: 'corn', change_vs_trend: figure(-43.8) },
        { year: 2012, crop: 'soybeans', change_vs_trend: figure(-10.7) },
        { year: 2014, crop: 'corn', change_vs_trend: figure(null) },
      ],
    } as unknown as TEA8DataFile
    expect(cornYearBars(data)).toEqual([
      { year: 2012, change: -43.8, dry: true },
      { year: 2013, change: -4.7, dry: false },
    ])
  })
})
