import { describe, expect, it } from 'vitest'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { biggestSwing, pairsFor, pearson, strengthOf, type Pair } from './relation.ts'

const fig = (value: number | null) => ({ value, unit: 'u', source: 's', parameter: 'p', queried_on: '2026-11-14' })
const season = (year: number, deviation: number | null, dry = false) => ({
  year,
  dry,
  root_wetness: fig(0.5),
  root_wetness_deviation: fig(deviation),
  rainfall: fig(1),
  temperature: fig(20),
})
const record = (crop: string, year: number, change: number | null) => ({ year, crop, yield: fig(1), expected: fig(1), change_vs_trend: fig(change) })

const data = {
  seasons: [season(2010, 0.5), season(2011, 0, false), season(2012, -2, true), season(2013, null), season(2030, 1)],
  yields: [record('corn', 2010, 2), record('corn', 2011, 0), record('corn', 2012, -40), record('corn', 2013, 3), record('corn', 2030, 5), record('soybeans', 2012, -10)],
} as unknown as TEA8DataFile

describe('pairsFor', () => {
  it('keeps one crop, the baseline years and only summers with both numbers', () => {
    expect(pairsFor(data, 'corn', 2001, 2023).map((p) => p.year)).toEqual([2010, 2011, 2012])
  })

  it('carries the dry flag', () => {
    expect(pairsFor(data, 'corn', 2001, 2023).find((p) => p.year === 2012)?.dry).toBe(true)
  })
})

describe('pearson', () => {
  const pair = (deviation: number, change: number): Pair => ({ year: 2000, deviation, change, dry: false })

  it('is 1 for a perfect line and -1 for its mirror', () => {
    expect(pearson([pair(1, 1), pair(2, 2), pair(3, 3)])).toBeCloseTo(1, 10)
    expect(pearson([pair(1, 3), pair(2, 2), pair(3, 1)])).toBeCloseTo(-1, 10)
  })

  it('is null with too few points or no spread', () => {
    expect(pearson([pair(1, 1), pair(2, 2)])).toBeNull()
    expect(pearson([pair(1, 1), pair(1, 2), pair(1, 3)])).toBeNull()
  })
})

describe('biggestSwing', () => {
  it('finds the largest move in either direction', () => {
    expect(biggestSwing(pairsFor(data, 'corn', 2001, 2023))?.year).toBe(2012)
    expect(biggestSwing([])).toBeNull()
  })
})

describe('strengthOf', () => {
  it('names the size of a correlation, ignoring its sign', () => {
    expect(strengthOf(0.11)).toBe('weak')
    expect(strengthOf(-0.36)).toBe('moderate')
    expect(strengthOf(0.8)).toBe('strong')
  })
})
