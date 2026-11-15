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
| DEP-10 Web connected to the backend | Checked in Chrome on `tea-8.vercel.app` on 2026-11-14 (after #51): changing the year updated the headline and the year tab (2012, 2005, 2023); the three rotations opened; Field, Compare (3 rows), What is missing and Limits (4 items) showed; no sideways scroll at desktop width. A real question ("How dry was summer 2012?") was answered with 3 verified claims and 1 claim marked "Not verified" (2 of 3 checks: the answer gave 23.0 °C for 2012, the data says 25.6 °C). The failure fallback was tested against a local stub API, not production (#50). Not checked: a real phone, a private window, the FortiGuard block (DEP-12) |
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
- The `Tool` and `Rotations` compositions move from `app/App.tsx` to `app/tool/`. They live in `app/`, not in a feature, because they import from several features and a feature never imports from another feature.
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

## Core integration, third set

Updated November 14, 2026. Everything is deployed and connected: real data in `web/public/data/summary.json`, the tool at `#/tool`, and `/ask` answering from Cloud Run. This set closes the gap between what is connected and what the project claims. It comes before any further visual work.

### Where the project stands

The claim is: compare crop rotations with NASA and USDA data, and show the evidence without deciding for the farmer. Checked against the production data file on November 14, 2026:

| What the claim needs | What exists today |
|---|---|
| NASA data feeds the comparison | The NASA statement is the same sentence (summer 2012) for all three rotations. Only the cited studies differ |
| The chosen year matters | The year changes the headline and the map, not the rotations |
| The field is described | Soil (SSURGO) and crop history (CropScape, 2008 to 2023) are in the file and in `/ask`, but no screen shows them |
| Rotations can be compared | One rotation is shown at a time |
| Every statement is backed | One risk of the four-year rotation says "This source has not been read yet" |
| It works for a visitor | The happy path works. Failure of `/ask`, phones and keyboard were not tested in a real browser |

### Goal 1. NASA data feeds the comparison

**CG-1. Dry summers, defined**
As a farmer, I want to know which summers count as dry and why.
- The pipeline marks each summer from 2001 to 2023 as dry or not, from the NASA POWER root-zone wetness deviation already in the file.
- The threshold is one number, written in the data file with the reason for it. With -1 standard deviation the dry summers are 2005, 2006, 2012 and 2023.
- The schema, the sample file and the validator are updated in the same pull request.

**CG-2. Exposure of each rotation**
As a farmer, I want one figure per rotation that comes from the data, not from a study.
- For each rotation the pipeline computes how much of the rotation has a summer crop in the field from June to August, and combines it with the dry summers of CG-1.
- Which crops count as summer crops comes from a cited crop calendar. The citation is read before it is used.
- The statement is tagged `platform_calculation` and says it measures exposure, not yield.
- A test covers the calculation with a small made-up example.

**CG-3. The year changes what the rotations show**
As a farmer, I want the year I pick to matter.
- For the chosen year the tool says whether that summer was dry and shows the CG-2 figure of the selected rotation next to it.
- For 2024 to 2026, outside the baseline, the tool says so instead of guessing.

### Goal 2. The field is visible

**CG-4. Soil of each case point**
As a farmer, I want to see the soil the comparison assumes.
- The tool shows, per case point: soil name, drainage, organic matter and available water, each with its source and origin label.

**CG-5. Crop history**
As a farmer, I want proof of what was grown.
- The tool shows the crop of each year from 2008 to 2023 for each case point, as one strip of years.
- Clicking a year in the strip selects that year.

### Goal 3. No unbacked statement in production

**CG-6. Sources read or removed**
As a judge, I want every statement to rest on something that was read.
- The statement tagged `citation_to_verify` is either read and re-tagged, or removed.
- The validator fails if the production file contains `citation_to_verify`.

### Goal 4. Rotations side by side

**CG-7. Compare view**
As a farmer, I want the three rotations in one view.
- One table: crops, in use or hypothetical, the CG-2 figure, number of open gaps. No score and no ranking.
- On a phone the table scrolls inside its own box.

### Goal 5. Proof that it works

**CG-8. `/ask` failure**
As a visitor, I want the tool to stay usable when the question service fails.
- With the API unreachable, at the daily limit and busy, the question box shows its message and the rest of the tool works. Checked locally against a wrong API address, not against production.

**CG-9. Small screens and keyboard** (closes TL-9)
- No horizontal scroll at 360 px, the map does not trap the finger, visible focus and labels on every control.

**CG-10. Browser check in production** (closes TL-10 and DEP-10)
- In `tea-8.vercel.app`: change the year, open each rotation, read the soil and the history, ask one question.
- The result is written in the deployment status table.

### Order

1. CG-6 (small, removes a visible defect).
2. CG-1, then CG-2 (backend worktree: pipeline and schema).
3. CG-4 and CG-5 (tool worktree, in parallel with step 2: the data is already in the file).
4. CG-3, then CG-7 (need CG-2).
5. CG-8, CG-9, CG-10.

Visual work on the landing and the palette continues after step 5. TL-7 stays optional.

## Audit set, fourth set

Updated November 14, 2026, from an audit of production (`tea-8.vercel.app`), the repository and the tests. The submission closes Sunday, November 15, 11:59 p.m. Stories are ordered by priority: P0 blocks the submission, P1 raises the score, P2 only if time remains, P3 after the hackathon.

### Status

Updated November 14, 2026, on branch `feat/map-default-ndvi` (not merged to `main` yet).

| Story | Status |
|---|---|
| MAP-1 | Done |
| FIX-1 | Done: the section keeps its note and button; the video never existed |
| DOC-1 | README done. LICENSE not added: the license and its holder are the owner's decision |
| CG-2 | Done: `summer_field_share` per rotation, in Compare, in dry years and in `/ask` evidence. Source read: USDA NASS Handbook 628 (1997). Small grain counted as winter wheat, oat/clover as spring oats |
| CG-3 | Done |
| GLO-1 | Done (next to the map) |
| TL-7 | Done: water, soil or income opens its tab first and says what the data cannot tell; income says there are no prices |
| UI-1 | Done: tabs on one line, 40 px targets, no sideways scroll at 500 px, landing images under 300 KB, tool loaded apart from the landing (landing bundle 490 to 283 KB) |
| SCA-1 | Done: baseline, first year, example questions, reference towns (`pipeline/region.json`) and the map limits (from the county outline) come from the data. The county outline and soil zones now live together in `web/src/regions/mclean-il/`, one folder per region, chosen in `web/src/regions/index.ts` (one region is active at a time; a region picker is not built). "How to add a region" is in the README |
| LP-7, LP-8 | Not met, found by checking. No file or document records the author, license or source of the landing pictures (`moon`, `sky` radio dish, `satellite`, `eclipse` Earth at sunrise; `orbit` is described as a generated trace). `landing-page.md` still lists other pictures as "To find". The footer has data credits but no image list and no link to the Space Apps team page. If any picture was made with an AI tool it needs a visible watermark. The owner must say where each one came from |
| MAP-3 | Done: point labels show on hover until zoomed in (they covered the outline); one tap compares the chosen year with the driest summer; the map is 352 px tall on a phone instead of 260. Seen on a phone-width window only: the desktop width could not be checked |
| MAP-4 | Done: the map keeps its size (about 647 x 464 px at 1440 px wide) when a point or place is chosen; the place card floats over it; inside a field the vegetation is hidden and the soils get one color per family (6 most common plus gray) with a legend in the map and a "Whole county" button; the map is re-measured when its frame changes size; the right panel stays in view while the left column scrolls. In a field the place card keeps one line and the soil key starts closed on a phone. Checked at 1440 px wide (Point A, back to the county, Point B) and in a 396 px frame (no sideways scroll, card below the map, tabs 40 px). Not on a real phone |
| MAP-5 | Done: under the year slider there is one bar per summer (2001 to 2025), as tall as the soil was wet that summer (standard deviations from the 2001-2023 mean, scale fixed at 2.5), dry summers in ochre, the chosen year in teal; tapping a bar picks that year. It replaces the dots. Seen at 1440 px wide; tapping bars on a phone was not tested |
| REL-1 | Done in code, not yet seen in a browser: under the year result, a folded panel plots one point per summer (soil wetness against county corn yield change vs trend), dry summers in ochre, the chosen year ringed. Text says plainly the link is weak (correlation computed from the data), that one summer (2012) drives it, what the number is without it, and that it is a hint, not proof. EN and ES. Pure maths in `features/yields/relation.ts` with tests |
| MAP-6 | Done, seen at 1440 px wide (headless browser): choosing an example field zooms in on the same map as the rest (plant colors and base map as chosen), marks the soil at the point with a thick white edge and the label "Soil here: Osco silt loam", and shows no place card. The other soil types around it (about 140 outlines) are behind the switch "Show soil types around it", off by default; switched on, they appear with a legend under the map and the edge of the soil data as a dashed square (about 2.6 km across). The wording says it is the soil at the point, not a parcel. Not tested on a phone or a tablet
| VAL-1 | Done, seen at 1440 px wide: the dry summers are cross-checked against the US Drought Monitor (weekly county maps, mean share of the county in drought class D1 or worse over June to August, public service, no key). Result, computed from the data and shown in a folded panel under the year result: of our 4 dry summers (2005, 2006, 2012, 2023) the Drought Monitor also puts 3 in drought (more than half of the county); 2006 is not confirmed (0%, our wetness reading was only -1.04, just past the cut); every summer it puts in drought, we also flag. It is a separate method, so agreement is a good sign, not proof. The panel also repeats the check at cuts of -0.5, -0.75, -1.0, -1.25 and -1.5 (a table) and says the cut is kept at -1.0 because it was chosen first, not tuned to the check. Not yet in the `/ask` evidence bundle |
| VAL-2 | Done, seen at 1440 px wide: under each crop of the year result, a line says whether the change against trend is within the usual year-to-year swing (one standard deviation of the change in the years that were not dry: about 8% for corn and for soybeans), a bigger swing than most years, or far outside it (more than twice). Seen: 2023 is within for both crops; 2012 is far outside for corn (-44%) and only a bigger swing for soybeans (-11%). The 5% and 15% words ("a little", "much") are older project choices and stay as they were |
| CG-9 (partly) | Checked in frames of 320 to 1440 px, in Spanish and English: no sideways page scroll at any width (320, 360, 600, 768, 860, 861, 900, 1024, 1100, 1180, 1181, 1280, 1440). The tool stacks in one column up to 1180 px, because below that the right panel is narrower than its row of tabs (439 px); on a phone the tabs scroll with a faded edge. All 29 controls have a name and a visible focus (the year slider's Firefox thumb was missing one and now has it). The headline is the page's h1. `/ask` failure checked locally with no API address: the message and the prepared explanation appear and the rest of the tool works. Not checked: a real phone, screen readers, the failure of the map tiles |
| MAP-2 | Not done on purpose: GIBS has no NDVI anomaly layer. It needs a per-pixel 2001-2023 mean computed in the pipeline from the colored tiles, which means inverting the color scale; that is not worth the risk of a wrong map the night before the deadline |
| REL-1, CG-9, CG-10, DEP-12, SUB-1 | Not done: they need a merge to `main`, a real phone or the owner |

### Audit findings

| Finding | Evidence |
|---|---|
| The landing video returns 404 | `web/public/demo/` holds only the poster; `/demo/tea8-demo.mp4` is 404 in production |
| README says "no project code yet" and promises features that do not exist | README status line, rainfall scenario control, farm story, priorities, Ollama |
| Production is behind | `feat/i18n` is 11 commits ahead of `main`; PR #61 is open |
| No LICENSE file | Repository root |
| Two landing images are over 300 KB | `eclipse.webp` 448 KB, `moon.webp` 412 KB (LP-8) |
| CG-2 does not exist | No exposure calculation in `pipeline/`; the NASA statement is the same for all three rotations |
| The map opened empty | Fixed by MAP-1 |
| Not tested in a real browser | Phone, private window, `/ask` failure in production, FortiGuard |
| Only `web` is a required check on `main` | Branch protection |

### P0. Blocks the submission

**REL-1. Merge the pending work**
- `feat/i18n` and `feat/map-default-ndvi` reach `main` through pull requests; a decision is recorded on PR #61.

**FIX-1. Landing video**
- Either `/demo/tea8-demo.mp4` loads in production, or the video section is removed. No broken player.

**DOC-1. README and license**
- The README states the real status, stack and scope, with nothing that does not exist.
- A LICENSE file is added.

**MAP-1. Map shows NASA data by default** (closes TL-2) Done on `feat/map-default-ndvi`.
- Opens on the detailed map with the vegetation layer and legend on.
- Two backgrounds are offered. The compare-years control is visible without a menu.

**CG-9 / CG-10 / DEP-12. Checks in a real browser**
- Phone or 360 px, private window, `/ask` failure in production, FortiGuard request. The result goes in the deployment status table.

### P1. Raises the score

**CG-2. Exposure of each rotation** (see the third set)
- Blocked until the summer-crop calendar source is read. If it is not found, the column says "no data" and Limits says why.

**CG-3. Years outside the baseline**
- For 2024 to 2026 the tool says the year is outside the 2001-2023 baseline.

**GLO-1. Short glossary**
- NDVI, root-zone wetness, satellite against field measurement and uncertainty, each in one or two plain sentences, inside the tool.

**SUB-1. Submission material**
- A video of 30 seconds or less, or at most 7 slides. English text. Form fields, references and the AI-use statement filled in. Done by the owner; the script and English text are drafted.

### P2. If time remains

**TL-7. Farmer priorities**: see the second set.
**MAP-2. NDVI anomaly**: the map can show the year's NDVI against the 2001-2023 mean with a diverging scale, and the legend says so.
**SCA-1. Region outside the code**
- County outline, reference towns, baseline years and example questions come from the data file or `pipeline/region.json`.
- The README has a "How to add a region" section.
**UI-1. Interface polish**
- Tabs fit one line in Spanish. Controls are at least 40 px high. Landing images are under 300 KB. The tool loads apart from the landing.

### P3. After the hackathon

**SCA-2. Second county** with a region selector. Until it runs, nobody can claim the project scales.
**CI-1. Required checks**: `api` and `pipeline` become required on `main`.

## Worktrees

| Worktree | Branch | Folders it touches | Stories |
|---|---|---|---|
| `tea-deploy` | `chore/deploy` | `.github/`, Vercel and Cloud Run configuration | DEP-2 to DEP-12 |
| `tea-backend` | `feat/pipeline` | `pipeline/`, `api/` | BE-2 to BE-7 |
| `tea-frontend` | one branch per story | `web/src/features/landing/` | LP-1 to LP-10 |
| `tea-frontend-tool` | one branch per story | `web/src/features/map/`, `rotations/`, `evidence/`, `ask/` and `web/src/app/tool/` | TL-1 to TL-10 |

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

- CG-1: the dry-summer threshold (proposed: -1 standard deviation of root-zone wetness) and CG-2: the crop calendar source.
- The AI API is Muse Spark (Meta Model API), its key lives in Secret Manager, and Google Cloud billing is enabled.
