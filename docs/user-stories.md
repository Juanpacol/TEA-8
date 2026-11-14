# User stories

The first set of stories, split by layer so that three git worktrees can work in parallel. This set builds the skeleton of the application. More stories will be added as the remaining parts are defined.

Related: [hackathon-requirements.md](hackathon-requirements.md), [landing-page.md](landing-page.md), [../CONTRIBUTING.md](../CONTRIBUTING.md).

## Deployment architecture

| Platform | Role |
|---|---|
| Vercel | Hosts `web/`. Production from `main`, one preview per pull request |
| Google Cloud Run | Hosts `api/`, a small service that receives a question, calls the AI API and returns the answer |
| Google Secret Manager | Holds the AI API key |
| GitHub Actions | Verifies every pull request and deploys the backend on merge |

The AI answers come from an external API, not from a local model. Which API is still undecided. Render is not used.

## Before the worktrees start

Two stories must be merged into `main` first, because all three layers depend on them:

1. **DEP-1**, the `web/` skeleton.
2. **BE-1**, the data contract with a sample file.

With the sample file, the frontend can advance without waiting for real data.

## Deployment status

Updated November 14, 2026.

| Story | Status |
|---|---|
| DEP-1 to DEP-9 | Done |
| DEP-10 Web connected to the backend | Configured (`VITE_API_URL` in Vercel). The question box and the fallback were not tested in a browser |
| DEP-11 Verification on every pull request | Done: web, api and pipeline jobs. Making them required on `main` is a repository setting |
| DEP-12 Public access verified | Pending: FortiGuard request and a private-window check |

## Deployment layer

### Web (Vercel)

**DEP-1. Deployable skeleton**
As a developer, I want a minimal Vite app in `web/` so there is something to deploy from day one.
- `npm run build` finishes without errors.
- The page shows the name TEA-8.

**DEP-2. Production on Vercel**
As a developer, I want every merge into `main` to publish the web app on its own.
- The Vercel project is connected to the repository with `web/` as the root directory.
- A merge into `main` updates the public URL with no manual steps.

**DEP-3. Preview per pull request**
As a developer, I want a test URL for each pull request so I can review before merging.
- Each pull request receives its preview URL.

### Backend (Google Cloud)

**DEP-4. Google Cloud project ready**
As the project owner, I want the cloud project prepared and its cost bounded.
- Project created, billing enabled, APIs enabled (Cloud Run, Artifact Registry, Secret Manager).
- A budget alert is configured and a notification arrives when the limit is passed.

**DEP-5. Minimal service on Cloud Run**
As a developer, I want a minimal `api/` service running so the deployment path is proven early.
- `/health` responds 200.
- The Cloud Run URL responds from outside.

**DEP-6. Continuous deployment of the backend**
As a developer, I want backend changes deployed on merge.
- A merge into `main` with changes in `api/` deploys a new revision with no manual steps.

**DEP-7. Authentication without keys in the repository**
As the project owner, I want GitHub to authenticate with Google without stored credential files.
- GitHub Actions uses Workload Identity Federation.
- No Google secret is stored in GitHub.

**DEP-8. AI API key in Secret Manager**
As the project owner, I want the AI key kept out of the code.
- The service reads the key at runtime.
- The key is not in the code, in a versioned `.env`, or in the web app.

**DEP-9. Protected endpoint**
As the project owner, I want the public endpoint protected, because each call costs money.
- CORS allows only the Vercel domain.
- There is a request limit per visitor.
- There is a cap on maximum instances.

### Integration and quality

**DEP-10. Web connected to the backend**
As a user, I want the page to keep working when the backend fails.
- `VITE_API_URL` is set per environment in Vercel.
- The web app calls the real backend.
- If the backend fails or is slow, the page shows the pre-generated explanations.

**DEP-11. Verification on every pull request**
As a developer, I want a pull request with errors to be unmergeable.
- GitHub Actions runs lint, type check, tests and build for `web/` and `api/`.
- The protection on `main` requires the check to pass.

**DEP-12. Public access verified**
As a judge, I want to open the site without an account or password.
- The URL opens in a private window.
- The FortiGuard web filter classification was requested.

Order: DEP-1, 2, 3, then DEP-4, 5, then DEP-7, 6, then DEP-8, 9, then DEP-10, 11, then DEP-12.

## Backend and data layer (`pipeline/` and `api/`)

**BE-1. Data contract**
As a developer, I want a JSON schema shared by the pipeline and the web app.
- The schema lives in `pipeline/schema/`.
- A sample file lives in `web/public/data/`, labeled as simulated.
- The sample validates against the schema.

**BE-2. McLean climate**
As a developer, I want NASA POWER data (rainfall, temperature, root-zone wetness) downloaded for the case points.
- The output reproduces the figures in the README (2012 summer root wetness: 0.51).

