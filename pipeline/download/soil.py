"""Download the top-layer soil of the dominant component from USDA SSURGO.

Usage: python -m pipeline.download.soil
Writes pipeline/output/raw/soil.json.
"""

import json
import urllib.request
from datetime import date

from pipeline.download.http import request
from pipeline.download.power import RAW_DIR
from pipeline.points import CASE_POINTS

URL = "https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest"
QUERY = """SELECT TOP 1 c.compname, c.comppct_r, c.drainagecl, c.hydgrp, h.om_r, h.awc_r
FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point({lon} {lat})') m
INNER JOIN component c ON c.mukey = m.mukey
INNER JOIN chorizon h ON h.cokey = c.cokey
WHERE c.majcompflag = 'Yes'
ORDER BY c.comppct_r DESC, h.hzdept_r ASC"""
FIELDS = ("name", "component_pct", "drainage", "hydrologic_group", "organic_matter", "available_water")


def parse_row(table: list) -> dict:
    if not table:
        return {}
    row = table[0]
    return {k: (None if v is None else v) for k, v in zip(FIELDS, row)}


def fetch_soil(lon: float, lat: float) -> dict:
    payload = json.dumps({"query": QUERY.format(lon=lon, lat=lat), "format": "JSON"}).encode()
    req = urllib.request.Request(URL, payload, {"Content-Type": "application/json"})
    return parse_row(json.loads(request(req)).get("Table", []))


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    result = {"queried_on": date.today().isoformat(), "points": {}}
    for point_id, point in CASE_POINTS.items():
        result["points"][point_id] = fetch_soil(point["lon"], point["lat"])
        print(point_id, result["points"][point_id])
    (RAW_DIR / "soil.json").write_text(json.dumps(result), encoding="utf-8")


if __name__ == "__main__":
    main()
