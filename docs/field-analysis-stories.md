# Field analysis stories

Feedback after the submission: let a person go to their own place and analyze it, instead of two fixed example fields. This set of stories is built on the branch `feat/analyze-any-field`, one story at a time. A story starts only after the previous one is verified.

Related: [user-stories.md](user-stories.md), [method.md](method.md), [contracts.md](contracts.md).

## Rules for every story

- Evidence before advice: the tool shows data, sources and limits. It never says what to plant.
- Each figure names its source. What applies to the area (climate, about 50 km) is not presented as data of the field.
- No accounts and no storage of coordinates on a server. A place lives in the browser, in a link or in a saved report.
- Nothing is merged into `main` until the whole set is reviewed: production stays as submitted.

## Status

| Story | Status |
|---|---|
| FA-1 Go to a place by coordinates | Done. Checked in Chrome on the local build (2026-11-15): text that is not a coordinate and a place in Colombia each showed their message and moved nothing; `41.59, -93.62` moved the map to Des Moines and the place card said there is no data there |
| FA-2 Evidence for one point, queried live | Done on the branch, not deployed. Checked in Chrome against a local API (2026-11-15): `38.5, -98.8` (Kansas) returned in 3 s the dry summers 2011 and 2012, the soil Harney and the crop of 2008 to 2023; downtown Des Moines returned no soil and "Developed" as crop. Not checked: the route on Cloud Run, a source that is down in real use |
| FA-3 Draw a zone point by point | Pending |
| FA-4 Evidence for a drawn zone | Pending |
| FA-5 Report to save and share | Pending |
| FA-6 County yields for any place | Pending (needs a USDA NASS QuickStats key) |
| FA-7 Questions about my place | Pending |

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
- The zone can also be loaded from a KML or GeoJSON file.

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
