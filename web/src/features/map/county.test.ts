import { describe, expect, it } from 'vitest'
import { COUNTY_NAME, COUNTY_OUTLINE, insideCounty } from './county.ts'

describe('county outline', () => {
  it('is McLean County, Illinois (GEOID 17113)', () => {
    expect(COUNTY_NAME).toBe('McLean County')
    expect(COUNTY_OUTLINE.features[0].properties?.GEOID).toBe('17113')
  })

  it('contains both case points of the data file', () => {
    expect(insideCounty(40.284, -88.6594)).toBe(true)
    expect(insideCounty(40.6954, -88.6735)).toBe(true)
  })

  it('contains Bloomington and leaves out Champaign, Peoria and Chicago', () => {
    expect(insideCounty(40.4842, -88.9937)).toBe(true)
    expect(insideCounty(40.1164, -88.2434)).toBe(false)
    expect(insideCounty(40.6936, -89.589)).toBe(false)
    expect(insideCounty(41.8781, -87.6298)).toBe(false)
  })
})
