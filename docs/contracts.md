# Contracts

How the layers of TEA-8 talk to each other, and who owns what. Related: [user-stories.md](user-stories.md).

## Data file

- Schema: [`pipeline/schema/tea8.schema.json`](../pipeline/schema/tea8.schema.json) (JSON Schema 2020-12).
- Sample: `web/public/data/sample.json`, labeled `"simulated": true`. The web app builds against it until the pipeline writes real data (BE-4).
- Check a file: `python pipeline/schema/validate.py [file ...]` (no arguments checks every file in `web/public/data/`). Needs `pip install -r pipeline/requirements.txt`.

Rules baked into the schema:
- Every number is a `figure`: value, unit, source, parameter and query date. Unknown data is `value: null`, never zero.
- Every sentence is a `statement` with an `origin`: `nasa_data`, `platform_calculation`, `model_text` or `citation_to_verify`.
- There are exactly three rotations. Alternatives have `hypothetical: true`.
- **The pipeline computes the rotations and their rules.** The web app only displays and compares what the file contains. Rotation logic in `web/` (`rules.ts`, `compare.ts`) works on the data in this file and does not decide agronomy.

## `/ask` (draft, finalized in BE-7)

`POST /ask`

Request:
```json
{ "question": "string, at most 500 characters", "rotation_id": "optional rotation id" }
```

Response:
```json
{
  "answered": true,
  "answer": "string",
  "origin": "model_text",
  "sources": ["ids or names of the data the answer used"]
}
```

When the project data does not cover the question, the service returns `"answered": false` and an `answer` that says it does not know. The web app falls back to the pre-generated explanations when the call fails or is slow.

## Ownership

| Path | Owner | Notes |
|---|---|---|
| `pipeline/`, `api/` | backend worktree | |
| `pipeline/schema/` | backend worktree | Changed only through a pull request that also updates the sample |
| `web/public/data/` | backend worktree | The pipeline output lands here |
| `web/src/` | frontend worktree | |
| `.github/`, hosting config | deploy worktree | |

Every pull request that changes the schema must keep `sample.json` valid.
