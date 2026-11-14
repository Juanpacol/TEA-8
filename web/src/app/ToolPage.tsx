import { Footer } from '../features/landing/index.ts'
import { useData } from '../shared/hooks/useData.ts'
import { ToolSection } from './tool/ToolSection.tsx'

/** The tool on its own page: map, three rotations, evidence and questions. */
export function ToolPage() {
  const state = useData()

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-3)' }}>
      <p style={{ margin: 'var(--space-4) 0 var(--space-3)' }}>
        <a href="#/">&larr; TEA-8</a>
      </p>
      <ToolSection state={state} />
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Footer />
      </div>
    </main>
  )
}
