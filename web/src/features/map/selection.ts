import type { CasePoint } from '../../shared/lib/data-types.ts'
import { pointSummary, powerCell, type Cell } from './cell.ts'
import { COUNTY_NAME, insideCounty } from './county.ts'

export type Place = { lat: number; lon: number }

/** A click closer than this to a case point counts as choosing that point. */
const SNAP_KM = 2

export function distanceKm(a: Place, b: Place): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function insideCell(place: Place, cell: Cell): boolean {
  return place.lat >= cell.south && place.lat <= cell.north && place.lon >= cell.west && place.lon <= cell.east
}

export function formatCoords(place: Place): string {
  const lat = `${Math.abs(place.lat).toFixed(2)}°${place.lat >= 0 ? 'N' : 'S'}`
  const lon = `${Math.abs(place.lon).toFixed(2)}°${place.lon >= 0 ? 'E' : 'W'}`
  return `${lat}, ${lon}`
}

export type PlaceInfo = {
  title: string
  /** The case point the place is (or is closest to), so the rest of the page can follow it. */
  pointId: string
  lines: string[]
}

/** What the project data says about a spot the user picked on the map, and what it does not. */
export function describePlace(place: Place, points: CasePoint[], year: number): PlaceInfo {
  const cell = powerCell(points[0].lat, points[0].lon)
  const ranked = points
    .map((point) => ({ point, km: distanceKm(place, point) }))
    .sort((a, b) => a.km - b.km)
  const { point, km } = ranked[0]
  const isPoint = km <= SNAP_KM

  const lines: string[] = []
  if (isPoint) {
    lines.push(pointSummary(point, year))
  } else {
    lines.push(
      `We only have soil and crop data at two example fields. The closest is ${point.label}, about ${Math.round(km)} km away (${pointSummary(point, year).replace(`${point.label}: `, '')}).`,
    )
  }
  lines.push(
    insideCell(place, cell)
      ? 'Weather: the numbers at the top of the page apply here (they cover the whole dashed box).'
      : 'Weather: no numbers here, this spot is outside the dashed box.',
  )
  lines.push(insideCounty(place.lat, place.lon) ? `Inside ${COUNTY_NAME}.` : `Outside ${COUNTY_NAME}: this tool has no data here.`)

  return { title: isPoint ? point.label : `Chosen spot, ${formatCoords(place)}`, pointId: point.id, lines }
}
