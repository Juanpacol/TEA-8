# Contracts

How the layers of TEA-8 talk to each other, and who owns what. Related: [user-stories.md](user-stories.md).

## Data file

- Schema: [`pipeline/schema/tea8.schema.json`](../pipeline/schema/tea8.schema.json) (JSON Schema 2020-12).
- Sample: `web/public/data/sample.json`, labeled `"simulated": true`. The web app builds against it until the pipeline writes real data (BE-4).
- Check a file: `python pipeline/schema/validate.py [file ...]` (no arguments checks every file in `web/public/data/`). Needs `pip install -r pipeline/requirements.txt`.

Rules baked into the schema:
- Every number is a `figure`: value, unit, source, parameter and query date. Unknown data is `value: null`, never zero.
- Every sentence is a `statement` with an `origin`: `nasa_data`, `platform_calculation`, `model_text`, `citation` (a source that was opened and read) or `citation_to_verify` (one that was not).
- There are exactly three rotations. Alternatives have `hypothetical: true`.
- **The pipeline computes the rotations and their rules.** The web app only displays and compares what the file contains. Rotation logic in `web/` (`rules.ts`, `compare.ts`) works on the data in this file and does not decide agronomy.

## `/ask`

`POST /ask`

Request:
```json
{ "question": "string, 1 to 500 characters", "rotation_id": "optional rotation id" }
```

Response (200):
```json
{
  "answered": true,
  "answer": "the verified claims joined; the fixed sentence 'The project data does not cover this question.' when none",
  "claims": [
    {
      "text": "Summer 2012 root-zone wetness was 0.51.",
      "evidence_keys": ["season.2012.root_wetness"],
      "origins": ["nasa_data"],
      "citations": [],
      "checks": [
        { "name": "cites_evidence", "passed": true },
        { "name": "keys_exist", "passed": true },
        { "name": "numbers_match", "passed": true }
      ],
      "verified": true
    }
  ],
  "notice": "This tool supports, and does not replace, local agricultural expertise.",
  "prompt_version": "ask-v1"
}
```

- The model may cite only keys of the evidence bundle built from the data file (`season.<year>.<figure>`, where the figure may also be `drought_monitor` or `smap_root_zone` for the years that have them, `soil.<point>.*`, `crop.<point>.<year>`, `rotation.<id>`, `exposure.<id>`, `rule.<id>`, `limit.<n>`).
- A claim is `verified` only when it cites at least one key, every key exists and every number in the claim appears in the cited evidence. The `checks` show that process and the web app displays them. Unverified claims are shown flagged, never hidden, and are left out of `answer`.
- `answered` is false when the data does not cover the question or no claim could be verified.
- Wording that names a best option, gives a final score or tells the farmer what to plant is rejected; the model gets one retry.
- Errors: `{ "error": { "code", "message" } }` with 400 (bad request), 429 (`DAILY_LIMIT`: the cap of questions per day, `DAILY_ASK_LIMIT`, default 300, was reached), 502 (model failed or broke the rules), 503 (no API key) or 504 (timeout, 24 s in total). The web app falls back to the pre-generated explanations on any error or slow answer.
- The service reads its own copy of the data, `api/data/summary.json`, written by `pipeline/summarize/build.py` together with the web copy.

## Ownership

| Path | Owner | Notes |
|---|---|---|
| `pipeline/`, `api/` | backend worktree | |
| `pipeline/schema/` | backend worktree | Changed only through a pull request that also updates the sample |
| `web/public/data/` | backend worktree | The pipeline output lands here |
| `web/src/` | frontend worktree | |
| `.github/`, hosting config | deploy worktree | |

Every pull request that changes the schema must keep `sample.json` valid.

## GET /place

Evidence for one point, asked from the sources at request time (story FA-2 in [field-analysis-stories.md](field-analysis-stories.md)). Nothing about the place is stored.

`GET /place?lat=38.5&lon=-98.8`

```json
{
  "place": { "lat": 38.5, "lon": -98.8 },
  "queried_on": "2026-11-15",
  "climate": { "baseline": "2001-2023", "seasons": [{ "year": 2012, "root_wetness": 0.42, "root_wetness_deviation": -1.18, "rainfall_mm_day": 1.9, "temperature_c": 27.1, "dry": true }], "dry_years": [2011, 2012], "source": "...", "note": "..." },
  "soil": { "name": "Harney", "component_pct": 97.0, "drainage": "Well drained", "hydrologic_group": "C", "organic_matter_pct": 2.3, "available_water": 0.22, "source": "..." },
  "crops": { "years": { "2008": "Winter Wheat" }, "source": "...", "note": "..." },
  "vegetation": { "range": "2001-2025", "seasons": [{ "year": 2012, "ndvi": 0.32, "vci": 2 }], "source": "...", "note": "..." },
  "limits": ["..."]
}
```

- A source that does not answer is `{ "error": "..." }` in its place; the others are still returned. `soil` is `null` when the survey has nothing at the point.
- Errors: 400 `BAD_REQUEST` (lat or lon missing or not a number), 400 `OUTSIDE_COVERAGE` (outside the contiguous United States), 429 (rate limit).
- `vegetation`: the mean NDVI of the June to August MODIS composites for each summer, and its VCI = 100 × (NDVI − lowest) ÷ (highest − lowest) over the summers on record, at one 250 m pixel. Years that did not answer within 25 s are left out; with fewer than 10 summers the field is `{ "error": ... }`.
- The example values of `seasons` are illustrative; the dry-summer rule is the one in [method.md](method.md), computed for the grid cell of the point.

## POST /zone

Evidence for a field outline (story FA-4). Body: `{ "corners": [[lat, lon], ...] }`, 3 to 200 corners, at most 16 KB. Nothing about the field is stored.

- `zone`: number of corners, area in hectares and the center used for the climate.
- `soil`: `{ "soils": [{ "name", "drainage", "hydrologic_group", "share_pct" }], "source", "note" }`, the major soil components of USDA SSURGO intersected with the outline, as a share of the field area (shares under 1% are left out). `null` when the survey has nothing inside.
- `crops`: `{ "points", "years": { "2008": { "Corn": 3, "Soybeans": 2 } }, "source", "note" }`, the crop at up to 5 points sampled inside the outline.
- `climate` and `vegetation`: as in `GET /place`, for the NASA POWER cell and the MODIS pixel of the center.
- A source that does not answer is `{ "error": "..." }` in its place.
- Errors: 400 `BAD_REQUEST` (not 3 to 200 corners, or smaller than 100 m²), 400 `OUTSIDE_COVERAGE`, 400 `TOO_LARGE` (over 50 km²), 413 (body too large), 429.

## POST /ask about a place or a field

The body may carry `"place": { "lat", "lon" }` or `"zone": [[lat, lon], ...]` (story FA-7). The evidence bundle is then built from the answer of `GET /place` or `POST /zone` (kept in memory for an hour when every source answered), the bundle also holds `season.<year>.ndvi` and `season.<year>.vci`, the prompt names "the place the farmer chose" or "the field the farmer drew" instead of McLean County, and `rotation_id` is ignored. The verifier is unchanged. Without either field the endpoint behaves as before (`ask-v1`).

- Extra errors: the refusals of `/place` and `/zone` are passed on (400 `OUTSIDE_COVERAGE`, `TOO_LARGE`, `BAD_REQUEST`), and 502 `NO_EVIDENCE` when no source answered for the place.
- Body limit for `/ask` and `/zone`: 16 KB.
