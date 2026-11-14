import { describe, expect, it } from 'vitest'
import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR, NDVI_LEGEND_STOPS, NDVI_LEGEND_TICKS, ndviTileUrl } from './gibs.ts'

describe('NDVI layer', () => {
  it('builds the tile URL for the mid-July composite of a year', () => {
    expect(ndviTileUrl(2012)).toContain('/2012-07-20/')
  })

  it('covers the years of the data file', () => {
    expect(NDVI_FIRST_YEAR).toBeLessThanOrEqual(2001)
    expect(NDVI_LAST_YEAR).toBeGreaterThanOrEqual(2023)
  })

  it('has legend colors and ticks in order along the bar', () => {
    expect(NDVI_LEGEND_STOPS.length).toBeGreaterThan(2)
    expect(NDVI_LEGEND_STOPS.every((color) => /^#[0-9a-f]{6}$/.test(color))).toBe(true)
    const positions = NDVI_LEGEND_TICKS.map((tick) => tick.at)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(positions[0]).toBe(0)
    expect(positions.at(-1)).toBe(1)
  })
})
