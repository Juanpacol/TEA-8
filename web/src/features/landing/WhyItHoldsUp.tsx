import { useI18n } from '../../shared/i18n/index.ts'
import type { Proof } from './stats.ts'
import './landing.css'

const REPO = 'https://github.com/Juanpacol/TEA-8'

/** Why the page can be trusted. The first two cards quote figures computed from the data file; without them they say the same without numbers. */
export function WhyItHoldsUp({ proof }: { proof: Proof | null }) {
  const { t } = useI18n()
  const [before, after] = t('open.note', { link: '\u0000' }).split('\u0000')
  const cards = [
    {
      title: t('why.1.title'),
      text: proof?.drought
        ? t('why.1.text', { dry: proof.drought.dry, confirmed: proof.drought.confirmed }) +
          (proof.smap ? ' ' + t('why.1.smap', { r: proof.smap.r.toFixed(2), n: proof.smap.years }) : '')
        : t('why.1.plain'),
    },
    {
      title: t('why.2.title'),
      text: proof?.link ? t('why.2.text', { r: proof.link.r.toFixed(2), year: proof.link.year }) : t('why.2.plain'),
    },
    { title: t('why.3.title'), text: t('why.3.text') },
    { title: t('why.4.title'), text: t('why.4.text') },
  ]
  return (
    <section className="differentiators">
      <div className="differentiators__art" aria-hidden="true" />
      <h2>{t('why.title')}</h2>
      <div className="differentiators__grid">
        {cards.map((card) => (
          <div key={card.title} className="differentiators__card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
      <p className="open-source__note">
        {before}
        <a href={`${REPO}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING.md</a>
        {after}
      </p>
    </section>
  )
}
