import { describe, expect, it } from 'vitest'
import type { TEA8DataFile, YieldRecord } from '../../shared/lib/data-types.ts'
import { dryRange, outcomesFor, barShares, percentFromUsual, plainChange, plainUnit, summerVerdict, toneOf } from './yields.ts'
import { translator } from '../../shared/i18n/index.ts'
const t = translator('en')

const fig = (value: number | null) => ({ value, unit: 'x', source: 's', parameter: 'p', queried_on: '2026-11-14' })

function record(crop: 'corn' | 'soybeans', year: number, change: number): YieldRecord {
  return { year, crop, yield: fig(100), expected: fig(110), change_vs_trend: fig(change) }
}

const data = {
  seasons: [
    { year: 2011, dry: false }, { year: 2012, dry: true }, { year: 2013, dry: false }, { year: 2014, dry: true },
  ],
  yields: [record('corn', 2011, -17), record('corn', 2012, -44), record('corn', 2013, 15), record('corn', 2014, 4)],
} as unknown as TEA8DataFile

describe('yields helpers', () => {
  it('describes the change in words a farmer uses', () => {
    expect(plainChange(t, -43.8)).toBe('much less than usual')
    expect(plainChange(t, -8)).toBe('a little less than usual')
    expect(plainChange(t, 7)).toBe('a little more than usual')
    expect(plainChange(t, 20)).toBe('much more than usual')
    expect(plainChange(t, 3.4)).toBe('about the usual yield')
    expect(plainChange(t, -4.9)).toBe('about the usual yield')
    expect(plainChange(t, null)).toBe('no comparison available')
  })

  it('puts the thresholds on the boundary: 5 is a little, 15 is much', () => {
    expect(plainChange(t, 5)).toBe('a little more than usual')
    expect(plainChange(t, -15)).toBe('much less than usual')
  })

  it('writes the change as a figure and spells out the unit', () => {
    expect(percentFromUsual(t, -43.8)).toBe('44% below usual')
    expect(percentFromUsual(t, 3.4)).toBe('3% above usual')
    expect(percentFromUsual(t, 0.2)).toBe('on the usual yield')
    expect(plainUnit(t, 'bu/acre')).toBe('bushels per acre')
    expect(plainUnit(t, 'x')).toBe('x')
  })

  it('colors the bar by how far below usual it is, and never flags more than usual', () => {
    expect(toneOf(-44)).toBe('much-less')
    expect(toneOf(-15)).toBe('much-less')
    expect(toneOf(-8)).toBe('less')
    expect(toneOf(-4)).toBe('usual')
    expect(toneOf(30)).toBe('usual')
    expect(toneOf(null)).toBe('usual')
  })

  it('sizes the bar against the usual yield and keeps it inside its track', () => {
    expect(barShares(130, 100).fill).toBe(1)
    expect(barShares(200, 100).fill).toBe(1)
    expect(barShares(0, 100).fill).toBe(0)
    expect(barShares(100, 100).fill).toBeCloseTo(barShares(100, 100).usual)
    expect(barShares(50, 0).fill).toBe(0)
  })

  it('finds the yield of each crop and says why one is missing', () => {
    const [corn, soy, grain] = outcomesFor(data, ['corn', 'soybeans', 'small grain'], 2012)
    expect(corn.kind).toBe('yield')
    expect(soy).toMatchObject({ kind: 'missing', reason: 'not-covered' })
    expect(grain).toMatchObject({ kind: 'missing', reason: 'not-covered' })
    expect(outcomesFor(data, ['corn'], 2030)[0]).toMatchObject({ kind: 'missing', reason: 'not-published' })
  })

  it('ranges over dry summers only', () => {
    expect(dryRange(data, 'corn')).toEqual({ crop: 'corn', count: 2, lowest: -44, highest: 4 })
    expect(dryRange(data, 'soybeans')).toBeNull()
  })

  it('names the verdict for a summer', () => {
    expect(summerVerdict(t, true)).toBe('a dry summer')
    expect(summerVerdict(t, false)).toBe('not a dry summer')
    expect(summerVerdict(t, null)).toBe('a summer with no wetness data')
    expect(summerVerdict(t, undefined)).toBe('a summer with no wetness data')
  })
})
