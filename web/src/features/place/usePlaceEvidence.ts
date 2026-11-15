import { useState } from 'react'
import { fetchPlaceEvidence, type PlaceEvidence } from '../../shared/lib/placeApi.ts'

type State =
  | { status: 'idle' }
  | { status: 'loading'; key: string }
  | { status: 'ready'; key: string; evidence: PlaceEvidence }
  | { status: 'failed'; key: string }

export function placeKey(place: { lat: number; lon: number }): string {
  return `${place.lat.toFixed(5)},${place.lon.toFixed(5)}`
}

/** Asks for the evidence of a place on demand and keeps it until another place is asked. */
export function usePlaceEvidence() {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function analyze(place: { lat: number; lon: number }) {
    const key = placeKey(place)
    setState({ status: 'loading', key })
    try {
      const evidence = await fetchPlaceEvidence(place)
      setState((current) => ('key' in current && current.key === key ? { status: 'ready', key, evidence } : current))
    } catch {
      setState((current) => ('key' in current && current.key === key ? { status: 'failed', key } : current))
    }
  }

  return { state, analyze }
}
