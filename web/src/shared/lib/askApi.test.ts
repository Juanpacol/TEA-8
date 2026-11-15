import { afterEach, describe, expect, it, vi } from 'vitest'
import { AskFailure, askQuestion, failureFromStatus } from './askApi.ts'

const good = { answered: true, answer: 'ok', claims: [], notice: 'n', prompt_version: 'ask-v1' }

function stubFetch(impl: typeof fetch) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => vi.unstubAllGlobals())

describe('askQuestion', () => {
  it('posts the question and returns the answer', async () => {
    stubFetch(async () => new Response(JSON.stringify(good), { status: 200 }))
    await expect(askQuestion('q', 'r1', { baseUrl: 'https://api.test/' })).resolves.toMatchObject({ answered: true })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://api.test/ask')
    expect(JSON.parse(String(init?.body))).toEqual({ question: 'q', rotation_id: 'r1' })
  })

  it('fails when no service is configured', async () => {
    await expect(askQuestion('q', undefined, { baseUrl: '' })).rejects.toThrow(/not configured/)
  })

  it('fails on an error status', async () => {
    stubFetch(async () => new Response('{}', { status: 502 }))
    await expect(askQuestion('q', undefined, { baseUrl: 'https://api.test' })).rejects.toThrow(/502/)
  })

  it('fails on an unexpected body', async () => {
    stubFetch(async () => new Response('{"hello":1}', { status: 200 }))
    await expect(askQuestion('q', undefined, { baseUrl: 'https://api.test' })).rejects.toThrow(/unexpected/)
  })

  it('gives up when the service is too slow', async () => {
    stubFetch((_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))))
    await expect(askQuestion('q', undefined, { baseUrl: 'https://api.test', timeoutMs: 20 })).rejects.toThrow(/aborted/)
  })

  it('tells the daily cap apart from the per-visitor rate limit', async () => {
    stubFetch(async () => new Response(JSON.stringify({ error: { code: 'DAILY_LIMIT', message: 'x' } }), { status: 429 }))
    await expect(askQuestion('q', undefined, { baseUrl: 'https://api.test' })).rejects.toMatchObject({ kind: 'daily_limit' })
    stubFetch(async () => new Response(JSON.stringify({ error: 'too many requests' }), { status: 429 }))
    await expect(askQuestion('q', undefined, { baseUrl: 'https://api.test' })).rejects.toMatchObject({ kind: 'busy' })
  })

  it('reports a server error, a timeout and a missing service as unavailable', async () => {
    stubFetch(async () => new Response('not json', { status: 502 }))
    await expect(askQuestion('q', undefined, { baseUrl: 'https://api.test' })).rejects.toMatchObject({ kind: 'unavailable' })
    expect(failureFromStatus(400, null)).toBeInstanceOf(AskFailure)
    expect(failureFromStatus(400, null).kind).toBe('unavailable')
  })
})

describe('askQuestion about a place', () => {
  it('sends the place or the field with the question', async () => {
    const calls: RequestInit[] = []
    stubFetch(async (_url, init) => {
      calls.push(init as RequestInit)
      return new Response(JSON.stringify(good), { status: 200 })
    })
    await askQuestion('q', undefined, { baseUrl: 'https://api.test', context: { place: { lat: 38.5, lon: -98.8 } } })
    await askQuestion('q', undefined, { baseUrl: 'https://api.test', context: { zone: [[38.49, -98.81], [38.49, -98.79], [38.51, -98.79]] } })
    expect(JSON.parse(calls[0].body as string)).toEqual({ question: 'q', place: { lat: 38.5, lon: -98.8 } })
    expect(JSON.parse(calls[1].body as string).zone).toHaveLength(3)
  })
})
