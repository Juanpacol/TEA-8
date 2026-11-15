type Corner = { lat: number; lon: number }

/** What a shared link reopens: one place, or the corners of a field. */
export type Shared = { place: Corner } | { zone: Corner[] } | null

const MAX_CORNERS = 200
const fixed = (c: Corner) => `${c.lat.toFixed(5)},${c.lon.toFixed(5)}`

export function linkFor(target: { place: Corner } | { zone: Corner[] }, base = `${window.location.origin}${window.location.pathname}`): string {
  const query = 'place' in target ? `place=${fixed(target.place)}` : `zone=${target.zone.map(fixed).join(';')}`
  return `${base}#/tool?${query}`
}

function corner(text: string): Corner | null {
  const [lat, lon] = text.split(',').map(Number)
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : null
}

/** Reads `#/tool?place=lat,lon` or `#/tool?zone=lat,lon;lat,lon;…`. Anything else opens the tool as usual. */
export function sharedFromHash(hash: string): Shared {
  const query = hash.split('?')[1]
  if (!query) return null
  const params = new URLSearchParams(query)
  const place = params.get('place')
  if (place) {
    const read = corner(place)
    return read ? { place: read } : null
  }
  const zone = params.get('zone')
  if (zone) {
    const parts = zone.split(';')
    if (parts.length < 3 || parts.length > MAX_CORNERS) return null
    const corners = parts.map(corner)
    return corners.every((c): c is Corner => c !== null) ? { zone: corners } : null
  }
  return null
}
