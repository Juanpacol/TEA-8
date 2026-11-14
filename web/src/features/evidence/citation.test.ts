import { describe, expect, it } from 'vitest'
import { splitCitation } from './citation.ts'

describe('splitCitation', () => {
  it('turns a URL inside parentheses into a link', () => {
    expect(splitCitation('Manski, "Title" (manuscript read at https://par.nsf.gov/x)')).toEqual([
      { kind: 'text', value: 'Manski, "Title" (manuscript read at ' },
      { kind: 'link', value: 'https://par.nsf.gov/x' },
      { kind: 'text', value: ')' },
    ])
  })

  it('leaves the final dot out of the link', () => {
    expect(splitCitation('See https://example.org/a.')).toEqual([
      { kind: 'text', value: 'See ' },
      { kind: 'link', value: 'https://example.org/a' },
      { kind: 'text', value: '.' },
    ])
  })

  it('keeps a citation without a URL as text', () => {
    expect(splitCitation('Soil survey, no link')).toEqual([{ kind: 'text', value: 'Soil survey, no link' }])
  })
})
