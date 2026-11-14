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

## Worktrees

| Worktree | Branch | Folders it touches | Stories |
|---|---|---|---|
| `tea-deploy` | `chore/deploy` | `.github/`, Vercel and Cloud Run configuration | DEP-2 to DEP-12 |
| `tea-backend` | `feat/pipeline` | `pipeline/`, `api/` | BE-2 to BE-7 |
| `tea-frontend` | `feat/web` | `web/src/` | FE-1 to FE-9 |

Rules to avoid conflicts:
- Each worktree touches only its own folders.
- The schema is changed only from the backend worktree, through a pull request.
- Pull requests are small and frequent, rebased on `main` before merging.

Coordination points:
- FE-8 needs BE-7 and DEP-10.
- The real data from BE-4 replaces the sample file the frontend uses.

## Open decisions

- Which AI API to use.
- Google Cloud billing must be enabled by the project owner.
