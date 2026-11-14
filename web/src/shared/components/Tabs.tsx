import { useId, useState, type ReactNode } from 'react'
import { Segmented } from './Segmented.tsx'
import './tabs.css'

export type Tab = { id: string; label: string; content: ReactNode }

/** Tabs that keep one panel on screen at a time. Every panel stays mounted, so typed text is not lost. */
export function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')
  const base = useId()
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]

  return (
    <div className="tabs">
      <Segmented
        kind="tab"
        label={label}
        options={tabs.map(({ id, label: text }) => ({ id, label: text }))}
        value={current.id}
        onChange={setActive}
        idFor={(id) => `${base}-tab-${id}`}
        controls={`${base}-panel`}
      />
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={tab.id === current.id ? `${base}-panel` : undefined}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={tab.id !== current.id}
          className="tabs__panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
