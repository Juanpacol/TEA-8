import './landing.css'

const SOURCES = [
  { name: 'NASA POWER', href: 'https://power.larc.nasa.gov/', use: 'rainfall, temperature and root-zone wetness' },
  { name: 'NASA GIBS', href: 'https://gibs.earthdata.nasa.gov', use: 'dated satellite vegetation (NDVI) tiles' },
  { name: 'USDA Soil Data Access', href: 'https://sdmdataaccess.nrcs.usda.gov/', use: 'soil at each case point' },
  { name: 'USDA CropScape', href: 'https://nassgeodata.gmu.edu/CropScape/', use: 'crop grown each year' },
]
const REPO = 'https://github.com/Juanpacol/TEA-8'

export function Sources() {
  return (
    <section className="section">
      <h2>Sources and code</h2>
      <ul>
        {SOURCES.map((source) => (
          <li key={source.name}>
            <a href={source.href}>{source.name}</a>: {source.use}
          </li>
        ))}
      </ul>
      <p>
        The code is public: <a href={REPO}>{REPO}</a>. AI assistants helped write the code and the text; how and where is
        logged in <a href={`${REPO}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING.md</a>.
      </p>
    </section>
  )
}
