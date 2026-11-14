import { ORIGIN_ORDER, OriginLabel, originInfo } from '../../shared/components/index.ts'
import './evidence.css'

/** What each origin label means, so a reader can weigh a sentence by where it comes from. */
export function OriginKey() {
  return (
    <details className="origin-key">
      <summary>What the labels mean</summary>
      <dl>
        {ORIGIN_ORDER.map((origin) => (
          <div key={origin} className="origin-key__row">
            <dt>
              <OriginLabel origin={origin} />
            </dt>
            <dd>{originInfo(origin).description}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
