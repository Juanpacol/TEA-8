import { Button } from '../../shared/components/index.ts'
import type { DriestSummer } from './stats.ts'
import './landing.css'

export function Hero({ driest }: { driest: DriestSummer | null }) {
  return (
    <header className="hero">
      <p className="hero__name">TEA-8</p>
      <h1>TEA-8 doesn&rsquo;t tell farmers what to plant. It shows them what the data says.</h1>
      {driest && (
        <p className="hero__figure">
          In {driest.year}, summer root-zone soil wetness in McLean County, Illinois fell to{' '}
          {driest.wetness.toFixed(2)}, against an average of {driest.baselineMean.toFixed(2)} for 2001-2023 (NASA POWER).
        </p>
      )}
      <a href="#tool">
        <Button>Open the tool</Button>
      </a>
    </header>
  )
}
