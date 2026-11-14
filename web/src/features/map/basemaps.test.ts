import { describe, expect, it } from 'vitest'
import { BASES, BASE_ORDER, DEFAULT_BASE } from './basemaps.ts'

describe('map backgrounds', () => {
  it('lists every background once and defaults to the one with names and roads', () => {
    expect(new Set(BASE_ORDER).size).toBe(BASE_ORDER.length)
    expect(BASE_ORDER).toEqual(Object.keys(BASES))
    expect(DEFAULT_BASE).toBe('map')
  })

  it('uses tile URLs with z, y and x and credits its source', () => {
    for (const base of Object.values(BASES).filter((b) => b.url)) {
      expect(base.url).toContain('{z}/{y}/{x}')
      expect(base.attribution.length).toBeGreaterThan(0)
    }
  })

  it('keeps the vegetation visible but see-through over detailed backgrounds', () => {
    expect(BASES.map.ndviOpacity).toBeLessThan(BASES.vegetation.ndviOpacity)
    expect(BASES.aerial.ndviOpacity).toBeLessThan(BASES.vegetation.ndviOpacity)
  })
})
