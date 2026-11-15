import type { Place } from './selection.ts'

/** The contiguous United States, where the soil and crop sources have data. */
const US = { south: 24.4, north: 49.4, west: -125, east: -66.9 }

export function insideUS(place: Place): boolean {
  return place.lat >= US.south && place.lat <= US.north && place.lon >= US.west && place.lon <= US.east
}

const NUMBER = String.raw`(-?\d{1,3}(?:\.\d+)?)`
/** The coordinates inside a Google Maps link: "@lat,lon", "!3dlat!4dlon" or "q=lat,lon". */
const LINK = [
  new RegExp(`!3d${NUMBER}!4d${NUMBER}`),
  new RegExp(`[?&](?:q|ll|query)=${NUMBER}(?:,|%2C)${NUMBER}`),
  new RegExp(`@${NUMBER},${NUMBER}`),
]
const PLAIN = new RegExp(String.raw`^${NUMBER}\s*°?\s*([NSns])?\s*[,;\s]\s*${NUMBER}\s*°?\s*([EWew])?$`)

/** Reads a latitude and longitude from what a person pastes: plain numbers, with N/S/E/W, or a map link. */
export function parseCoords(text: string): Place | null {
  const input = text.trim()
  let lat: number
  let lon: number
  if (/^https?:\/\//i.test(input)) {
    const match = LINK.map((pattern) => pattern.exec(input)).find(Boolean)
    if (!match) return null
    lat = Number(match[1])
    lon = Number(match[2])
  } else {
    const match = PLAIN.exec(input)
    if (!match) return null
    lat = Number(match[1]) * (match[2]?.toUpperCase() === 'S' ? -1 : 1)
    lon = Number(match[3]) * (match[4]?.toUpperCase() === 'W' ? -1 : 1)
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null
  return { lat, lon }
}