**BE-3. Crops and soil**
As a developer, I want the CropScape history and the USDA soil data for points A and B.
- The output matches what was verified in the README.

**BE-4. Summary**
As a developer, I want summer deviations computed and the final JSON written.
- The output validates against the schema.
- Every figure carries its source, parameter and query date.

**BE-5. Rotation rules**
As a farmer, I want each rotation backed by sources I can check.
- A crop table and three rotations exist, each rule with a source.
- No rule relies on a source that has not been opened and read.
- Blocked until the agronomic sources are verified.

**BE-6. Pre-generated explanations**
As a farmer, I want each rotation explained: why, evidence, gaps and risks.
- Explanations are generated from templates before the demo.
- Every sentence carries its origin label.

**BE-7. `/ask` endpoint**
As a farmer, I want to ask a question and get an answer grounded in the project data.
- The answer cites its origin.
- It says it does not know when there is no data.
- The request and response contract is documented.

## Frontend layer (`web/`)

**FE-1. Visual base**
As a developer, I want the palette as variables and shared components (button, panel, card).

**FE-2. Data loading**
As a developer, I want types derived from the schema and a loader in `shared/lib`.
- It works with the sample file from BE-1.

**FE-3. Map**
As a farmer, I want to see satellite vegetation images of the area by year.
- Leaflet shows the NASA GIBS NDVI layer.
- Changing the year changes the image.

**FE-4. Rotations**
As a farmer, I want three rotations side by side, including the current one.
- Three cards are shown.
- The rules live in `rules.ts` and `compare.ts`, have tests and do not import React.

**FE-5. Evidence panel**
As a farmer, I want to see why a rotation is suggested, its evidence, gaps and risks.
- Every sentence shows its origin label.

**FE-6. Notice and limits**
As a farmer, I want to know what the tool cannot tell me.
- A fixed notice says the tool supports and does not replace local expertise.
- The data limits are visible.

**FE-7. Landing**
As a visitor, I want to understand the project before using the tool.
- The sections in [landing-page.md](landing-page.md) are built.

**FE-8. Questions to the AI**
As a farmer, I want to ask a question from the page.
- The question box is connected to `/ask`.
- If the call fails or is slow, the pre-generated explanations are shown.

**FE-9. Farmer priorities (optional)**
As a farmer, I want to choose what matters most to me: water, income or soil.

## Frontend, second set

Updated November 14, 2026. FE-1 to FE-8 are merged: the landing has its eight sections as plain text and the tool has the map, the rotation cards, the evidence panel, the question box and the limits. They were read in the code and seen rendered, not exercised in a browser. FE-9 is not started.

This set finishes the frontend. It is split in two groups so that two worktrees can work at the same time without touching the same files.

### Landing (`web/src/features/landing/`)

**LP-1. Page look**
As a visitor, I want the page to look like one finished product.
- The visual decision in [landing-page.md](landing-page.md) (light page, tool in a dark panel) is applied or replaced, and the document says which.
- A serif face for headlines, a condensed face for labels and a text face for reading are loaded locally, not from an external server.
- Colors and fonts come from `styles/tokens.css`.

**LP-2. Hero**
As a visitor, I want to understand in one screen what TEA-8 does.
- Headline, the 2012 figure computed from the data file, and the "Open the tool" button that scrolls to the tool.
- One or two images with a feathered edge.
- The text stays readable over the images at every width.

**LP-3. The problem**
As a visitor, I want the problem stated with one real number.
- The 91% figure is large, with its source and the note that it is a sample.

**LP-4. How it works and what it won't tell you**
As a visitor, I want the four steps and the limits before I use the tool.
- Four numbered steps, numbers at low opacity.
- The limits as a checked list. Each line is true in the deployed product.

**LP-5. Sources, code and AI statement**
As a judge, I want to check where the data and the code come from.
- Links to NASA POWER, NASA GIBS, USDA Soil Data Access and CropScape.
- Link to the public repository.
- One line on the use of AI, linked to CONTRIBUTING, naming the model that answers questions.

**LP-6. Why it holds up**
As a judge, I want each claim backed by something I can see in the tool.
- Every point is true in the deployed product. "Doesn't need a server to run" is corrected: the question box uses a server, the rest works without it.

**LP-7. Call to action and footer**
As a visitor, I want to know what to do next and who made this.
- Links to the tool, the repository and the team page.
- NASA and USDA data credits, the list of image references with licenses, and "Created for the NASA Space Apps Challenge". No NASA logo.

**LP-8. Images**
As the project owner, I want every image to be safe to publish.
- Each image has its author, license and source link recorded in [landing-page.md](landing-page.md) and CONTRIBUTING.
- An image made with an AI tool carries a visible watermark.
- No image is larger than 300 KB.

