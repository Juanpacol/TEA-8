"""Download the crop grown each year at the case points from CropScape (CDL).

Usage: python -m pipeline.download.cropscape
Writes pipeline/output/raw/crops.json. A year with no answer is saved as null,
never guessed.
"""

import json
import re
from datetime import date

from pipeline.download.albers import to_conus_albers
from pipeline.download.http import request
from pipeline.download.power import RAW_DIR
from pipeline.points import CASE_POINTS
from pipeline.region import REGION

URL = "https://nassgeodata.gmu.edu/axis2/services/CDLService/GetCDLValue"
YEARS = range(REGION["crop_history_years"][0], REGION["crop_history_years"][1] + 1)
CATEGORY = re.compile(r'category: "([^"]*)"')


def parse_category(xml: str):
    match = CATEGORY.search(xml)
    return match.group(1) if match else None


def fetch_crop(lon: float, lat: float, year: int):
    x, y = to_conus_albers(lon, lat)
    body = request(f"{URL}?year={year}&x={x:.1f}&y={y:.1f}")
    return parse_category(body.decode("utf-8"))


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    result = {"queried_on": date.today().isoformat(), "points": {}}
    for point_id, point in CASE_POINTS.items():
        result["points"][point_id] = {
            str(year): fetch_crop(point["lon"], point["lat"], year) for year in YEARS
        }
        print(point_id, result["points"][point_id])
    (RAW_DIR / "crops.json").write_text(json.dumps(result), encoding="utf-8")


if __name__ == "__main__":
    main()
