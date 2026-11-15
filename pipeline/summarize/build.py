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
from pipeline.download.drought_monitor import raw_path as drought_path
from pipeline.download.power import RAW_DIR, START_YEAR, summer_mean
from pipeline.points import CASE_POINTS
from pipeline.rotations.exposure import rotation_summer_share
from pipeline.region import REGION
from pipeline.summarize.drought import summer_drought_share
from pipeline.summarize.smap import summer_smap
from pipeline.summarize.yields import build_yields

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "pipeline" / "schema" / "tea8.schema.json"
ROTATIONS = ROOT / "pipeline" / "rotations" / "rotations.json"
CALENDAR = ROOT / "pipeline" / "rotations" / "calendar.json"
OUTPUT = ROOT / "web" / "public" / "data" / "summary.json"
API_COPY = ROOT / "api" / "data" / "summary.json"  # the api image carries its own copy
BASELINE_YEARS = range(REGION["baseline_years"][0], REGION["baseline_years"][1] + 1)
CLIMATE_POINT = REGION["climate_point"]
DRY_THRESHOLD = -1.0  # standard deviations of summer root-zone wetness; a project choice, see DRY_RULE
DRY_RULE = {
    "threshold": DRY_THRESHOLD,
    "unit": "standard deviations of summer root-zone wetness (NASA POWER GWETROOT)",
    "baseline": "2001-2023",
    "rationale": "A summer is dry when its root-zone wetness is at least one standard deviation below the "
                 "2001-2023 mean. The cut is a project choice, not taken from a cited source.",
}


def figure(value, unit, source, parameter, queried_on):
    return {"value": value, "unit": unit, "source": source, "parameter": parameter, "queried_on": queried_on}


def deviation(value, baseline):
    """Standard deviations from the baseline mean, or None if unknown."""
    if value is None:
        return None
    return (value - statistics.fmean(baseline)) / statistics.pstdev(baseline)


def rounded(value, digits):
    return None if value is None else round(value, digits)


def build_seasons(power: dict, drought=None, smap=None) -> list:
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
        share = summer_drought_share(drought["weeks"], year) if drought else None
        if share is not None:
            seasons[-1]["drought_monitor"] = figure(
                share, "percent of the county in drought (D1 or worse), mean of the June-August weekly maps",
                "US Drought Monitor", "county statistics, cumulative D1", drought["queried_on"])
        moisture = summer_smap(smap["years"].get(str(year), [])) if smap else None
        if moisture is not None:
            seasons[-1]["smap_root_zone"] = figure(
                moisture, "m3/m3, mean of weekly samples June-August (about 9 km grid cell)",
                "NASA SMAP L4 via GIBS", "SMAP_L4_Analyzed_Root_Zone_Soil_Moisture", smap["queried_on"])
        dev = seasons[-1]["root_wetness_deviation"]["value"]
        seasons[-1]["dry"] = None if dev is None else dev <= DRY_THRESHOLD
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
    calendar = json.loads(CALENDAR.read_text(encoding="utf-8"))
    for rotation in rotations:
        share = rotation_summer_share(rotation["sequence"], calendar["crops"])
        rotation["summer_field_share"] = figure(
            round(share * 100, 1), "percent of June-August days with a crop in the field", "TEA-8 calculation",
            "USDA NASS Handbook 628 usual planting and harvesting dates, Illinois (1997)", calendar["source"]["queried_on"])
        assumptions = [calendar["crops"][c]["assumption"] for c in rotation["sequence"] if "assumption" in calendar["crops"][c]]
        rotation["explanation"] = explain(rotation, seasons, rotations, assumptions)
    return rotations


def build() -> dict:
    load = lambda name: json.loads((RAW_DIR / name).read_text(encoding="utf-8"))
    load_optional = lambda path: json.loads(path.read_text(encoding="utf-8")) if path.exists() else None
    seasons = build_seasons(load(f"power_{CLIMATE_POINT}.json"), load_optional(drought_path(REGION["county_fips"])),
                            load_optional(RAW_DIR / f"smap_{CLIMATE_POINT}.json"))
    return {
        "schema_version": "1",
        "simulated": False,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "region": {"name": REGION["name"], "state": REGION["state"],
                   "reference_towns": REGION.get("reference_towns", []),
                   "case_points": build_case_points(load("crops.json"), load("soil.json"))},
        "dry_summer_rule": DRY_RULE,
        "seasons": seasons,
        "yields": build_yields({s["year"] for s in seasons if s["dry"]}),
        "rotations": build_rotations(seasons),
        "limits": [
            "NASA POWER uses a grid of about 50 km: it represents the area, not the plot.",
            "Climate figures are for point A only and summarize June to August.",
            "Yields are county averages for corn and soybeans from USDA surveys. They say nothing about each field or each rotation, so comparisons measure stress and exposure, not outcomes.",
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
