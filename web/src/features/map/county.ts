import countyFile from './mclean-county.json'

type Ring = [number, number][]

const feature = countyFile.features[0]
const OUTER_RING = feature.geometry.coordinates[0] as Ring

/** Name of the county the project data covers, from the outline file (US Census, retrieved 2026-11-14). */
export const COUNTY_NAME: string = feature.properties.NAME

/** The county outline as GeoJSON, for drawing on the map. */
export const COUNTY_OUTLINE = countyFile as unknown as GeoJSON.FeatureCollection

/** True when a point lies inside the county (ray casting on the outer ring; the county has no holes). */
export function insideCounty(lat: number, lon: number, ring: Ring = OUTER_RING): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
