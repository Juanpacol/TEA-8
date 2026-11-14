import {
  CallToAction,
  Footer,
  Hero,
  HowItWorks,
  Problem,
  Sources,
  WhyItHoldsUp,
  WontTell,
  driestSummer,
} from '../features/landing/index.ts'
import { useData } from '../shared/hooks/useData.ts'
import { ToolSection } from './tool/ToolSection.tsx'

export function App() {
  const state = useData()

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '0 var(--space-3)' }}>
      <Hero driest={state.status === 'ready' ? driestSummer(state.data.seasons) : null} />
      <Problem />
      <HowItWorks />
      <WontTell />
      <ToolSection state={state} />
      <Sources />
      <WhyItHoldsUp />
      <CallToAction />
      <Footer />
    </main>
  )
}
