import { afterEach, describe, expect, it, vi } from 'vitest'
import { askQuestion } from './askApi.ts'

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
})
