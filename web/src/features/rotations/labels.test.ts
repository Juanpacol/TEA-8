import { describe, expect, it } from 'vitest'
import { plural, shortLabel } from './labels.ts'

describe('plural', () => {
  it('uses the singular only for one', () => {
    expect(plural(1, 'risk', 'risks')).toBe('1 risk')
    expect(plural(0, 'risk', 'risks')).toBe('0 risks')
    expect(plural(4, 'risk', 'risks')).toBe('4 risks')
  })
})

describe('shortLabel', () => {
  it('names the current rotation and the cycle length of an alternative', () => {
    expect(shortLabel({ isCurrent: true, sequence: ['corn', 'soybeans'] })).toBe('Current')
    expect(shortLabel({ isCurrent: false, sequence: ['corn', 'soybeans', 'small grain'] })).toBe('3-year')
    expect(shortLabel({ isCurrent: false, sequence: ['a', 'b', 'c', 'd'] })).toBe('4-year')
  })
})
