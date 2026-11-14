import {
  CallToAction,
  Connector,
  Footer,
  FooterConnector,
  Hero,
  HowItWorks,
  Intro,
  Problem,
  Reveal,
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
    <>
      <Hero />
      <Intro driest={state.status === 'ready' ? driestSummer(state.data.seasons) : null} />
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
        <ToolSection state={state} />
        <Reveal>
          <Sources />
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
