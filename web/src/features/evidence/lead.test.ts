import { describe, expect, it } from 'vitest'
import { splitLead } from './lead.ts'

describe('splitLead', () => {
  it('splits after the first sentence', () => {
    expect(splitLead('Rain was low. Soil was dry.')).toEqual({ lead: 'Rain was low.', rest: 'Soil was dry.' })
  })

  it('does not split inside numbers or abbreviations', () => {
    expect(splitLead('A model of 2.2 million field-years in the U.S. showed less risk.')).toEqual({
      lead: 'A model of 2.2 million field-years in the U.S. showed less risk.',
      rest: '',
    })
  })

  it('keeps a single sentence whole', () => {
    expect(splitLead('Nothing else.')).toEqual({ lead: 'Nothing else.', rest: '' })
  })
})
