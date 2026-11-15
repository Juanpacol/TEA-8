# Field analysis stories

Feedback after the submission: let a person go to their own place and analyze it, instead of two fixed example fields. This set of stories is built on the branch `feat/analyze-any-field`, one story at a time. A story starts only after the previous one is verified.

Related: [user-stories.md](user-stories.md), [method.md](method.md), [contracts.md](contracts.md).

## Rules for every story

- Evidence before advice: the tool shows data, sources and limits. It never says what to plant.
- Each figure names its source. What applies to the area (climate, about 50 km) is not presented as data of the field.
- No accounts and no storage of coordinates on a server. A place lives in the browser, in a link or in a saved report.
- Nothing was merged into `main` until the set was reviewed and the API was tested as a Cloud Run revision with no traffic. Merged and deployed on 2026-11-15 (pull request #74).

## Status

| Story | Status |
|---|---|
| FA-1 Go to a place by coordinates | Done. Checked in Chrome on the local build (2026-11-15): text that is not a coordinate and a place in Colombia each showed their message and moved nothing; `41.59, -93.62` moved the map to Des Moines and the place card said there is no data there |
| FA-2 Evidence for one point, queried live | Done and deployed (2026-11-15). Checked in Chrome against a local API (2026-11-15): `38.5, -98.8` (Kansas) returned in 3 s the dry summers 2011 and 2012, the soil Harney and the crop of 2008 to 2023; downtown Des Moines returned no soil and "Developed" as crop. Not checked: the route on Cloud Run, a source that is down in real use |
| FA-3 Draw a zone point by point | Done. Checked in Chrome on the local build (2026-11-15): four clicks drew a field and "Finish" filled it with its area; "Clear" removed it. Loading a KML or GeoJSON file was built first and then removed, because the farmer wants to draw on the map, not load a file |
| FA-4 Evidence for a drawn zone | Done and deployed (2026-11-15). Checked in Chrome against a local API (2026-11-15): a 387 ha field in Kansas returned 8 soils with their share (Harney 37%, New Cambria 20%, Hord 17% …), the crop of 2008 to 2023 at 5 points inside it, and the dry summers 2011 and 2012; it took 31 s, mostly CropScape. A 1° triangle was refused as larger than 50 km² with its message |
| FA-5 Report to save and share | Done and deployed (2026-11-15). The printed report became its own English document: summary, map with the outline, climate and NDVI charts, VCI and NDVI color scales, soil, crops, limits, sources and glossary; checked on screen, the print dialog itself not yet. Checked in Chrome (2026-11-15): a fresh open of a `#/tool?zone=…` link restored the 387 ha field and its analysis ran; "Copy link" copied and said so; a link opened while the tool was on screen moved to the new place and to a new field. Not checked: the printed page (the print dialog was not opened) |
| FA-6 County yields for any place | Pending (needs a USDA NASS QuickStats key) |
| FA-7 Questions about my place | Done and deployed (2026-11-15). With the real Muse Spark model, on the no-traffic revision: a question about a drawn field near Bloomington answered with 4 of 4 claims verified, including NDVI and VCI, in 7 s; a prompt asking for "the best crop with a score" got evidence only. Before that, plumbing only. Checked in Chrome against a local API with a stand-in model (2026-11-15): after analyzing a field, a question was answered in 0.5 s from the cached evidence; two claims citing the field's evidence were verified and one with a wrong temperature (23.3 °C) was marked not verified. Not checked: the real model (Muse Spark) with this evidence; must be tried on a no-traffic Cloud Run revision before any merge. The McLean prompt is unchanged (`ask-v1`) |

## Stories

**FA-1. Go to a place by coordinates**
As a farmer, I want to paste the coordinates of my field so the map takes me there without searching by hand.
- A box accepts `40.52, -88.86`, `40.52 -88.86`, `40.52° N, 88.86° W` and a Google Maps link.
- The map moves to the place and marks it. The map can reach any place in the contiguous United States.
- Text that is not a coordinate, or a place outside the contiguous United States, shows a plain message and moves nothing.
- The place card keeps saying honestly what data exists there.

**FA-2. Evidence for one point, queried live**
As a farmer, I want the soil, the crop of each year and the summer climate of the point I chose, so I see my place and not an example field.
- A new API route returns, for a latitude and longitude: summer climate and dry summers (NASA POWER), soil (USDA SSURGO) and the crop of each year (USDA CropScape). Each figure has its source and query date.
- The dry-summer rule is the one in [method.md](method.md), computed for the grid cell of that point.
- The page shows the result for the chosen place, with a loading state and a plain message when a source fails. A source that fails does not hide the others.
- Outside the contiguous United States the route answers that there is no data.

**FA-3. Draw a zone point by point**
As a farmer, I want to mark the corners of my field on the map so the tool knows its shape.
- A button starts drawing. Each click adds a corner; the figure can be closed, undone and cleared.
- The page shows the area in acres and hectares.
- Drawing starts on the aerial photo with the vegetation colors off, and the map zooms in to level 18, so a person sees their land and clicks the corners of one field. The place card does not cover the map while drawing.

**FA-4. Evidence for a drawn zone**
As a farmer, I want the evidence for my whole field, not for one point.
- Soil: the soil types inside the zone and the share of each one.
- Crops: the crop of each year, from points sampled inside the zone.
- Climate: the grid cell of the center of the zone, labeled as data of the area.

**FA-5. Report to save and share**
As a farmer, I want to keep the evidence of my place and send it to my agronomist.
- A link reopens the same place or zone.
- A printable report lists the figures, their sources, the query date and the limits.

**FA-6. County yields for any place**
As a farmer, I want the yields of my county, so the dry summers are compared with what happened.
- The county of the place is found and its corn and soybean yields are read from USDA NASS QuickStats.
- The yield against trend follows [method.md](method.md).

**FA-7. Questions about my place**
As a farmer, I want to ask about my place and get answers checked against its data.
- The evidence bundle is built from the data of the place.
- The verifier is unchanged: every number must come from the cited evidence.


Added 2026-11-15: NDVI and VCI per summer (NASA MODIS MOD13Q1 via ORNL DAAC, 2001 to last year) in GET /place and POST /zone, shown in the panel, the printed report and the evidence the AI can cite. VCI = 100 * (summer NDVI - minimum) / (maximum - minimum) over the years on record, at one 250 m pixel.

Added 2026-11-15, after testing: the MODIS service once took 204 s and CropScape 38 s for a field, past the 90 s the page waits, so a question then had no evidence. MODIS now stops at 25 s and CropScape at 20 s (16 queries at a time); years that did not answer are left empty, and answers are kept for a day. A field analysis took 13 to 20 s afterwards. The Cloud Run request timeout went from 30 s to 90 s.
