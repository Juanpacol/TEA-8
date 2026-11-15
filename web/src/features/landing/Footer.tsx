import './landing.css'

const SOURCES = [
  { name: 'NASA POWER', href: 'https://power.larc.nasa.gov/' },
  { name: 'NASA GIBS', href: 'https://gibs.earthdata.nasa.gov' },
  { name: 'USDA Soil Data Access', href: 'https://sdmdataaccess.nrcs.usda.gov/' },
  { name: 'USDA CropScape', href: 'https://nassgeodata.gmu.edu/CropScape/' },
]

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__sources">
        <span className="footer__label">Data</span>
        {SOURCES.map((source) => (
          <a key={source.name} href={source.href}>
            {source.name}
          </a>
        ))}
      </p>
      <p className="footer__note">A prototype created for the NASA Space Apps Challenge, not agronomic advice.</p>
    </footer>
  )
}
