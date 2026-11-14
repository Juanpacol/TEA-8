import type { Origin } from './data-types.ts'

export type Check = { name: string; passed: boolean }

export type Claim = {
  text: string
  evidence_keys: string[]
  origins: Origin[]
  citations: string[]
  checks: Check[]
  verified: boolean
}

export type AskResponse = {
  answered: boolean
  answer: string
  claims: Claim[]
  notice: string
}

const TIMEOUT_MS = 25_000

function isAskResponse(value: unknown): value is AskResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.answered === 'boolean' && typeof v.answer === 'string' && Array.isArray(v.claims)
}

/** Asks the API a question. Throws on any failure so the page can fall back to the pre-generated explanations. */
export async function askQuestion(
  question: string,
  rotationId?: string,
  options: { baseUrl?: string; timeoutMs?: number } = {},
): Promise<AskResponse> {
  const baseUrl = options.baseUrl ?? (import.meta.env.VITE_API_URL as string | undefined)
  if (!baseUrl) throw new Error('The question service is not configured')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS)
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, rotation_id: rotationId }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`The question service answered ${response.status}`)
    const body: unknown = await response.json()
    if (!isAskResponse(body)) throw new Error('The question service sent an unexpected answer')
    return body
  } finally {
    clearTimeout(timer)
  }
}
