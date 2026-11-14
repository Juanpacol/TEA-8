import {
  CallToAction,
  Connector,
  Demo,
  Footer,
  FooterConnector,
  Hero,
  HowItWorks,
  Intro,
  OpenSource,
  Problem,
  Reveal,
  WhyItHoldsUp,
  WontTell,
  driestSummer,
} from '../features/landing/index.ts'
import { useData } from '../shared/hooks/useData.ts'
import { useRoute } from '../shared/hooks/useRoute.ts'
import { useSmoothScroll } from '../shared/hooks/useSmoothScroll.ts'
import { ToolPage } from './ToolPage.tsx'

function Landing() {
  const state = useData()
  useSmoothScroll()

  return (
    <>
      <Hero />
      <Intro driest={state.status === 'ready' ? driestSummer(state.data.seasons, state.data.dry_summer_rule?.baseline) : null} />
      <Connector>
        <Reveal>
          <Problem />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
      </Connector>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '0 var(--space-3)' }}>
        <Reveal>
          <WontTell />
        </Reveal>
        <Reveal>
          <Demo />
        </Reveal>
        <Reveal>
          <OpenSource />
        </Reveal>
      </main>
      <FooterConnector>
        <Reveal>
          <WhyItHoldsUp />
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
  return useRoute() === 'tool' ? <ToolPage /> : <Landing />
}
