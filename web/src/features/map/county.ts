import { REGION_OUTLINE } from '../../regions/index.ts'

type Ring = [number, number][]

const feature = REGION_OUTLINE.features[0]
const OUTER_RING = (feature.geometry as GeoJSON.Polygon).coordinates[0] as Ring

/** Name of the county the project data covers, from the outline file (US Census, retrieved 2026-11-14). */
export const COUNTY_NAME: string = feature.properties?.NAME

/** The county outline as GeoJSON, for drawing on the map. */
export const COUNTY_OUTLINE = REGION_OUTLINE

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
