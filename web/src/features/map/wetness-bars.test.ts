import { describe, expect, it } from 'vitest'
import { SCALE_SDS, barShare, yearBars } from './wetness-bars.ts'

describe('barShare', () => {
  it('grows with wetness', () => {
    expect(barShare(-2)).toBeLessThan(barShare(0))
    expect(barShare(0)).toBeLessThan(barShare(1.5))
  })

  it('stays between a small minimum and the full height', () => {
    expect(barShare(-99)).toBeGreaterThan(0)
    expect(barShare(99)).toBe(1)
    expect(barShare(SCALE_SDS)).toBe(1)
  })

  it('gives an unknown summer the minimum, never zero', () => {
    expect(barShare(null)).toBe(barShare(-SCALE_SDS))
  })
})

describe('yearBars', () => {
  const season = (year: number, value: number | null, dry?: boolean) => ({ year, dry, root_wetness_deviation: { value } })

  it('keeps the years of the slider, in order, and the dry flag', () => {
    const bars = yearBars([season(2013, 0.4), season(2012, -1.98, true), season(2030, 1), season(2000, 1)], 2001, 2025)
    expect(bars).toEqual([
      { year: 2012, deviation: -1.98, dry: true },
      { year: 2013, deviation: 0.4, dry: false },
    ])
  })
})
