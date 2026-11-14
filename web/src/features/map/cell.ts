import type { CasePoint } from '../../shared/lib/data-types.ts'

/**
 * Grid of the NASA POWER climate figures used here (0.5 degrees of latitude by 0.625 of longitude,
 * cells centered on multiples of those steps). Checked on 2026-11-14 by querying POWER around point A:
 * T2M, GWETROOT and PRECTOTCORR changed together between 40.2375 and 40.3 N, and at about 89.06 W and 88.44 W.
 */
const LAT_STEP = 0.5
const LON_STEP = 0.625

export type Cell = { south: number; north: number; west: number; east: number }

/** The grid cell that holds a point: every place inside it gets the same climate figures. */
export function powerCell(lat: number, lon: number): Cell {
  const centerLat = Math.round(lat / LAT_STEP) * LAT_STEP
  const centerLon = Math.round(lon / LON_STEP) * LON_STEP
  return {
    south: centerLat - LAT_STEP / 2,
    north: centerLat + LAT_STEP / 2,
    west: centerLon - LON_STEP / 2,
    east: centerLon + LON_STEP / 2,
  }
}

/** The label of a case point on the map: its soil and the crop recorded for the year. */
export function pointSummary(point: CasePoint, year: number): string {
  const crop = point.crop_history.find((entry) => entry.year === year)?.crop
  const cropText = crop ? `${crop.toLowerCase()} in ${year}` : `no crop record for ${year}`
  return `${point.label}: ${point.soil.name} soil, ${cropText}`
}
