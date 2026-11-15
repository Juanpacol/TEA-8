import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPlaceEvidence, isUnavailable } from './placeApi.ts'

const good = { place: { lat: 38.5, lon: -98.8 }, queried_on: '2026-11-15', climate: {}, soil: null, crops: {}, limits: [] }

function respond(status: number, body: unknown) {
  return vi.fn((_url: string) => Promise.resolve(new Response(JSON.stringify(body), { status })))
}

afterEach(() => vi.unstubAllGlobals())

describe('fetchPlaceEvidence', () => {
  it('asks the route with the coordinates and returns the answer', async () => {
    const fetchMock = respond(200, good)
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchPlaceEvidence({ lat: 38.5, lon: -98.8 }, { baseUrl: 'https://api.test/' })).resolves.toEqual(good)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/place?lat=38.50000&lon=-98.80000')
  })

  it('throws when the service refuses or sends something else', async () => {
    vi.stubGlobal('fetch', respond(400, { error: { code: 'OUTSIDE_COVERAGE' } }))
    await expect(fetchPlaceEvidence({ lat: 6, lon: -75 }, { baseUrl: 'https://api.test' })).rejects.toThrow()
    vi.stubGlobal('fetch', respond(200, { hello: 1 }))
    await expect(fetchPlaceEvidence({ lat: 38.5, lon: -98.8 }, { baseUrl: 'https://api.test' })).rejects.toThrow()
  })

  it('throws when no service is configured', async () => {
    await expect(fetchPlaceEvidence({ lat: 38.5, lon: -98.8 }, { baseUrl: '' })).rejects.toThrow()
  })
})

describe('isUnavailable', () => {
  it('tells a source that did not answer from its data', () => {
    expect(isUnavailable({ error: 'down' })).toBe(true)
    expect(isUnavailable({ name: 'Harney' })).toBe(false)
    expect(isUnavailable(null)).toBe(false)
  })
})
