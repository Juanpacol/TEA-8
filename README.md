# TEA-8

A decision-support tool that compares crop rotations using NASA and USDA data and shows the evidence behind every statement.

**Challenge:** Field Shift: Adapting Farms with NASA Data (NASA Space Apps 2026).
**Dates:** Saturday and Sunday of the hackathon (November 14-15, 2026).
**Live:** https://tea-8.vercel.app (the tool is at `#/tool`).
**Status:** working prototype for McLean County, Illinois. Real NASA and USDA data, deployed. Not agronomic advice.

## What it does

The farmer picks a summer (2001 to 2026) and one of three rotations, including the one already in use. The tool shows:

- how that summer compared with 2001-2023 (NASA POWER rainfall, temperature and root-zone wetness), and whether it counts as dry under a written rule;
- a map of NASA satellite vegetation (NASA GIBS, MODIS NDVI) for that year, with a second year to compare against;
- what the county corn and soybean yields (USDA NASS) did in that summer against their trend;
- the soil of two case points (USDA SSURGO) and the crop of each year from 2008 to 2023 (CropScape);
- for each rotation: why it is suggested, the evidence, what we do not know and which risks a local expert should review;
- a question box. Answers come from a language model and every claim is checked by code against the data; a claim that fails the check is shown flagged.

An optional priority (water, soil or income) changes which panel opens first and says what the data can and cannot tell about it. It never ranks or scores the rotations.

TEA-8 supports the decision and does not replace it. It gives no final score and no "best option".

## What sets it apart

- Every statement shows its origin: NASA data, a platform calculation, model text, or a citation that was read.
- The rotations rest on cited studies, not on invented numbers.
- It says what it does not know: the limits are on screen, not only at the bottom.
- Public data only, no account and no field data needed.

## What it does not do

- It has no prices, costs or returns.
- Yields are county averages for corn and soybeans. They say nothing about one field or one rotation, so comparisons measure stress and exposure, not outcomes.
- The alternative rotations are hypothetical and rest on studies, mostly from the Midwest.
- It was built and checked for McLean County only. A second county has not been run.
- Nobody has compared its answers with an agronomist's, and no farmer has used it.

See [docs/alternatives.md](docs/alternatives.md) and [docs/user-stories.md](docs/user-stories.md).

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Data preparation | Python (standard library plus jsonschema) | Runs before the demo. Downloads, summarizes and writes one validated JSON file. |
| Interface | React, Vite and TypeScript | Static page, English and Spanish. |
| Map | Leaflet | NASA GIBS NDVI tiles over USGS base maps. |
| NASA and USDA data | NASA POWER, NASA GIBS, USDA Soil Data Access, CropScape, USDA NASS | Saved as static files. No live queries to them during use. |
| Questions | `api/` on Google Cloud Run | The model is Muse Spark (Meta Model API). The key lives in Secret Manager. If the service fails, the pre-generated explanations are shown. |
| Hosting | Vercel (web) and Cloud Run (`api/`) | See [docs/infrastructure.md](docs/infrastructure.md). |

## Run it

```
cd web && npm install && npm run dev          # the tool at http://localhost:5173/#/tool
npm test && npm run lint && npm run build     # checks, as in CI
```

Without `VITE_API_URL` (see `web/.env.example`) the question box falls back to the pre-generated explanations. The data pipeline is in [pipeline/README.md](pipeline/README.md).

## How to add a region

Only McLean County has been run. What a second region needs, and what is still fixed in the code:

| Change | Where |
|---|---|
| Region name, baseline years, climate point and case points | `pipeline/region.json` and `pipeline/points.py` |
| County or state yields | CSVs in `pipeline/inputs/`, read by `pipeline/summarize/yields.py` |
| Crop windows for the summer exposure | `pipeline/rotations/calendar.json` (the values are Illinois, USDA NASS 1997) |
| Rotations and their cited rules | `pipeline/rotations/rotations.json` (the studies are mostly Midwest) |
| Regenerate the data file | the commands in [pipeline/README.md](pipeline/README.md), then commit both copies of `summary.json` |
| Reference towns for the town list | `reference_towns` in `pipeline/region.json` |
| **Still in the web code:** the county outline and the soil zones | `web/src/features/map/mclean-county.json` and `soil-zones.json` (the map limits follow the outline) |

