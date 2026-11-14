import { describe, expect, it } from 'vitest'
import { BASES, BASE_ORDER, DEFAULT_BASE } from './basemaps.ts'

describe('map backgrounds', () => {
  it('offers each background once, only defined ones, and defaults to the detailed map', () => {
    expect(new Set(BASE_ORDER).size).toBe(BASE_ORDER.length)
    for (const id of BASE_ORDER) expect(Object.keys(BASES)).toContain(id)
    expect(DEFAULT_BASE).toBe('map')
    expect(BASE_ORDER).toContain(DEFAULT_BASE)
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
