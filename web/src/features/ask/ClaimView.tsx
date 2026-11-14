import { OriginLabel } from '../evidence/index.ts'
import type { Claim } from '../../shared/lib/askApi.ts'
import './ask.css'

const CHECK_NAMES: Record<string, string> = {
  cites_evidence: 'Cites evidence',
  keys_exist: 'Every cited item exists in the data',
  numbers_match: 'Every number matches the cited data',
}

/** One claim of an answer: its status, its origins and the checks that decided it. */
export function ClaimView({ claim }: { claim: Claim }) {
  return (
    <li className={`claim ${claim.verified ? 'claim--verified' : 'claim--unverified'}`}>
      <span className="claim__status">{claim.verified ? 'Checked against the data' : 'Not verified'}</span>{' '}
      {claim.origins.map((origin) => (
        <OriginLabel key={origin} origin={origin} />
      ))}
      <p className="claim__text">{claim.text}</p>
      <details className="claim__checks">
        <summary>How this was checked</summary>
        <ul>
          {claim.checks.map((check) => (
            <li key={check.name}>
              {check.passed ? '✓' : '✗'} {CHECK_NAMES[check.name] ?? check.name}
            </li>
          ))}
        </ul>
        {claim.evidence_keys.length > 0 && <p>Cited: {claim.evidence_keys.join(', ')}</p>}
        {claim.citations.map((citation) => (
          <p key={citation}>Source: {citation}</p>
        ))}
      </details>
    </li>
  )
}