The baseline years, the first year shown, the example questions, the town list and the map limits already come from the data. Until a second county runs end to end, the project does not claim that it scales.

## Out of scope

- ECOSTRESS, GRACE, GEDI and SRTM.
- Authentication and a database.
- User history and multiple regions.
- Live queries to the data APIs (NASA, USDA) during use.

## Architecture and folder structure

A simple monolith in a single repository, with two parts joined by a data contract:

1. **pipeline/** (Python): runs before the demo. Downloads, summarizes and saves JSON.
2. **web/** (React with Vite): a static page that reads those JSON files.

Full hexagonal architecture is not used: the scope is one weekend. Only one idea from it is kept: the logic that compares rotations (the rules in `features/rotations/`) does not know where the data comes from or how it is displayed.

### Frontend principle

React's own model is used, not patterns transplanted from other languages.

| Common idea | React equivalent |
|---|---|
| View | Components: they only render from their props |
| Controller | Custom hooks: state and effects (`useRotations`, `useTimeline`) |
| Service | Function modules that load data in `shared/lib`, used from hooks |
| Shared state | Context with `useReducer`, or a small library such as Zustand |
| Model or domain | Pure TypeScript functions, no React |
| Heavy loading (3D) | `React.lazy` and `Suspense` |

### Folders

```
tea/
├── docs/                          decisions, sources and cited rules
├── pipeline/                      Python, runs before the demo
│   ├── download/                  NASA POWER, GIBS, soil and crops
│   ├── summarize/                 summary by season and zone
│   ├── explain/                   explanations from templates or a model
│   ├── schema/                    JSON contract between pipeline and web
│   └── requirements.txt
├── api/                           small service for AI questions, deployed on Cloud Run
└── web/                           React, Vite and TypeScript
    ├── public/data/               JSON written by the pipeline
    └── src/
        ├── app/                   App.tsx and the sections that combine several features (app/tool/)
        ├── features/
        │   ├── landing/           one section per file
        │   ├── map/               map and timeline
│   ├── season/            season headline and figures for the chosen year
│   ├── priorities/        optional farmer priority: what opens first, never a ranking
│   ├── field/             soil and crop history of each case point
        │   ├── ask/               question box and verified answers
        │   ├── rotations/         pure rules (rules.ts, compare.ts), hooks, components and tests
        │   └── evidence/          evidence sections, origin key, limits and notices
        ├── shared/                components (origin label, segmented control, tabs), hooks and lib (data loading, shared types)
        └── styles/                palette variables and global styles
```

`globe/` (optional 3D with lazy loading) is created only if it comes to exist. No Docker for local work: the web app installs with `npm install` and the pipeline with a virtual environment and `requirements.txt`. How `api/` is packaged for Cloud Run is decided in DEP-5.

### Layers and dependencies

| Layer | In TEA-8 |
|---|---|
| Domain | Pure rules in `features/rotations/` (`rules.ts`, `compare.ts`) |
| Application | Hooks (`useRotations`, `useTimeline`) |
| Infrastructure | `shared/lib` (data loading), `pipeline/` and `api/` |
| Presentation | Each feature's components |

Features do not import from each other: anything two features share lives in `shared/`. Dependencies go in one direction only: components use hooks, hooks use rules and data loading, and rules import nothing from React, from `fetch`, or from files.

If the project grows, a `server/` folder is born with `domain/`, `services/`, `repositories/` and `api/`, and `shared/lib` starts calling that API. It is a small change because the boundary with the data is already isolated.

### React libraries to evaluate

Known by name and not tested: react-leaflet (map), react-three-fiber (3D) and a React globe such as react-globe.gl. Check each one's license before choosing. For example, another project documented that react-leaflet 5 uses a non-standard license.

## Optional: rotating planet

Idea for an entry screen: a spinning globe that zooms toward the region and enters the farm map. Only done if time remains on Sunday. The flat map is the base and does not depend on this.

Options to evaluate (not tested or compared yet; check weight, license and ease before choosing):

| Option | Idea |
|---|---|
| globe.gl (built on three.js) | Interactive globe in few lines of code. |
| CesiumJS | A full 3D globe, very powerful, but heavy for this scope. |
| three.js directly | Maximum control, more work. |
| Short image or video of a spinning globe | Minimal alternative: no live 3D, just a visual asset on the cover. |

Decision rule: if it takes more than a few hours to work, drop it.

## Map feasibility test

First technical task, about 30 minutes: a Leaflet map with a NASA satellite layer (NDVI) and a date control.

- NASA GIBS (the source behind Worldview) could serve layers as dated tiles. Verify that it works in Leaflet, that it needs no account, and which vegetation layers it offers.
- If it works: real NASA images are shown without downloading files, and a before-and-after comparer is simple.
- If it does not: fallback plan, prepare the data in Python and save it as small images or JSON.

## Technical references from winning projects (2025)

Observed on their public sites. Only a reference for techniques; their code is not reused.

- Queñaris (Local Impact): a single-page app with Vite, Leaflet and in-browser reading of GeoTIFF files. NDVI map, historical analysis and zone analysis sections.
- Henry's Farm Adventures, by Zumorroda-X (Art & Technology): a 2D game with Phaser, before-and-after Landsat images, NDVI and US Drought Monitor data.
- Twisters (Best Use of Technology): a web app with NASA APIs and Gemini.

## Decisions made

| Topic | Decision |
|---|---|
| Challenge | Field Shift: Adapting Farms with NASA Data (difficulty Advanced/Intermediate) |
| Mode | Individual participation |
| Zone | McLean County, Illinois (USA) |
| Main case | Summer 2023 (recent moderate drought) |
| Contrast | Summer 2012 (extreme drought) |
| Case point A (corn in 2023) | -88.6594, 40.2840. Osco soil |
| Case point B (corn in 2012) | -88.6735, 40.6954. Chenoa soil |
| Data processing | Python, before the demo |
| Interface | React with Vite and Leaflet, static page |
| Explanations | Code templates, with an optional model |

Reason for the zone: the soil data (USDA) and crops-by-year data (CropScape) that the challenge recommends are from the US. McLean was the candidate where all three services returned useful data.

## Verified data (November 2026)

| Data | Source | Status |
|---|---|---|
| Rainfall, temperature and root-zone wetness, monthly | NASA POWER (API) | Works without an account. Data through September 2026 |
| Dated satellite tiles (MODIS and VIIRS NDVI, IMERG rainfall) | NASA GIBS (WMTS) | Works. Allows CORS (`access-control-allow-origin: *`). MODIS NDVI every 16 days since 2000 |
| Soil by coordinate | USDA Soil Data Access (SSURGO) | Works without an account |
| Crop by year and coordinate | CropScape (CDL) | Works through 2025. Needs coordinates in meters, Albers projection EPSG:5070 |

Notes:
- GIBS does not offer SMAP soil moisture, only brightness temperature layers. Root wetness comes from NASA POWER (`GWETROOT`).
- NASA POWER uses a grid of about 50 km: it represents the area, not the plot.
- The services were tested with single queries. Continuous loading of several layers during a demo was not tested.

## McLean County findings

Sample: 30 random points inside the county (verified with the FCC API, code 17113). 23 are cropland (corn or soybeans in at least 12 of 16 years, 2008 to 2023).

Year-to-year transitions among cropland fields (n = 338):

| Transition | Share |
|---|---|
| Corn to soybeans | 45.6% |
| Soybeans to corn | 45.3% |
| Corn to corn | 7.1% |
| Soybeans to soybeans | 2.1% |

- The current rotation in the area is corn-soybean alternation.
- No wheat, alfalfa, hay or other crops appeared in those fields. Alternative rotations will be hypothetical and must rest on cited agronomic sources.
- In 2012, 14 of 23 fields had corn (61%, approximate interval 41% to 78%).

Summer climate (June to August) at case point A, NASA POWER:

| Year | Root wetness | Deviation vs 2001-2023 |
|---|---|---|
| 2012 | 0.51 | -1.98 |
| 2013 | 0.73 | +1.02 |
| 2022 | 0.61 | -0.59 |
| 2023 | 0.56 | -1.22 |
| 2024 | 0.62 | -0.41 |
| 2025 | 0.61 | -0.59 |
| 2026 | 0.66 | +0.04 |

- 2012 was the driest summer from 2001 to 2023. With 2012 excluded from the baseline, its deviation is -2.23 (95% resampling interval: -3.06 to -1.77).
- Summer 2012 rainfall: 1.77 mm/day. Mean summer temperature: 25.6 °C in 2012 and 21.9 °C in 2013.

Soils at the case points (top layer):

| Point | Soil | Drainage | Hydrologic group | Organic matter | Available water |
|---|---|---|---|---|---|
| A (-88.6594, 40.2840) | Osco, 90% | Well drained | B | 3.5% | 0.23 |
| B (-88.6735, 40.6954) | Chenoa, 94% | Somewhat poorly drained | C/D | 4.3% | 0.17 |

Crop history at the points:
- A: alternates every year. Corn in 2023, soybeans in 2012.
- B: alternates every year. Corn in 2012, 2022 and 2024. Soybeans in 2013, 2023 and 2025.

Limits of this test:
- There are no yields. The retrospective comparison measures stress and exposure, not outcomes.
- CropScape is a classification with its own error, not verified here.
- 30 points (23 cropland): a sample, not a census.

## To define

- [x] Specific farm region: McLean County, Illinois.
- [x] Soil data source: USDA Soil Data Access (SSURGO).
- [x] Evaluation criteria and submission rules: see [docs/hackathon-requirements.md](docs/hackathon-requirements.md).
- [ ] Free NASS QuickStats key, to bring corn and soybean yields by year.
- [ ] Citable agronomic sources for the alternative rotations (for example wheat or a cover crop).
- [ ] Rules on prior work: no explicit rule found; the Participant Terms and Conditions are still unread.
- [ ] Model for the explanations: local Ollama or an API (confirm permission and credit if it is the employer's plan).
- [ ] Whether to include the before-and-after image comparer.
- [ ] Optional: add the GPM/IMERG layer to the map once the base map works.
- [ ] Full name or meaning of TEA-8, if it has one.

## Before Saturday

- [ ] Create a free NASA Earthdata account.
- [ ] Check that real data for the region can be downloaded (NASA POWER at minimum).
- [ ] Map feasibility test with a NASA layer in Leaflet (see section above).
- [ ] Define the 6 crops and their rules with sources.
- [ ] Build the team and split roles: frontend, geospatial data, agronomy, design and pitch.
- [ ] Review the hackathon rules on prior work and teams.
- [ ] If a model API is used: own key with a spending limit, never inside the page code.

## Risks

- The challenge is intermediate to advanced. One well-done case is worth more than several half-done features.
- If real data for the region is not obtained in time, the project loses strength. Fallback: NASA POWER plus already published images.
- Rotation scores must rest on sources. Otherwise they will not survive a question from a scientific judge.
- Many teams will build a similar tool. The difference has to show in the demo.

## Visual identity (draft)

- Symbol: a red gerbera with thin petals and a yellow center, inside a ring divided into three segments (the three rotations) and with an orbit dot (the satellite).
- Palette: dark teal, ochre and red as the accent.
- Proposed motto: "Evidence before advice".
- It must be original work. Reference images are for style and color only.
- If an AI image tool is used, the image needs a visible watermark (see CONTRIBUTING).

## Reference evaluation criteria

Space Apps global awards include Best Use of Data, Best Use of Science, Best Use of Technology, Galactic Impact and Local Impact, among others. The challenge optionally asks to compare at least three rotations and explain evidence, gaps and risks.

## References

- Challenge page: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/
- Awards: https://www.spaceappschallenge.org/awards/
- Visual prototype: https://claude.ai/artifact/NLB1N4QrmmBsEjgVkZcPhC (private)
