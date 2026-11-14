import { describe, expect, it } from 'vitest'
import type { TEA8DataFile, YieldRecord } from '../../shared/lib/data-types.ts'
import { describeChange, dryRange, outcomesFor, signed, summerVerdict } from './yields.ts'

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
  it('describes the change in words', () => {
    expect(describeChange(-43.8)).toBe('44% below its trend')
    expect(describeChange(3.4)).toBe('3% above its trend')
    expect(describeChange(0.2)).toBe('on its trend')
    expect(describeChange(null)).toBe('no trend comparison')
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
    expect(summerVerdict(true)).toBe('a dry summer')
    expect(summerVerdict(false)).toBe('not a dry summer')
    expect(summerVerdict(null)).toBe('a summer with no wetness data')
    expect(summerVerdict(undefined)).toBe('a summer with no wetness data')
  })

  it('writes signed percentages with a real minus', () => {
    expect(signed(-43.8)).toBe('−43.8%')
    expect(signed(3.5)).toBe('+3.5%')
  })
})
