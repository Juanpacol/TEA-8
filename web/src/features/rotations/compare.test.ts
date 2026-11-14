import { describe, expect, it } from 'vitest'
import { compareRotations } from './compare.ts'
import { addedCrops, isSourceRead, isSourceToVerify, type Rotation } from './rules.ts'

function rotation(id: string, sequence: Rotation['sequence'], overrides: Partial<Rotation> = {}): Rotation {
  return {
    id,
    name: id,
    is_current: false,
    hypothetical: true,
    sequence,
    rules: [],
    explanation: { why: [], evidence: [], gaps: [], risks: [] },
    ...overrides,
  }
}

const current = rotation('current', ['corn', 'soybeans'], { is_current: true, hypothetical: false })
const three = rotation('three', ['corn', 'soybeans', 'small grain'], {
  rules: [
    { id: 'a', text: 'read', origin: 'citation', citation: 'x' },
    { id: 'b', text: 'unread', origin: 'citation_to_verify', citation: 'y' },
    { id: 'c', text: 'ours', origin: 'platform_calculation' },
  ],
  explanation: {
    why: [],
    evidence: [],
    gaps: [{ text: 'g', origin: 'platform_calculation' }],
    risks: [
      { text: 'r1', origin: 'platform_calculation' },
      { text: 'r2', origin: 'platform_calculation' },
    ],
  },
})

describe('rules', () => {
  it('tells a source that was read from one still to verify', () => {
    expect(isSourceRead('citation')).toBe(true)
    expect(isSourceRead('citation_to_verify')).toBe(false)
    expect(isSourceToVerify('citation_to_verify')).toBe(true)
    expect(isSourceToVerify('nasa_data')).toBe(false)
  })

  it('finds only the crops the reference does not grow', () => {
    expect(addedCrops(three, current)).toEqual(['small grain'])
    expect(addedCrops(current, current)).toEqual([])
  })
})

describe('compareRotations', () => {
  const [base, alternative] = compareRotations([current, three])

  it('keeps the current rotation as the reference, with nothing added', () => {
    expect(base).toMatchObject({ isCurrent: true, hypothetical: false, addedCrops: [] })
  })

  it('counts sources and notes of an alternative', () => {
    expect(alternative).toMatchObject({
      addedCrops: ['small grain'],
      sourcesRead: 1,
      sourcesToVerify: 1,
      gaps: 1,
      risks: 2,
    })
  })

  it('does not score or rank', () => {
    expect(Object.keys(alternative)).not.toContain('score')
    expect(compareRotations([three, current]).map((r) => r.id)).toEqual(['three', 'current'])
  })

  it('works without a current rotation', () => {
    expect(compareRotations([three])[0].addedCrops).toEqual([])
  })
})
