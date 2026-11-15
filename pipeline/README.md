# Pipeline

Python that runs before the demo: downloads the data, summarizes it and writes the JSON file the web app and the API read.

## Run it

From the repository root:

```
python3 -m venv .venv && source .venv/bin/activate
pip install -r pipeline/requirements.txt

python -m pipeline.download.power       # NASA POWER climate, both case points
python -m pipeline.download.soil        # USDA SSURGO soil
python -m pipeline.download.drought_monitor  # US Drought Monitor weekly county maps (cross-check)
python -m pipeline.download.smap        # NASA SMAP root-zone soil moisture from GIBS tiles (cross-check, needs Pillow)
python -m pipeline.download.soil_zones  # soil zone outlines around each point (map)
python -m pipeline.download.cropscape   # CropScape crop history (slow: 32 queries)
python -m pipeline.summarize.build      # validates and writes the data file
```

Raw downloads go to `pipeline/output/raw/` (git-ignored). `build` writes **two identical copies**: `web/public/data/summary.json` and `api/data/summary.json` (the API image carries its own). Commit both together.

## Check it

```
python -m unittest discover -s pipeline/tests -t .
python pipeline/schema/validate.py
```

## Where things are

| Path | What it holds |
|---|---|
| `download/` | One module per source, plus a small HTTP helper with retries |
| `rotations/rotations.json` | The three rotations and their sourced rules |
| `explain/` | Template explanations, one origin label per sentence |
| `summarize/build.py` | Summer means and deviations; assembles and validates the file |
| `schema/` | The JSON Schema and the validator. See [docs/contracts.md](../docs/contracts.md) |

A source is marked `citation` only after it was opened and read; otherwise `citation_to_verify` (see `CONTRIBUTING.md`).
