import { describe, expect, it } from 'vitest'
import { M2_PER_ACRE, areaM2, centerOf, parseGeoJson, parseKml, parseZoneFile } from './zone.ts'

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

describe('centerOf', () => {
  it('is the mean of the corners', () => {
    const center = centerOf(square)
    expect(center.lat).toBeCloseTo(40.505, 9)
    expect(center.lon).toBeCloseTo(-88.895, 9)
  })
})

describe('parseGeoJson', () => {
  const ring = [[-88.9, 40.5], [-88.89, 40.5], [-88.89, 40.51], [-88.9, 40.51], [-88.9, 40.5]]

  it('reads a Polygon, a Feature and a FeatureCollection, without the repeated last corner', () => {
    const polygon = { type: 'Polygon', coordinates: [ring] }
    expect(parseGeoJson(JSON.stringify(polygon))).toEqual(square)
    expect(parseGeoJson(JSON.stringify({ type: 'Feature', geometry: polygon, properties: {} }))).toEqual(square)
    expect(parseGeoJson(JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }, { type: 'Feature', geometry: polygon }] }))).toEqual(square)
  })

  it('reads the first polygon of a MultiPolygon', () => {
    expect(parseGeoJson(JSON.stringify({ type: 'MultiPolygon', coordinates: [[ring]] }))).toEqual(square)
  })

  it('rejects text with no polygon', () => {
    expect(parseGeoJson('not json')).toBeNull()
    expect(parseGeoJson(JSON.stringify({ type: 'Point', coordinates: [0, 0] }))).toBeNull()
    expect(parseGeoJson(JSON.stringify({ type: 'Polygon', coordinates: [[[0, 0], [1, 1]]] }))).toBeNull()
  })
})

describe('parseKml', () => {
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><name>My field</name>
<Polygon><outerBoundaryIs><LinearRing><coordinates>
  -88.9,40.5,0 -88.89,40.5,0 -88.89,40.51,0 -88.9,40.51,0 -88.9,40.5,0
</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>`

  it('reads the outer boundary as Google Earth saves it', () => {
    expect(parseKml(kml)).toEqual(square)
  })

  it('rejects a KML with only a point', () => {
    expect(parseKml('<kml><Placemark><Point><coordinates>-88.9,40.5,0</coordinates></Point></Placemark></kml>')).toBeNull()
  })

  it('parseZoneFile picks the reader from the name or the content', () => {
    expect(parseZoneFile('field.kml', kml)).toEqual(square)
    expect(parseZoneFile('field.txt', kml)).toEqual(square)
    expect(parseZoneFile('field.geojson', JSON.stringify({ type: 'Polygon', coordinates: [[[-88.9, 40.5], [-88.89, 40.5], [-88.89, 40.51], [-88.9, 40.51]]] }))).toEqual(square)
  })
})
