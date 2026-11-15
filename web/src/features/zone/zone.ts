export type Corner = { lat: number; lon: number }

const EARTH_RADIUS_M = 6_371_008.8
export const M2_PER_ACRE = 4046.8564224
export const M2_PER_HECTARE = 10_000

/** Area of a closed figure on the sphere, in square meters (the spherical excess of its corners). */
export function areaM2(corners: Corner[]): number {
  if (corners.length < 3) return 0
  const rad = Math.PI / 180
  let sum = 0
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % corners.length]
    sum += (b.lon - a.lon) * rad * (2 + Math.sin(a.lat * rad) + Math.sin(b.lat * rad))
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2)
}

/** The mean of the corners: good enough as the "center" of a field-sized figure. */
export function centerOf(corners: Corner[]): Corner {
  const lat = corners.reduce((s, c) => s + c.lat, 0) / corners.length
  const lon = corners.reduce((s, c) => s + c.lon, 0) / corners.length
  return { lat, lon }
}

/** A figure with the first corner repeated at the end has it removed; it is closed anyway. */
function open(corners: Corner[]): Corner[] {
  const [first, last] = [corners[0], corners[corners.length - 1]]
  return corners.length > 1 && first.lat === last.lat && first.lon === last.lon ? corners.slice(0, -1) : corners
}

function valid(corners: Corner[]): Corner[] | null {
  const ring = open(corners)
  const ok = ring.length >= 3 && ring.every((c) => Number.isFinite(c.lat) && Number.isFinite(c.lon) && Math.abs(c.lat) <= 90 && Math.abs(c.lon) <= 180)
  return ok ? ring : null
}

type Geometry = { type: string; coordinates?: unknown; geometries?: Geometry[] }

function outerRing(geometry: Geometry | null | undefined): number[][] | null {
  if (!geometry) return null
  if (geometry.type === 'Polygon') return (geometry.coordinates as number[][][])?.[0] ?? null
  if (geometry.type === 'MultiPolygon') return (geometry.coordinates as number[][][][])?.[0]?.[0] ?? null
  if (geometry.type === 'GeometryCollection') {
    for (const inner of geometry.geometries ?? []) {
      const ring = outerRing(inner)
      if (ring) return ring
    }
  }
  return null
}

/** The outer ring of the first polygon in a GeoJSON text (a geometry, a Feature or a FeatureCollection). */
export function parseGeoJson(text: string): Corner[] | null {
  let json: { type?: string; geometry?: Geometry; features?: { geometry?: Geometry }[] }
  try {
    json = JSON.parse(text)
  } catch {
    return null
  }
  const geometries: (Geometry | undefined)[] =
    json.type === 'FeatureCollection' ? (json.features ?? []).map((f) => f.geometry) : json.type === 'Feature' ? [json.geometry] : [json as Geometry]
  for (const geometry of geometries) {
    const ring = outerRing(geometry)
    if (ring) return valid(ring.map(([lon, lat]) => ({ lat: Number(lat), lon: Number(lon) })))
  }
  return null
}

/** The outer boundary of the first polygon in a KML text, as Google Earth saves it ("lon,lat,alt lon,lat,alt …"). */
export function parseKml(text: string): Corner[] | null {
  const polygon = /<Polygon[\s\S]*?<\/Polygon>/i.exec(text)?.[0]
  if (!polygon) return null
  const outer = /<outerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/i.exec(polygon) ?? /<coordinates>([\s\S]*?)<\/coordinates>/i.exec(polygon)
  if (!outer) return null
  const corners = outer[1]
    .trim()
    .split(/\s+/)
    .map((tuple) => tuple.split(','))
    .map(([lon, lat]) => ({ lat: Number(lat), lon: Number(lon) }))
  return valid(corners)
}

/** Reads a field outline from a file: KML (Google Earth) or GeoJSON. */
export function parseZoneFile(name: string, text: string): Corner[] | null {
  const looksKml = /\.kml$/i.test(name) || /^\s*<\?xml|<kml/i.test(text)
  return looksKml ? parseKml(text) : parseGeoJson(text)
}
