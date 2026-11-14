import { describe, expect, it } from 'vitest'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { powerCell } from './cell.ts'
import { describePlace, distanceKm, formatCoords, insideCell } from './selection.ts'

const figure = { value: 1, unit: 'x', source: 's', parameter: 'p', queried_on: '2026-11-14' }
function point(id: string, label: string, lat: number, lon: number, soil: string, crop: string): CasePoint {
  return {
    id, label, lat, lon,
    soil: { name: soil, drainage: 'd', hydrologic_group: 'B', organic_matter: figure, available_water: figure },
    crop_history: [{ year: 2023, crop, source: 'CropScape (CDL)', queried_on: '2026-11-14' }],
  }
}
const A = point('point-a', 'Point A', 40.284, -88.6594, 'Osco', 'Corn')
const B = point('point-b', 'Point B', 40.6954, -88.6735, 'Chenoa', 'Soybeans')

describe('place helpers', () => {
  it('measures a known distance', () => {
    expect(distanceKm(A, B)).toBeGreaterThan(45)
    expect(distanceKm(A, B)).toBeLessThan(47)
  })

  it('writes coordinates with hemispheres', () => {
    expect(formatCoords({ lat: 40.7, lon: -88.65 })).toBe('40.70°N, 88.65°W')
  })

  it('knows when a spot is inside the climate cell', () => {
    const cell = powerCell(A.lat, A.lon)
    expect(insideCell({ lat: 40.5, lon: -88.7 }, cell)).toBe(true)
    expect(insideCell({ lat: 40.1, lon: -88.2 }, cell)).toBe(false)
  })
})

describe('describePlace', () => {
  it('shows a case point with its soil and crop when the click is on it', () => {
    const info = describePlace({ lat: 40.2845, lon: -88.6597 }, [A, B], 2023)
    expect(info.title).toBe('Point A')
    expect(info.pointId).toBe('point-a')
    expect(info.lines[0]).toBe('Point A: Osco soil, corn in 2023')
  })

  it('says soil and crops are known only at the case points when the click is elsewhere', () => {
    const info = describePlace({ lat: 40.5, lon: -88.7 }, [A, B], 2023)
    expect(info.title).toContain('Chosen spot')
    expect(info.lines[0]).toContain('only have soil and crop data at two example fields')
    expect(info.lines[0]).toContain('The closest is Point')
    expect(info.lines[1]).toContain('the numbers at the top of the page apply here')
    expect(info.lines[2]).toBe('Inside McLean County.')
  })

  it('says there is no climate and no project data outside the cell and the county', () => {
    const info = describePlace({ lat: 40.1164, lon: -88.2434 }, [A, B], 2023)
    expect(info.lines[1]).toContain('no numbers here')
    expect(info.lines[2]).toBe('Outside McLean County: this tool has no data here.')
  })
})
