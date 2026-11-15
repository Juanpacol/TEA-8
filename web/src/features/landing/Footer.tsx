import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

const SOURCES = [
  { name: 'NASA POWER', href: 'https://power.larc.nasa.gov/' },
  { name: 'NASA GIBS', href: 'https://gibs.earthdata.nasa.gov' },
  { name: 'USDA Soil Data Access', href: 'https://sdmdataaccess.nrcs.usda.gov/' },
  { name: 'USDA CropScape', href: 'https://nassgeodata.gmu.edu/CropScape/' },
  { name: 'USDA NASS QuickStats', href: 'https://quickstats.nass.usda.gov/' },
  { name: 'NASA SMAP', href: 'https://smap.jpl.nasa.gov/' },
  { name: 'US Drought Monitor', href: 'https://droughtmonitor.unl.edu/' },
]

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <p className="footer__sources">
        <span className="footer__label">{t('footer.data').replace(/:$/, '')}</span>
        {SOURCES.map((source) => (
          <a key={source.name} href={source.href}>
            {source.name}
          </a>
        ))}
      </p>
      <p className="footer__note">{t('footer.prototype')}</p>
    </footer>
  )
}
