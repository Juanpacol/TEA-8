import { describe, expect, it } from 'vitest'
import { plural } from './labels.ts'

describe('plural', () => {
  it('uses the singular only for one', () => {
    expect(plural(1, 'risk', 'risks')).toBe('1 risk')
    expect(plural(0, 'risk', 'risks')).toBe('0 risks')
    expect(plural(4, 'risk', 'risks')).toBe('4 risks')
  })
})
