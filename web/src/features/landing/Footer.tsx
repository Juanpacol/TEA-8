import { useI18n } from '../../shared/i18n/index.ts'
import './landing.css'

const SOURCES = [
  { name: 'NASA POWER', href: 'https://power.larc.nasa.gov/' },
  { name: 'NASA GIBS', href: 'https://gibs.earthdata.nasa.gov' },
  { name: 'USDA Soil Data Access', href: 'https://sdmdataaccess.nrcs.usda.gov/' },
  { name: 'USDA CropScape', href: 'https://nassgeodata.gmu.edu/CropScape/' },
]

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <p>
        {t('footer.data')}{' '}
        {SOURCES.map((source, index) => (
          <span key={source.name}>
            {index > 0 && ' · '}
            <a href={source.href}>{source.name}</a>
          </span>
        ))}
        .
      </p>
      <p>{t('footer.prototype')}</p>
    </footer>
  )
}
