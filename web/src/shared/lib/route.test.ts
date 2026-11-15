import { describe, expect, it } from 'vitest'
import { routeFromHash } from './route.ts'

describe('routeFromHash', () => {
  it('opens the tool page at #/tool', () => {
    expect(routeFromHash('#/tool')).toBe('tool')
  })

  it('opens the AI statement page at #/ai', () => {
    expect(routeFromHash('#/ai')).toBe('ai')
  })

  it('stays on the landing page for an empty hash, #/ and in-page anchors', () => {
    expect(routeFromHash('')).toBe('landing')
    expect(routeFromHash('#/')).toBe('landing')
    expect(routeFromHash('#intro')).toBe('landing')
  })
})
