import { describe, expect, it } from 'vitest'
import { M2_PER_ACRE, areaM2 } from './zone.ts'

// A square of 0.01° by 0.01° near Bloomington, Illinois: about 1.11 km by 0.85 km.
const square = [
  { lat: 40.5, lon: -88.9 },
  { lat: 40.5, lon: -88.89 },
  { lat: 40.51, lon: -88.89 },
  { lat: 40.51, lon: -88.9 },
]

describe('areaM2', () => {
  it('measures a small square like a flat map would', () => {
    const flat = 0.01 * 111_195 * (0.01 * 111_195 * Math.cos((40.505 * Math.PI) / 180))
    expect(areaM2(square) / flat).toBeCloseTo(1, 2)
  })

  it('does not depend on the drawing direction', () => {
    expect(areaM2([...square].reverse())).toBeCloseTo(areaM2(square), 3)
  })

  it('is zero for fewer than three corners', () => {
    expect(areaM2(square.slice(0, 2))).toBe(0)
  })

  it('a quarter section (160 acres) comes out near 160 acres', () => {
    // Half a mile on each side: 0.5 mi = 804.672 m.
    const dLat = 804.672 / 111_195
    const dLon = 804.672 / (111_195 * Math.cos((40.5 * Math.PI) / 180))
    const quarter = [
      { lat: 40.5, lon: -88.9 },
      { lat: 40.5, lon: -88.9 + dLon },
      { lat: 40.5 + dLat, lon: -88.9 + dLon },
      { lat: 40.5 + dLat, lon: -88.9 },
    ]
    expect(areaM2(quarter) / M2_PER_ACRE).toBeCloseTo(160, 0)
  })
})
