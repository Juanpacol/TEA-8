import type { CasePoint } from '../../shared/lib/data-types.ts'

/** The crop grown at a point in a year, or null when the history has no value for it. */
export function cropOfYear(point: CasePoint, year: number): string | null {
  return point.crop_history.find((entry) => entry.year === year)?.crop ?? null
}

/** One letter for the strip of years. The full name stays in the label of each cell. */
export function cropLetter(crop: string | null): string {
  return crop === null || crop.length === 0 ? '·' : crop.charAt(0).toUpperCase()
}

/** The distinct crops in a history, in order of first appearance, for the legend. */
export function distinctCrops(point: CasePoint): string[] {
  const seen: string[] = []
  for (const { crop } of point.crop_history) {
    if (crop !== null && !seen.includes(crop)) seen.push(crop)
  }
  return seen
}

/** True when the crop alternated every year, which is what a corn and soybean rotation looks like. */
export function alternatesEveryYear(point: CasePoint): boolean {
  const crops = [...point.crop_history].sort((a, b) => a.year - b.year).map((entry) => entry.crop)
  return crops.length > 1 && crops.every((crop, i) => crop !== null && (i === 0 || crop !== crops[i - 1]))
}
