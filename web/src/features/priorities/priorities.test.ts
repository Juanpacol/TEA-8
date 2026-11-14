import { describe, expect, it } from 'vitest'
import { PRIORITIES, orderTabs, viewOf } from './priorities.ts'

const tabs = ['year', 'why', 'field', 'compare', 'missing'].map((id) => ({ id }))

describe('priorities', () => {
  it('leaves the tabs alone when nothing is chosen', () => {
    expect(orderTabs(tabs, null)).toEqual(tabs)
  })

  it('moves the matching tab first and keeps the rest in order', () => {
    expect(orderTabs(tabs, 'soil').map((tab) => tab.id)).toEqual(['field', 'year', 'why', 'compare', 'missing'])
    expect(orderTabs(tabs, 'income').map((tab) => tab.id)).toEqual(['compare', 'year', 'why', 'field', 'missing'])
  })

  it('does not drop or duplicate a tab', () => {
    for (const priority of PRIORITIES) expect(orderTabs(tabs, priority)).toHaveLength(tabs.length)
  })

  it('says plainly that there is no data for income', () => {
    expect(viewOf('income').coverage).toBe('none')
  })
})
