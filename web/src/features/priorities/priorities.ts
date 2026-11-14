// What a farmer's priority changes: which tab opens first, and an honest note on what the data can say about it.
// It never ranks or scores the rotations.
import type { MessageKey } from '../../shared/i18n/index.ts'

export type Priority = 'water' | 'income' | 'soil'

export const PRIORITIES: Priority[] = ['water', 'soil', 'income']

export type PriorityView = {
  /** Tab that opens first for this priority. */
  firstTab: string
  /** `data`: the tool has figures for it. `partial`: some, with a gap. `none`: no data. */
  coverage: 'data' | 'partial' | 'none'
  label: MessageKey
  note: MessageKey
}

const VIEWS: Record<Priority, PriorityView> = {
  water: { firstTab: 'year', coverage: 'partial', label: 'priority.water', note: 'priority.water.note' },
  soil: { firstTab: 'field', coverage: 'partial', label: 'priority.soil', note: 'priority.soil.note' },
  income: { firstTab: 'compare', coverage: 'none', label: 'priority.income', note: 'priority.income.note' },
}

export function viewOf(priority: Priority): PriorityView {
  return VIEWS[priority]
}

/** Puts the tab for the priority first and leaves the others in their order. With no priority, nothing moves. */
export function orderTabs<T extends { id: string }>(tabs: T[], priority: Priority | null): T[] {
  if (priority === null) return tabs
  const first = VIEWS[priority].firstTab
  return [...tabs.filter((tab) => tab.id === first), ...tabs.filter((tab) => tab.id !== first)]
}
