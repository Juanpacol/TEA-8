import { pointName, type Translate } from '../../shared/i18n/index.ts'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { pointSummary, powerCell, type Cell } from './cell.ts'
import { insideCounty } from './county.ts'

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

export function formatCoords(t: Translate, place: Place): string {
  const lat = `${Math.abs(place.lat).toFixed(2)}°${t(place.lat >= 0 ? 'dir.n' : 'dir.s')}`
  const lon = `${Math.abs(place.lon).toFixed(2)}°${t(place.lon >= 0 ? 'dir.e' : 'dir.w')}`
  return `${lat}, ${lon}`
}

/** The case point the place sits on (within the snap distance), or null when it is somewhere else. */
export function pointAt(place: Place, points: CasePoint[]): CasePoint | null {
  return points.find((point) => distanceKm(place, point) <= SNAP_KM) ?? null
}

export type PlaceInfo = {
  title: string
  /** The case point the place is (or is closest to), so the rest of the page can follow it. */
  pointId: string
  lines: string[]
}

/** What the project data says about a spot the user picked on the map, and what it does not. */
export function describePlace(t: Translate, place: Place, points: CasePoint[], year: number): PlaceInfo {
  const cell = powerCell(points[0].lat, points[0].lon)
  const ranked = points
    .map((point) => ({ point, km: distanceKm(place, point) }))
    .sort((a, b) => a.km - b.km)
  const { point, km } = ranked[0]
  const isPoint = km <= SNAP_KM

  const lines: string[] = []
  const county = t('county.name')
  if (isPoint) {
    lines.push(pointSummary(t, point, year))
  } else {
    const label = pointName(t, point.label)
    const summary = pointSummary(t, point, year).replace(`${label}: `, '')
    lines.push(t('place.far', { point: label, km: Math.round(km), summary }))
  }
  lines.push(t(insideCell(place, cell) ? 'place.weatherHere' : 'place.weatherNone'))
  lines.push(t(insideCounty(place.lat, place.lon) ? 'place.inside' : 'place.outside', { county }))

  return { title: isPoint ? pointName(t, point.label) : t('place.title'), pointId: point.id, lines }
}
