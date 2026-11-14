# TEA-8 working guide

This document holds the project's working rules. The hackathon requirements live in [docs/hackathon-requirements.md](docs/hackathon-requirements.md). If anything changes on the official site, the site wins.

Reference pages:
- Participant FAQs: https://www.spaceappschallenge.org/resources/participant-faqs/
- Judging and awards guide: https://www.spaceappschallenge.org/resources/judging-awards-guide/
- Project submission guide: https://www.spaceappschallenge.org/resources/project-submission-guide/
- Team formation guide: https://www.spaceappschallenge.org/resources/team-formation-guide/
- Challenge: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/

## 1. Hackathon requirements

Deadlines, form, demo format, evaluation criteria and the pre-submit checklist: see [docs/hackathon-requirements.md](docs/hackathon-requirements.md).

### Rules on the use of SI (AI)
- SI tools may be used as support. **They must not be used to come up with how to solve the challenge.** The idea for the solution must be the team's.
- Generated content **may not use or modify NASA branding** (logos, flags, mission identifiers).
- Where and how SI was used must be indicated: generated **images and video** carry a **visible watermark**; **audio**, a notice in the descriptive text and metadata; **code and data**, a notice in the descriptive text and metadata.
- The answer in the "Use of SI" field is for data collection only and judges do not see it. They do see the watermarks, texts and metadata inside the project, and they evaluate originality, intent and execution.
- In practice: an icon made with an image tool carries a visible watermark, or is made by hand. Code files written with assistance carry a notice (header comment or a README note).

## 2. Project rules

### Scope
- One case done well: McLean County, Illinois. Cases: summer 2023 (recent) and 2012 (extreme contrast).
- Three rotations per comparison: the current one (corn-soybean) and two alternatives.
- No features are added just for show. Optional items (3D globe, before-and-after comparer) are done only if time remains and they do not touch the core.

### Data
- Only verified sources are used: NASA POWER, NASA GIBS, USDA Soil Data Access, CropScape.
- Every number shown carries its source, the parameter and the query date.
- Missing data is not filled with zeros or invented. The unknown is shown as unknown.
- Simulated data is always labeled as simulated.
- NASA POWER is a coarse grid (about 50 km). It is not presented as a plot measurement.
- Known limits are declared in the interface and in the submission (see README).

### Evidence and citations
- There is no final score and no "best option": the decision belongs to the farmer.
- Every statement indicates its origin: NASA data, a platform calculation, model text, or a citation still to be verified.
- Alternative rotations are **hypothetical**, because they do not exist in the observed fields. They rest on cited sources, and this is stated.
- A source is not cited without having been opened and read. The sources in section 4 are marked "to verify".
- If a source contradicts the recommendation (for example, grass cover crops that slightly lower corn yield), it is shown.

### Code
- Python only to prepare data before the demo (`pipeline/`). The page (`web/`) is static.
- React with Vite. Folders by feature in `web/src/features/`.
- Components only render. Logic with state and effects goes in hooks. Rotation rules go in `features/rotations/` (`rules.ts`, `compare.ts`) as pure functions, without React.
- Each feature exposes only what is needed through its `index.ts`.
- Anything 3D, if done, goes in `features/globe/` with lazy loading.
- Dependencies go in one direction: components, hooks, rules. Rules do not import React, `fetch` or files.
- Live AI questions go through the `api/` service on Google Cloud Run; pre-generated explanations are the fallback. The API key lives in Secret Manager, never in the repository or in the web app.
- Work is split by layer into user stories: see [docs/user-stories.md](docs/user-stories.md).
- TypeScript recommended for data and props.
- Tests next to each file, first on the rules and on the validation of figures and citations.
- No folders or layers "just in case".
- Check each library's license before using it. Example: react-leaflet 5 was reported under a non-standard license.

### Originality and rights
- No code is copied from other projects, neither from the Meta hackathon nor from the winners. Techniques and ideas are taken.
- Every external resource (code, library, image, text) is noted in section 4 to pass to the "References" field.
- The icon is original work. Reference images serve only as style inspiration.
- API keys and credentials are never committed. Keys go in environment variables and stay out of the repository.
- The repository is public: nothing is published that should not be public.

### Workflow
- **Nothing goes straight to `main`.** No direct commits, no direct pushes, no force pushes. `main` is protected on GitHub, and the rule applies to everyone, including the repository owner and any AI assistant.
- Every change, code or documentation, follows the same path: create a branch, commit, push the branch, open a pull request, merge it with **rebase and merge** (the only merge method enabled). The branch is deleted after the merge.
- Branch names use a type prefix: `feat/`, `fix/`, `docs/`, `chore/`.
- Small pull requests with a clear title and a description that says what changes and why.
- Before pushing, check that there are no keys, personal data or heavy files.
- Data test results are saved in the README with their limits.

### Language
- **Everything is in English**: documentation, code (identifiers, comments, tests), commit messages, branch names, pull request titles and descriptions, issues, user-interface text and submission material.
- The only exception is conversation between teammates, which is free.
- A pull request that adds text or code in another language is not merged until it is translated.

## 3. SI/AI usage log

The submission requires describing how SI tools were used. It is logged here from the start so it does not have to be reconstructed at the end.

| Tool | What it was used for | Where it shows |
|---|---|---|
| Claude (AI assistant) | Research on the challenge and sources, tests of the data APIs, text drafts, folder structure proposal | README, CONTRIBUTING, data tests |
| (add) | | |

Rule: whatever an AI tool generates is reviewed and understood before use, and the person who signs the project answers for it.

## 4. External references log

To copy into the "References" field of the submission. Status "to verify" means the source came from a search and has not been fully opened yet.

| Resource | Use | Status |
|---|---|---|
| NASA POWER, https://power.larc.nasa.gov/ | Climate and root-zone wetness | Verified accessible |
| NASA GIBS (Worldview), https://gibs.earthdata.nasa.gov | Dated satellite tiles | Verified accessible |
| USDA Soil Data Access (SSURGO) | Soil by coordinate | Verified accessible |
| USDA CropScape (CDL), https://nassgeodata.gmu.edu/CropScape/ | Crop by year | Verified accessible |
| CropWatch, University of Nebraska: diverse rotations, https://cropwatch.unl.edu/2021/more-diverse-crop-rotations-improve-yield-yield-stability-and-soil-health | Alternative rotations | To verify |
| Long-term USDA trial in Nebraska, https://par.nsf.gov/servlets/purl/10554940 | Stability under drought | To verify |
| American Society of Agronomy, cover crop study in Illinois, https://agronomy.org/news/media-releases/releases/2020/0916/1214 | Caution on cover crops | To verify |
| Illinois NREC on Field Advisor, https://fieldadvisor.org/refining-cover-crop-recommendations-for-corn-soybean-rotations-based-on-species-and-timing/ | Cover crop guidance | To verify |
| Top Crop Manager, wheat in rotations (Ontario), https://www.topcropmanager.com/complex-crop-rotations-19018/ | Evidence from another region | To verify |
| NASA Worldview, https://worldview.earthdata.nasa.gov/ | Interface design reference | Style reference, no code reused |
| Space Apps 2025 winning projects (Queñaris, Henry's Farm Adventures, Twisters) | Technique reference | Style reference, no code reused |
| Ether landing page (author's earlier hackathon project) | Layout and section structure | Style reference, no code or images reused |
