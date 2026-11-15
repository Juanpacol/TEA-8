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
