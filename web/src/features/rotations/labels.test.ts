import { describe, expect, it } from 'vitest'
import { plural, rotationName } from './labels.ts'
import { capitalize, translator } from '../../shared/i18n/index.ts'
const t = translator('en')

describe('plural', () => {
  it('uses the singular only for one', () => {
    expect(plural(1, 'risk', 'risks')).toBe('1 risk')
    expect(plural(0, 'risk', 'risks')).toBe('0 risks')
    expect(plural(4, 'risk', 'risks')).toBe('4 risks')
  })
})

describe('rotationName', () => {
  it('names a rotation by its crops in order', () => {
    expect(rotationName(t, { sequence: ['corn', 'soybeans'] })).toBe('Corn + soybeans')
    expect(rotationName(t, { sequence: ['corn', 'soybeans', 'small grain'] })).toBe('Corn + soybeans + small grain')
  })
})

describe('capitalize', () => {
  it('capitalizes only the first letter', () => {
    expect(capitalize('small grain')).toBe('Small grain')
    expect(capitalize('')).toBe('')
  })
})
