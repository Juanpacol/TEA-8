import { describe, expect, it } from 'vitest'
import { baselineRange } from './baseline.ts'

describe('baselineRange', () => {
  it('reads a written range', () => expect(baselineRange('2001-2023')).toEqual([2001, 2023]))
  it('gives null for anything else', () => {
    expect(baselineRange('since forever')).toBeNull()
    expect(baselineRange(undefined)).toBeNull()
  })
})
