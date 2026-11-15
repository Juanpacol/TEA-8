import { describe, expect, it } from 'vitest'
import { staticMap } from './reportMap.ts'

describe('staticMap', () => {
  const field = [
    { lat: 38.5, lon: -98.8 },
    { lat: 38.5, lon: -98.78 },
    { lat: 38.52, lon: -98.78 },
    { lat: 38.52, lon: -98.8 },
  ]

  it('centers the field and keeps it inside the picture', () => {
    const map = staticMap(field, 640, 360)
    const xs = map.points.map((p) => p.x)
    const ys = map.points.map((p) => p.y)
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThanOrEqual(640 * 0.6)
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(360 * 0.6)
    expect((Math.max(...xs) + Math.min(...xs)) / 2).toBeCloseTo(320)
    expect((Math.max(...ys) + Math.min(...ys)) / 2).toBeCloseTo(180)
  })

  it('covers the whole picture with tiles', () => {
    const map = staticMap(field, 640, 360)
    expect(Math.min(...map.tiles.map((t) => t.left))).toBeLessThanOrEqual(0)
    expect(Math.max(...map.tiles.map((t) => t.left + 256))).toBeGreaterThanOrEqual(640)
    expect(Math.max(...map.tiles.map((t) => t.top + 256))).toBeGreaterThanOrEqual(360)
  })

  it('puts a single place in the middle at a close zoom', () => {
    const map = staticMap([{ lat: 38.5, lon: -98.8 }], 640, 360)
    expect(map.zoom).toBe(15)
    expect(map.points[0].x).toBeCloseTo(320)
  })
})
