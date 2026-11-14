import { describe, expect, it } from 'vitest'
import { loadSoilZones, soilFamily } from './soil-zones.ts'

describe('soil zones', () => {
  it('names the family of a map unit by its first word', () => {
    expect(soilFamily('Catlin silt loam, 2 to 5 percent slopes')).toBe('Catlin')
  })

  it('has zones for each case point, one of them holding the point', async () => {
    const file = await loadSoilZones()
    for (const entry of Object.values(file.points)) {
      expect(entry.zones.length).toBeGreaterThan(0)
      expect(entry.zones.filter((zone) => zone.holds_point)).toHaveLength(1)
      for (const zone of entry.zones) expect(zone.ring.length).toBeGreaterThanOrEqual(4)
    }
  })
})
