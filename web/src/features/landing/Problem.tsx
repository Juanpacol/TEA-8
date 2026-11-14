import './landing.css'

export function Problem() {
  return (
    <section className="section">
      <h2>The problem</h2>
      <p className="section__big">About 91%</p>
      <p>
        of year-to-year changes in the McLean County fields we sampled were corn becoming soybeans or soybeans becoming
        corn. A region with two alternating crops has few options when a dry summer arrives.
      </p>
      <p className="section__note">
        Source: CropScape, 23 cropland fields out of 30 random points, 2008 to 2023. A sample, not a census.
      </p>
    </section>
  )
}
