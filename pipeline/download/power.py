"""Download monthly NASA POWER climate data for the case points.

Usage: python -m pipeline.download.power
Writes raw responses to pipeline/output/raw/power_<point-id>.json and prints
the summer 2012 root-zone wetness at point A as a check against the README.
"""

import json
import statistics
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

from pipeline.points import CASE_POINTS

API_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"
PARAMETERS = ["GWETROOT", "PRECTOTCORR", "T2M"]
START_YEAR, END_YEAR = 2001, 2026
SUMMER_MONTHS = ("06", "07", "08")
RAW_DIR = Path(__file__).resolve().parents[1] / "output" / "raw"


def fetch_point(lon: float, lat: float) -> dict:
    query = urllib.parse.urlencode({
        "parameters": ",".join(PARAMETERS),
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": START_YEAR,
        "end": END_YEAR,
        "format": "JSON",
    })
    with urllib.request.urlopen(f"{API_URL}?{query}", timeout=60) as response:
        return json.load(response)


def summer_mean(monthly: dict, year: int):
    """Mean of June to August for one year, or None if any month is missing.

    POWER marks missing values with -999; they are never averaged in.
    """
    values = [monthly.get(f"{year}{m}") for m in SUMMER_MONTHS]
    if any(v is None or v == -999 for v in values):
        return None
    return statistics.fmean(values)


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    for point_id, point in CASE_POINTS.items():
        data = fetch_point(point["lon"], point["lat"])
        data["queried_on"] = today
        (RAW_DIR / f"power_{point_id}.json").write_text(json.dumps(data), encoding="utf-8")
        print(f"saved {point_id}")
    point_a = json.loads((RAW_DIR / "power_point-a.json").read_text(encoding="utf-8"))
    wetness = summer_mean(point_a["properties"]["parameter"]["GWETROOT"], 2012)
    print(f"Summer 2012 root wetness at point A: {wetness:.2f}")


if __name__ == "__main__":
    main()
