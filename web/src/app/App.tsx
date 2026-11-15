import { Suspense, lazy } from 'react'
import {
  CallToAction,
  Connector,
  Footer,
  FooterConnector,
  Hero,
  HowItWorks,
  Intro,
  Reveal,
  WhyItHoldsUp,
  WhyMclean,
  WontTell,
  cornYearBars,
  driestSummer,
  mcleanStory,
  proofFigures,
} from '../features/landing/index.ts'
import { useData } from '../shared/hooks/useData.ts'
import { useRoute } from '../shared/hooks/useRoute.ts'
import { AiUsagePage } from './AiUsagePage.tsx'
// The tool (map, soil zones) loads only when someone opens it, so the landing stays light.
const ToolPage = lazy(() => import('./ToolPage.tsx').then((module) => ({ default: module.ToolPage })))

function Landing() {
  const state = useData()

  return (
    <>
      <Hero />
      <Intro
        driest={state.status === 'ready' ? driestSummer(state.data.seasons, state.data.dry_summer_rule?.baseline) : null}
        bars={state.status === 'ready' ? cornYearBars(state.data) : []}
      />
      <Connector>
        <Reveal>
          <WhyMclean story={state.status === 'ready' ? mcleanStory(state.data) : null} />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
      </Connector>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '0 var(--space-3)' }}>
        <Reveal>
          <WontTell />
        </Reveal>
      </main>
      <FooterConnector>
        <Reveal>
          <WhyItHoldsUp proof={state.status === 'ready' ? proofFigures(state.data) : null} />
        </Reveal>
        <Reveal>
          <CallToAction />
        </Reveal>
        <Footer />
      </FooterConnector>
    </>
  )
}

export function App() {
  const route = useRoute()
  if (route === 'tool') {
    return (
      <Suspense fallback={null}>
        <ToolPage />
      </Suspense>
    )
  }
  if (route === 'ai') return <AiUsagePage />
  return <Landing />
}
