import './evidence.css'

type Props = { limits: string[] }

/** What the data cannot tell the farmer. */
export function Limits({ limits }: Props) {
  return (
    <ul className="limits">
      {limits.map((limit) => (
        <li key={limit}>{limit}</li>
      ))}
    </ul>
  )
}

/** Shown outside the tabs whenever the data file is simulated, so it can never be missed. */
export function SimulatedNotice() {
  return <p className="limits__simulated">This file holds simulated data.</p>
}
