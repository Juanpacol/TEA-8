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

/** Why a question got no answer. `daily_limit` and `busy` are the service saying "not now"; the rest are failures. */
export type FailureKind = 'daily_limit' | 'busy' | 'unavailable'

export class AskFailure extends Error {
  readonly kind: FailureKind
  constructor(kind: FailureKind, message: string) {
    super(message)
    this.kind = kind
  }
}

/** Reads the service's refusal: 429 with the DAILY_LIMIT code is the daily cap, any other 429 is the per-visitor rate limit. */
export function failureFromStatus(status: number, body: unknown): AskFailure {
  if (status === 429) {
    const code = (body as { error?: { code?: unknown } } | null)?.error?.code
    return code === 'DAILY_LIMIT'
      ? new AskFailure('daily_limit', 'The daily limit of questions was reached')
      : new AskFailure('busy', 'Too many questions in a short time')
  }
  return new AskFailure('unavailable', `The question service answered ${status}`)
}

function isAskResponse(value: unknown): value is AskResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.answered === 'boolean' && typeof v.answer === 'string' && Array.isArray(v.claims)
}

/** Asks the API a question. Throws on any failure so the page can fall back to the pre-generated explanations. */
/** A question about a place or a field the person chose, instead of the case area. */
export type AskContext = { place: { lat: number; lon: number } } | { zone: [number, number][] }

export async function askQuestion(
  question: string,
  rotationId?: string,
  options: { baseUrl?: string; timeoutMs?: number; context?: AskContext } = {},
): Promise<AskResponse> {
  const baseUrl = options.baseUrl ?? (import.meta.env.VITE_API_URL as string | undefined)
  if (!baseUrl) throw new AskFailure('unavailable', 'The question service is not configured')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS)
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, rotation_id: rotationId, ...options.context }),
      signal: controller.signal,
    })
    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) throw failureFromStatus(response.status, body)
    if (!isAskResponse(body)) throw new AskFailure('unavailable', 'The question service sent an unexpected answer')
    return body
  } finally {
    clearTimeout(timer)
  }
}
