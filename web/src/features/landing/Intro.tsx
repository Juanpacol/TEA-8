import { Button } from '../../shared/components/index.ts'
import { useReveal } from '../../shared/hooks/useReveal.ts'
import type { DriestSummer } from './stats.ts'
import './landing.css'

export function Intro({ driest }: { driest: DriestSummer | null }) {
  const { ref, visible } = useReveal<HTMLElement>()

  return (
    <section id="intro" ref={ref} className={`intro reveal${visible ? ' reveal--visible' : ''}`}>
      <div className="intro__inner">
        <h2>TEA-8 doesn&rsquo;t tell farmers what to plant. It shows them what the data says.</h2>
        {driest && (
          <p className="intro__figure">
            In {driest.year}, summer root-zone soil wetness in McLean County, Illinois fell to{' '}
            {driest.wetness.toFixed(2)}, against an average of {driest.baselineMean.toFixed(2)} for 2001-2023 (NASA POWER).
          </p>
        )}
        <a href="#tool">
          <Button>Open the tool</Button>
        </a>
      </div>
    </section>
  )
}
