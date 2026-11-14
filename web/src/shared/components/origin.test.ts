import { describe, expect, it } from 'vitest'
import { translator } from '../i18n/index.ts'
import { originInfo } from './origin.ts'

const t = translator('en')

describe('originInfo', () => {
  it('labels every origin of the contract with a distinct name', () => {
    const origins = ['nasa_data', 'platform_calculation', 'model_text', 'citation', 'citation_to_verify'] as const
    const labels = origins.map((origin) => originInfo(t, origin).label)
    expect(new Set(labels).size).toBe(origins.length)
  })

  it('does not present an unread citation as a read one', () => {
    expect(originInfo(t, 'citation_to_verify').label).toMatch(/verify/i)
    expect(originInfo(t, 'citation').label).not.toBe(originInfo(t, 'citation_to_verify').label)
  })
})
