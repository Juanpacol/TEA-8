/** A static map for the printed report: the aerial tiles that cover a place or a field, and where its corners fall on them. */

type Corner = { lat: number; lon: number }

const TILE = 256
const MAX_ZOOM = 16
const POINT_ZOOM = 15
/** The field takes at most this share of the picture, so its surroundings show too. */
const FILL = 0.6

function project(c: Corner, zoom: number) {
  const size = TILE * 2 ** zoom
  const lat = (c.lat * Math.PI) / 180
  return {
    x: ((c.lon + 180) / 360) * size,
    y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * size,
  }
}

export type StaticMap = {
  zoom: number
  tiles: { x: number; y: number; left: number; top: number }[]
  /** The corners in picture pixels. One entry for a place. */
  points: { x: number; y: number }[]
}

export function staticMap(corners: Corner[], width: number, height: number): StaticMap {
  let zoom = POINT_ZOOM
  if (corners.length > 1) {
    zoom = MAX_ZOOM
    while (zoom > 3) {
      const p = corners.map((c) => project(c, zoom))
      const w = Math.max(...p.map((q) => q.x)) - Math.min(...p.map((q) => q.x))
      const h = Math.max(...p.map((q) => q.y)) - Math.min(...p.map((q) => q.y))
      if (w <= width * FILL && h <= height * FILL) break
      zoom -= 1
    }
  }
  const p = corners.map((c) => project(c, zoom))
  const cx = (Math.max(...p.map((q) => q.x)) + Math.min(...p.map((q) => q.x))) / 2
  const cy = (Math.max(...p.map((q) => q.y)) + Math.min(...p.map((q) => q.y))) / 2
  const left = cx - width / 2
  const top = cy - height / 2
  const tiles = []
  for (let x = Math.floor(left / TILE); x <= Math.floor((left + width) / TILE); x++) {
    for (let y = Math.floor(top / TILE); y <= Math.floor((top + height) / TILE); y++) {
      tiles.push({ x, y, left: x * TILE - left, top: y * TILE - top })
    }
  }
  return { zoom, tiles, points: p.map((q) => ({ x: q.x - left, y: q.y - top })) }
}
