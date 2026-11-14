"""Build the final data file from the raw downloads.

Usage: python -m pipeline.summarize.build
Reads pipeline/output/raw/, writes web/public/data/summary.json and validates it.

Rotations and their sourced rules come from pipeline/rotations/rotations.json.
Their explanations are generated from templates by pipeline/explain/.
"""

import json
import statistics
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator

from pipeline.explain.templates import explain
from pipeline.download.power import RAW_DIR, START_YEAR, summer_mean
from pipeline.points import CASE_POINTS

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "pipeline" / "schema" / "tea8.schema.json"
ROTATIONS = ROOT / "pipeline" / "rotations" / "rotations.json"
OUTPUT = ROOT / "web" / "public" / "data" / "summary.json"
API_COPY = ROOT / "api" / "data" / "summary.json"  # the api image carries its own copy
BASELINE_YEARS = range(2001, 2024)
CLIMATE_POINT = "point-a"


def figure(value, unit, source, parameter, queried_on):
    return {"value": value, "unit": unit, "source": source, "parameter": parameter, "queried_on": queried_on}


def deviation(value, baseline):
    """Standard deviations from the baseline mean, or None if unknown."""
    if value is None:
        return None
    return (value - statistics.fmean(baseline)) / statistics.pstdev(baseline)


def rounded(value, digits):
    return None if value is None else round(value, digits)


def build_seasons(power: dict) -> list:
    queried_on = power["queried_on"]
    series = power["properties"]["parameter"]
    wetness = {y: summer_mean(series["GWETROOT"], y) for y in range(START_YEAR, 2027)}
    baseline = [wetness[y] for y in BASELINE_YEARS]
    seasons = []
    for year, value in wetness.items():
        seasons.append({
            "year": year,
            "root_wetness": figure(rounded(value, 2), "fraction", "NASA POWER", "GWETROOT", queried_on),
            "root_wetness_deviation": figure(
                rounded(deviation(value, baseline), 2),
                "standard deviations vs 2001-2023", "NASA POWER", "GWETROOT", queried_on),
            "rainfall": figure(rounded(summer_mean(series["PRECTOTCORR"], year), 2),
                               "mm/day", "NASA POWER", "PRECTOTCORR", queried_on),
            "temperature": figure(rounded(summer_mean(series["T2M"], year), 1),
                                  "°C", "NASA POWER", "T2M", queried_on),
        })
    return seasons


def number(text):
    return None if text is None else float(text)


def build_case_points(crops: dict, soil: dict) -> list:
    points = []
    for point_id, point in CASE_POINTS.items():
        s = soil["points"][point_id]
        src = "USDA Soil Data Access (SSURGO)"
        points.append({
            "id": point_id, "label": point["label"], "lon": point["lon"], "lat": point["lat"],
            "soil": {
                "name": s["name"], "drainage": s["drainage"], "hydrologic_group": s["hydrologic_group"],
                "organic_matter": figure(number(s["organic_matter"]), "%", src, "om_r", soil["queried_on"]),
                "available_water": figure(number(s["available_water"]), "cm/cm", src, "awc_r", soil["queried_on"]),
            },
            "crop_history": [
                {"year": int(year), "crop": crop, "source": "CropScape (CDL)", "queried_on": crops["queried_on"]}
                for year, crop in crops["points"][point_id].items()
            ],
        })
    return points


def build_rotations(seasons: list) -> list:
    rotations = json.loads(ROTATIONS.read_text(encoding="utf-8"))["rotations"]
    for rotation in rotations:
        rotation["explanation"] = explain(rotation, seasons, rotations)
    return rotations


def build() -> dict:
    load = lambda name: json.loads((RAW_DIR / name).read_text(encoding="utf-8"))
    seasons = build_seasons(load(f"power_{CLIMATE_POINT}.json"))
    return {
        "schema_version": "1",
        "simulated": False,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "region": {"name": "McLean County", "state": "Illinois",
                   "case_points": build_case_points(load("crops.json"), load("soil.json"))},
        "seasons": seasons,
        "rotations": build_rotations(seasons),
        "limits": [
            "NASA POWER uses a grid of about 50 km: it represents the area, not the plot.",
            "Climate figures are for point A only and summarize June to August.",
            "There are no yields: comparisons measure stress and exposure, not outcomes.",
            "Alternative rotations are hypothetical: they do not exist in the observed fields and rest on the cited studies.",
        ],
    }


def main() -> None:
    data = build()
    errors = list(Draft202012Validator(json.loads(SCHEMA.read_text(encoding="utf-8"))).iter_errors(data))
    for e in errors:
        print("/".join(map(str, e.absolute_path)), e.message)
    if errors:
        raise SystemExit(1)
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    for target in (OUTPUT, API_COPY):
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
    s2012 = next(s for s in data["seasons"] if s["year"] == 2012)
    print(f"wrote {OUTPUT.name}; 2012 wetness {s2012['root_wetness']['value']}, "
          f"deviation {s2012['root_wetness_deviation']['value']}")


if __name__ == "__main__":
    main()
