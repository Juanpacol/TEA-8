"""Download the weekly US Drought Monitor county statistics, to cross-check the dry summers.

Usage: python -m pipeline.download.drought_monitor
Writes pipeline/output/raw/usdm_<county fips>.json. The service is public and needs no key.
Each weekly record gives the percent of the county area in drought class D0 to D4, cumulative:
"d1" is the share of the county in D1 (moderate drought) or worse.
"""

import json
from datetime import date
from urllib.parse import urlencode
from urllib.request import Request

from pipeline.download.http import request
from pipeline.download.power import RAW_DIR, START_YEAR
from pipeline.region import REGION

URL = "https://usdmdataservices.unl.edu/api/CountyStatistics/GetDroughtSeverityStatisticsByAreaPercent"


def raw_path(fips: str):
    return RAW_DIR / f"usdm_{fips}.json"


def fetch(fips: str, today: date) -> list:
    query = urlencode({
        "aoi": fips, "startdate": f"1/1/{START_YEAR}", "enddate": f"{today.month}/{today.day}/{today.year}",
        "statisticsType": 1,  # 1 = cumulative: d1 is D1 or worse
    })
    return json.loads(request(Request(f"{URL}?{query}", headers={"Accept": "application/json"})))


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    fips = REGION["county_fips"]
    today = date.today()
    weeks = fetch(fips, today)
    raw_path(fips).write_text(json.dumps({"queried_on": today.isoformat(), "weeks": weeks}), encoding="utf-8")
    print(f"{len(weeks)} weekly maps for county {fips}, saved to {raw_path(fips)}")


if __name__ == "__main__":
    main()
