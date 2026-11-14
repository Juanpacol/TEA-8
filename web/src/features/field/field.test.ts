import { describe, expect, it } from 'vitest'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { alternatesEveryYear, cropLetter, cropOfYear, distinctCrops } from './field.ts'

const figure = { value: 1, unit: 'x', source: 's', parameter: 'p', queried_on: '2026-11-14' }

function point(crops: (string | null)[]): CasePoint {
  return {
    id: 'a', label: 'A', lon: 0, lat: 0,
    soil: { name: 'n', drainage: 'd', hydrologic_group: 'B', organic_matter: figure, available_water: figure },
    crop_history: crops.map((crop, i) => ({ year: 2008 + i, crop, source: 'CropScape', queried_on: '2026-11-14' })),
  }
}

describe('field helpers', () => {
  it('finds the crop of a year, or null when the year is absent', () => {
    const p = point(['Corn', 'Soybeans'])
    expect(cropOfYear(p, 2009)).toBe('Soybeans')
    expect(cropOfYear(p, 2001)).toBeNull()
  })

  it('uses one letter per crop and a dot for no data', () => {
    expect(cropLetter('Soybeans')).toBe('S')
    expect(cropLetter(null)).toBe('·')
  })

  it('lists each crop once, in order of appearance', () => {
    expect(distinctCrops(point(['Corn', 'Soybeans', 'Corn', null]))).toEqual(['Corn', 'Soybeans'])
  })

  it('knows when the crop alternated every year', () => {
    expect(alternatesEveryYear(point(['Corn', 'Soybeans', 'Corn']))).toBe(true)
    expect(alternatesEveryYear(point(['Corn', 'Corn', 'Soybeans']))).toBe(false)
    expect(alternatesEveryYear(point(['Corn', null, 'Corn']))).toBe(false)
  })
})
