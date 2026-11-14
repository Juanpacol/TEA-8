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

- The model may cite only keys of the evidence bundle built from the data file (`season.<year>.<figure>`, `soil.<point>.*`, `crop.<point>.<year>`, `rotation.<id>`, `exposure.<id>`, `rule.<id>`, `limit.<n>`).
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
