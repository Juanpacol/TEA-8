import { Panel } from '../shared/components/index.ts'

export function App() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-5) var(--space-3)' }}>
      <h1 style={{ color: 'var(--accent)' }}>TEA-8</h1>
      <Panel title="Evidence before advice">
        <p style={{ color: 'var(--text-soft)', margin: 0 }}>
          A decision-support tool that compares crop rotations using NASA data.
        </p>
      </Panel>
    </main>
  )
}
