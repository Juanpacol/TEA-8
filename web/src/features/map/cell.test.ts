import { describe, expect, it } from 'vitest'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { pointSummary, powerCell } from './cell.ts'
import { translator } from '../../shared/i18n/index.ts'
const t = translator('en')

const figure = { value: 1, unit: 'x', source: 's', parameter: 'p', queried_on: '2026-11-14' }
const pointA: CasePoint = {
  id: 'point-a', label: 'Point A', lon: -88.6594, lat: 40.284,
  soil: { name: 'Osco', drainage: 'Well drained', hydrologic_group: 'B', organic_matter: figure, available_water: figure },
  crop_history: [{ year: 2012, crop: 'Soybeans', source: 'CropScape (CDL)', queried_on: '2026-11-14' }],
}

describe('climate grid cell', () => {
  it('matches the cell edges measured around point A', () => {
    expect(powerCell(40.284, -88.6594)).toEqual({ south: 40.25, north: 40.75, west: -89.0625, east: -88.4375 })
  })

  it('puts both case points in the same cell', () => {
    expect(powerCell(40.6954, -88.6735)).toEqual(powerCell(40.284, -88.6594))
  })

  it('moves to the next cell just south of the edge', () => {
    expect(powerCell(40.24, -88.6594).north).toBe(40.25)
  })
})

describe('point label', () => {
  it('names the soil and the crop of the year', () => {
    expect(pointSummary(t, pointA, 2012)).toBe('Point A: Osco soil, soybeans in 2012')
  })

  it('says when the year has no crop record', () => {
    expect(pointSummary(t, pointA, 2003)).toBe('Point A: Osco soil, no crop record for 2003')
  })
})
