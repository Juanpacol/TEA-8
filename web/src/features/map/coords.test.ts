import { describe, expect, it } from 'vitest'
import { insideUS, parseCoords } from './coords.ts'

describe('parseCoords', () => {
  it('reads plain numbers with a comma or a space', () => {
    expect(parseCoords('40.52, -88.86')).toEqual({ lat: 40.52, lon: -88.86 })
    expect(parseCoords('  40.52 -88.86 ')).toEqual({ lat: 40.52, lon: -88.86 })
  })

  it('reads degrees with N, S, E and W', () => {
    expect(parseCoords('40.52° N, 88.86° W')).toEqual({ lat: 40.52, lon: -88.86 })
    expect(parseCoords('4.6S 74.08W')).toEqual({ lat: -4.6, lon: -74.08 })
  })

  it('reads a Google Maps link', () => {
    expect(parseCoords('https://www.google.com/maps/@40.52,-88.86,12z')).toEqual({ lat: 40.52, lon: -88.86 })
    expect(parseCoords('https://www.google.com/maps/place/X/@40.1,-88.1,12z/data=!3d40.52!4d-88.86')).toEqual({ lat: 40.52, lon: -88.86 })
    expect(parseCoords('https://maps.google.com/?q=40.52,-88.86')).toEqual({ lat: 40.52, lon: -88.86 })
  })

  it('rejects text that is not a coordinate', () => {
    expect(parseCoords('Bloomington')).toBeNull()
    expect(parseCoords('40.52')).toBeNull()
    expect(parseCoords('95, -88')).toBeNull()
    expect(parseCoords('40, -190')).toBeNull()
    expect(parseCoords('https://example.com/farm')).toBeNull()
  })
})

describe('insideUS', () => {
  it('accepts the contiguous United States only', () => {
    expect(insideUS({ lat: 40.52, lon: -88.86 })).toBe(true)
    expect(insideUS({ lat: 6.25, lon: -75.56 })).toBe(false)
    expect(insideUS({ lat: 61.2, lon: -149.9 })).toBe(false)
  })
})
