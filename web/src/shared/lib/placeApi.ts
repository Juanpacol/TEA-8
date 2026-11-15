/** What a source answered for a place: its data, or that it did not answer. */
export type Unavailable = { error: string }

export type PlaceSeason = {
  year: number
  root_wetness: number
  root_wetness_deviation: number | null
  rainfall_mm_day: number | null
  temperature_c: number | null
  dry: boolean | null
}

export type PlaceClimate = { baseline: string; seasons: PlaceSeason[]; dry_years: number[]; source: string; note: string }

export type PlaceSoil = {
  name: string
  component_pct: number | null
  drainage: string | null
  hydrologic_group: string | null
  organic_matter_pct: number | null
  available_water: number | null
  source: string
}

export type PlaceCrops = { years: Record<string, string | null>; source: string; note: string }

export type PlaceEvidence = {
  place: { lat: number; lon: number }
  queried_on: string
  climate: PlaceClimate | Unavailable
  /** null when the soil survey has nothing at the point (a city, water). */
  soil: PlaceSoil | Unavailable | null
  crops: PlaceCrops | Unavailable
  limits: string[]
}

const TIMEOUT_MS = 90_000

export function isUnavailable(value: unknown): value is Unavailable {
  return typeof value === 'object' && value !== null && 'error' in value
}

function isPlaceEvidence(value: unknown): value is PlaceEvidence {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.queried_on === 'string' && typeof v.climate === 'object' && typeof v.crops === 'object' && Array.isArray(v.limits)
}

/** Asks the API what the sources hold for one point. Throws on any failure. */
export async function fetchPlaceEvidence(
  place: { lat: number; lon: number },
  options: { baseUrl?: string; timeoutMs?: number } = {},
): Promise<PlaceEvidence> {
  const baseUrl = options.baseUrl ?? (import.meta.env.VITE_API_URL as string | undefined)
  if (!baseUrl) throw new Error('The place service is not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS)
  try {
    const url = `${baseUrl.replace(/\/$/, '')}/place?lat=${place.lat.toFixed(5)}&lon=${place.lon.toFixed(5)}`
    const response = await fetch(url, { signal: controller.signal })
    const body: unknown = await response.json().catch(() => null)
    if (!response.ok || !isPlaceEvidence(body)) throw new Error(`The place service answered ${response.status}`)
    return body
  } finally {
    clearTimeout(timer)
  }
}
