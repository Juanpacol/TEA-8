import { describe, expect, it } from 'vitest'
import { routeFromHash } from '../../shared/lib/route.ts'
import { linkFor, sharedFromHash } from './share.ts'

const field = [
  { lat: 38.49, lon: -98.81 },
  { lat: 38.49, lon: -98.79 },
  { lat: 38.51, lon: -98.79 },
]

describe('shared links', () => {
  it('a place link reopens the same place on the tool page', () => {
    const link = linkFor({ place: { lat: 38.5, lon: -98.8 } }, 'https://tea-8.vercel.app/')
    expect(link).toBe('https://tea-8.vercel.app/#/tool?place=38.50000,-98.80000')
    const hash = link.slice(link.indexOf('#'))
    expect(routeFromHash(hash)).toBe('tool')
    expect(sharedFromHash(hash)).toEqual({ place: { lat: 38.5, lon: -98.8 } })
  })

  it('a field link reopens the same corners', () => {
    const link = linkFor({ zone: field }, 'https://tea-8.vercel.app/')
    expect(sharedFromHash(link.slice(link.indexOf('#')))).toEqual({ zone: field })
  })

  it('a broken link opens the tool as usual', () => {
    expect(sharedFromHash('#/tool')).toBeNull()
    expect(sharedFromHash('#/tool?place=abc')).toBeNull()
    expect(sharedFromHash('#/tool?place=95,-88')).toBeNull()
    expect(sharedFromHash('#/tool?zone=1,2;3,4')).toBeNull()
    expect(sharedFromHash('#/tool?other=1')).toBeNull()
  })
})
