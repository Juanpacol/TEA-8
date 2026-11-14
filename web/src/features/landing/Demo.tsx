import { Button } from '../../shared/components/index.ts'
import './landing.css'

/** A silent looping clip of the tool in a window frame, with the way into the real tool. */
export function Demo() {
  return (
    <section className="demo">
      <h2>See it in action</h2>
      <div className="demo__frame">
        <div className="demo__bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <video
          className="demo__video"
          src={`${import.meta.env.BASE_URL}demo/tea8-demo.mp4`}
          poster={`${import.meta.env.BASE_URL}demo/tea8-demo-poster.webp`}
          aria-label="Silent clip of the tool: change the year on the map, pick a rotation, read its evidence and ask a question"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      </div>
      <p className="demo__note">A prototype built for the NASA Space Apps Challenge, not agronomic advice.</p>
      <a href="#/tool">
        <Button>Open the tool</Button>
      </a>
    </section>
  )
}
