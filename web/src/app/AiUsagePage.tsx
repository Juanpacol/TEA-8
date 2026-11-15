import { Footer, FooterConnector, Reveal } from '../features/landing/index.ts'

const REPO = 'https://github.com/Juanpacol/TEA-8'

const USES = [
  [
    'While building: Claude',
    'An AI assistant helped with research on the challenge and sources, tests of the data APIs, text drafts, the folder structure and parts of the code. Nothing it wrote was used without review.',
  ],
  [
    'While answering: Muse Spark',
    'The language model of the Meta Model API answers the questions typed in the tool, through a small service. Code checks each claim against the data.',
  ],
]

const STACK = [
  ['Data', 'Python: xarray, rasterio, pandas', 'No AI'],
  ['NASA and USDA', 'POWER, GIBS (MODIS NDVI), Soil Data Access, CropScape', 'No AI'],
  ['Rotation rules', 'Our own table of about 6 crops, with cited sources', 'No AI'],
  ['Interface', 'React with Vite, Leaflet map', 'No AI'],
  ['Questions', 'Muse Spark through a Cloud Run service, key in Secret Manager', 'AI'],
  ['Hosting', 'Vercel for the page, Google Cloud Run for the service', 'No AI'],
]

const CHECKS = [
  ['The numbers come from data', 'NASA and USDA data and our own calculations, never from the model.'],
  ['The model only words it', 'Code checks each claim in the answer against the data.'],
  ['Every sentence has a label', 'NASA data, a calculation, AI text or a citation.'],
  ['A fallback is ready', 'If the service is down, pre-generated explanations take its place.'],
]

const RULES = [
  'The idea for the solution is the team’s. AI was support, not the source of the idea.',
  'Whatever an AI tool generates is reviewed and understood before use.',
  'The person who signs the project answers for it.',
  'No NASA branding is generated or modified.',
  'An image made with an AI tool carries a visible watermark.',
  'The answers support the farmer’s judgment; they do not replace it.',
]

/** How AI was used in this project, laid out like the reference page: big cut-outs, a stat, numbered steps. */
export function AiUsagePage() {
  return (
    <>
      <main className="ai-page" style={{ maxWidth: 820, margin: '0 auto', padding: '0 var(--space-3)' }}>
        <p style={{ margin: 'var(--space-4) 0 var(--space-3)' }}>
          <a href="#/">&larr; TEA-8</a>
        </p>

        <section className="ai-hero">
          <div className="ai-hero__art ai-hero__art--farmer" aria-hidden="true" />
          <div className="ai-hero__art ai-hero__art--field" aria-hidden="true" />
          <div className="ai-intro">
            <h1>How we use AI</h1>
            <p>
              The idea is ours: compare crop rotations with NASA data. AI tools helped us build it and answer questions,
              and this page says where, and where it does not.
            </p>
          </div>
        </section>

        <Reveal>
          <section className="ai-stat">
            <div className="ai-stat__art" aria-hidden="true" />
            <h2>1 of 6</h2>
            <p className="ai-stat__sub">layers use AI.</p>
            <ul className="ai-dots" aria-label="The six layers of TEA-8, one of them uses AI">
              {STACK.map(([layer, , tag]) => (
                <li key={layer} className={tag === 'AI' ? 'ai-dots__item ai-dots__item--lit' : 'ai-dots__item'}>
                  {layer}
                </li>
              ))}
            </ul>
            <p className="ai-stat__lead">
              The AI words the answer &mdash; it never supplies a number. Code checks every claim against the data.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="ai-open ai-bleed">
            <div className="ai-bleed__art ai-bleed__art--orbit" aria-hidden="true" />
            <h2>Two uses, kept apart</h2>
            <ol className="ai-numbered">
              {USES.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <section className="ai-open">
            <h2>What it is built with</h2>
            <p className="section__note">AI touches one layer. The rest is data and our own code.</p>
            <ul className="stack">
              {STACK.map(([layer, tech, tag]) => (
                <li key={layer}>
                  <span className="stack__layer">{layer}</span>
                  <span className="stack__tech">{tech}</span>
                  <span className={`stack__tag${tag === 'AI' ? ' stack__tag--ai' : ''}`}>{tag}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="ai-open ai-bleed ai-bleed--contain">
            <div className="ai-bleed__art ai-bleed__art--checks" aria-hidden="true" />
            <h2>How an answer is checked</h2>
            <ol className="ai-numbered">
              {CHECKS.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      </main>

      <FooterConnector>
        <div className="ai-bleed ai-bleed--contain ai-bleed--tail">
          <div className="ai-bleed__art ai-bleed__art--tail" aria-hidden="true" />
          <Reveal>
            <section className="ai-open">
              <h2>Our rules</h2>
              <ul className="checklist">
                {RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section className="ai-open ai-open--end">
              <h2>The full log</h2>
              <p>Every tool, what it was used for and where it shows is logged in the repository, with the sources we used.</p>
              <a className="outline-link" href={`${REPO}/blob/main/CONTRIBUTING.md`}>
                Read the log
              </a>
            </section>
          </Reveal>
        </div>

        <Footer />
      </FooterConnector>
    </>
  )
}
