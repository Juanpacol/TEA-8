import { describe, expect, it } from 'vitest'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { agreement, checksFor } from './drought-check.ts'

const figure = (value: number | null) => ({ value, unit: 'u', source: 's', parameter: 'p', queried_on: '2026-11-14' })
const season = (year: number, dry: boolean | null, share: number | null, deviation = -1) => ({
  year,
  root_wetness: figure(0.5),
  root_wetness_deviation: figure(deviation),
  rainfall: figure(1),
  temperature: figure(20),
  dry,
  ...(share === null ? {} : { drought_monitor: figure(share) }),
})
const data = (seasons: ReturnType<typeof season>[]) => ({ seasons }) as unknown as TEA8DataFile

describe('checksFor', () => {
  it('keeps only summers with a dry flag and a Drought Monitor figure, oldest first', () => {
    const checks = checksFor(data([season(2012, true, 95), season(2010, false, 0), season(2009, false, null), season(2008, null, 10)]))
    expect(checks.map((check) => check.year)).toEqual([2010, 2012])
  })
})

describe('agreement', () => {
  it('splits confirmed, not confirmed and missed summers', () => {
    const result = agreement(
      checksFor(data([season(2005, true, 94), season(2006, true, 0), season(2011, false, 60), season(2013, false, 0), season(2014, true, 50)])),
    )
    expect(result.confirmed.map((check) => check.year)).toEqual([2005])
    expect(result.notConfirmed.map((check) => check.year)).toEqual([2006, 2014]) // exactly half is not more than half
    expect(result.missed.map((check) => check.year)).toEqual([2011])
  })
})
