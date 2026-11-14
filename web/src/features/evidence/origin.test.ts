import { describe, expect, it } from 'vitest'
import { originInfo } from './origin.ts'

describe('originInfo', () => {
  it('labels every origin of the contract with a distinct name', () => {
    const origins = ['nasa_data', 'platform_calculation', 'model_text', 'citation', 'citation_to_verify'] as const
    const labels = origins.map((origin) => originInfo(origin).label)
    expect(new Set(labels).size).toBe(origins.length)
  })

  it('does not present an unread citation as a read one', () => {
    expect(originInfo('citation_to_verify').label).toMatch(/verify/i)
    expect(originInfo('citation').label).not.toBe(originInfo('citation_to_verify').label)
  })
})
