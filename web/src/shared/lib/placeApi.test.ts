import { afterEach, describe, expect, it, vi } from 'vitest'
import { ZoneRefused, fetchPlaceEvidence, fetchZoneEvidence, isUnavailable } from './placeApi.ts'

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

describe('fetchZoneEvidence', () => {
  const corners = [{ lat: 38.49, lon: -98.81 }, { lat: 38.49, lon: -98.79 }, { lat: 38.51, lon: -98.79 }]

  it('posts the corners as [lat, lon] pairs', async () => {
    const fetchMock = respond(200, { zone: { corners: 3 }, limits: [] })
    vi.stubGlobal('fetch', fetchMock)
    await fetchZoneEvidence(corners, { baseUrl: 'https://api.test' })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.test/zone')
    expect(JSON.parse(init.body as string)).toEqual({ corners: [[38.49, -98.81], [38.49, -98.79], [38.51, -98.79]] })
  })

  it('throws the refusal code of the service', async () => {
    vi.stubGlobal('fetch', respond(400, { error: { code: 'TOO_LARGE' } }))
    await expect(fetchZoneEvidence(corners, { baseUrl: 'https://api.test' })).rejects.toEqual(new ZoneRefused('TOO_LARGE'))
  })

  it('a network failure becomes UNAVAILABLE', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))))
    await expect(fetchZoneEvidence(corners, { baseUrl: 'https://api.test' })).rejects.toMatchObject({ code: 'UNAVAILABLE' })
  })
})