**LP-9. Motion**
As a visitor, I want movement that helps and never blocks reading.
- Sections appear softly on scroll.
- With `prefers-reduced-motion`, nothing moves and all content is visible.

**LP-10. Small screens**
As a visitor on a phone, I want to read the whole landing.
- No horizontal scroll at 360 px.
- Text does not overlap images.

Order: LP-1, LP-2, then LP-3 to LP-7 in any order, then LP-8, LP-9, LP-10.

### Tool (`web/src/features/map/`, `rotations/`, `evidence/`, `ask/`)

**TL-1. Tool section in its own folder**
As a developer, I want the tool composed outside `App.tsx` so the two worktrees do not edit the same file.
- The `Tool` and `Rotations` compositions move from `app/App.tsx` to `features/tool/`.
- `App.tsx` only places the landing sections and the tool.
- The page renders the same as before.

**TL-2. Map that explains itself**
As a farmer, I want to know what the colors on the map mean.
- Moving the year control changes the image, with a visible loading state.
- A legend explains NDVI in one sentence and shows the color scale.
- A caption says the image is the mid-July 16-day composite of the chosen year.
- The year control works with the keyboard.

**TL-3. The summer of the chosen year**
As a farmer, I want the weather of the year I am looking at.
- Next to the map: summer rainfall, temperature, root-zone wetness and its deviation from the 2001-2023 mean, for the selected year, from the data file.
- Each figure shows its source, and that it comes from a grid of about 50 km.
- A year with no data says so instead of showing zero.

**TL-4. Rotation cards**
As a farmer, I want to compare the three rotations at a glance.
- Three cards side by side on a wide screen, stacked on a phone.
- The counts (sources read, sources to verify, gaps, risks) say what they mean.
- The hypothetical rotations are clearly marked. There is no score and no "best".

**TL-5. Evidence panel**
As a farmer, I want to check every sentence.
- Each sentence shows its origin label, and a short key explains the labels.
- A citation with a link opens the source in a new tab.
- Choosing another card moves the reader to the panel.

**TL-6. Question box, finished**
As a farmer, I want an answer I can check, or a clear message when there is none.
- Tested against the deployed API from the production site.
- Each claim shows whether it was verified and where it comes from.
- Different messages for: no data to answer, daily limit reached, service down or slow. The last one shows the pre-generated explanation.
- Two or three example questions can be clicked.

**TL-7. Farmer priorities (optional, was FE-9)**
As a farmer, I want to choose what matters most to me: water, income or soil.
- Choosing a priority changes which evidence is shown first. It does not rank the rotations or produce a score.
- Where the data cannot speak to a priority (no yields, no prices), the tool says so.

**TL-8. Uncertainty in view**
As a farmer, I want the limits next to the data, not only at the bottom.
- The fixed notice stays at the top of the tool.
- The limits of the data file are visible without leaving the tool.

**TL-9. Small screens and accessibility**
As a farmer on a phone, I want to use the whole tool.
- No horizontal scroll at 360 px. The map can be scrolled past with one finger.
- Visible focus, labels on every control, and readable contrast.

**TL-10. Browser check**
As the project owner, I want proof that the deployed tool works end to end.
- In the production site: change the year, open the evidence of each rotation, ask one question, and force a failure to see the fallback.
- The result is written in the deployment status table. This closes DEP-10.

Order: TL-1 first, then TL-2 to TL-6 in any order, then TL-8, TL-9, TL-10. TL-7 only if time remains.

## Worktrees

| Worktree | Branch | Folders it touches | Stories |
|---|---|---|---|
| `tea-deploy` | `chore/deploy` | `.github/`, Vercel and Cloud Run configuration | DEP-2 to DEP-12 |
| `tea-backend` | `feat/pipeline` | `pipeline/`, `api/` | BE-2 to BE-7 |
| `tea-frontend` | one branch per story | `web/src/features/landing/` | LP-1 to LP-10 |
| `tea-frontend-tool` | one branch per story | `web/src/features/map/`, `rotations/`, `evidence/`, `ask/`, `tool/` | TL-1 to TL-10 |

Rules to avoid conflicts:
- Each worktree touches only its own folders.
- The schema is changed only from the backend worktree, through a pull request.
- Pull requests are small and frequent, rebased on `main` before merging.
- `app/App.tsx`, `styles/`, `shared/` and `package.json` are shared by the two frontend worktrees. A change to any of them goes in its own small pull request, merged before the work that needs it.
- Each worktree works in its own folder on disk. Nobody develops in the main checkout, and work is committed before switching tasks.

Coordination points:
- FE-8 needs BE-7 and DEP-10.
- The real data from BE-4 replaces the sample file the frontend uses.

## Open decisions

- None open. The AI API is Muse Spark (Meta Model API), its key lives in Secret Manager, and Google Cloud billing is enabled.
