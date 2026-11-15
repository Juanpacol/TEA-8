"""Live queries for one point: NASA POWER climate, USDA SSURGO soil and USDA CropScape crops.

The same sources and formulas as the data pipeline (see docs/method.md), asked
at request time for the place a person chose. The API image holds only `api/`,
so the few lines shared with `pipeline/download/` are repeated here.
"""

import json
import re
import statistics
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from place.albers import to_conus_albers

POWER_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"
SOIL_URL = "https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest"
CROP_URL = "https://nassgeodata.gmu.edu/axis2/services/CDLService/GetCDLValue"

BASELINE = (2001, 2023)
FIRST_YEAR = 2001
CROP_YEARS = (2008, 2023)
SUMMER_MONTHS = ("06", "07", "08")
DRY_THRESHOLD = -1.0

SOIL_QUERY = """SELECT TOP 1 c.compname, c.comppct_r, c.drainagecl, c.hydgrp, h.om_r, h.awc_r
FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point({lon} {lat})') m
INNER JOIN component c ON c.mukey = m.mukey
INNER JOIN chorizon h ON h.cokey = c.cokey
WHERE c.majcompflag = 'Yes'
ORDER BY c.comppct_r DESC, h.hzdept_r ASC"""
SOIL_FIELDS = ("name", "component_pct", "drainage", "hydrologic_group", "organic_matter_pct", "available_water")
CATEGORY = re.compile(r'category: "([^"]*)"')


def fetch(req, timeout=25, attempts=2):
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read()
        except OSError:
            if attempt == attempts - 1:
                raise
            time.sleep(1)


def summer_mean(monthly, year):
    """Mean of June to August, or None if a month is missing (POWER marks it -999)."""
    values = [monthly.get(f"{year}{m}") for m in SUMMER_MONTHS]
    if any(v is None or v == -999 for v in values):
        return None
    return statistics.fmean(values)


def summarize_climate(parameters, last_year):
    """Summer figures per year and the dry-summer rule of docs/method.md for this grid cell."""
    wet = {y: summer_mean(parameters["GWETROOT"], y) for y in range(FIRST_YEAR, last_year + 1)}
    base = [wet[y] for y in range(BASELINE[0], BASELINE[1] + 1) if wet.get(y) is not None]
    if len(base) < 10:
        raise ValueError("not enough summers in the baseline")
    mean, spread = statistics.fmean(base), statistics.pstdev(base)
    seasons = []
    for year, value in wet.items():
        if value is None:
            continue
        deviation = (value - mean) / spread if spread else None
        rain = summer_mean(parameters["PRECTOTCORR"], year)
        temp = summer_mean(parameters["T2M"], year)
        seasons.append({
            "year": year,
            "root_wetness": round(value, 2),
            "root_wetness_deviation": None if deviation is None else round(deviation, 2),
            "rainfall_mm_day": None if rain is None else round(rain, 2),
            "temperature_c": None if temp is None else round(temp, 1),
            "dry": None if deviation is None else deviation <= DRY_THRESHOLD,
        })
    return {
        "baseline": f"{BASELINE[0]}-{BASELINE[1]}",
        "seasons": seasons,
        "dry_years": [s["year"] for s in seasons if s["dry"]],
        "source": "NASA POWER (GWETROOT, PRECTOTCORR, T2M), monthly, June to August",
        "note": "One value for a grid cell of about 50 km: it describes the area, not the field.",
    }


def climate(lat, lon, last_year):
    query = urllib.parse.urlencode({
        "parameters": "GWETROOT,PRECTOTCORR,T2M", "community": "AG", "longitude": lon, "latitude": lat,
        "start": FIRST_YEAR, "end": last_year, "format": "JSON",
    })
    data = json.loads(fetch(f"{POWER_URL}?{query}"))
    return summarize_climate(data["properties"]["parameter"], last_year)


def parse_soil(table):
    if not table:
        return None
    soil = dict(zip(SOIL_FIELDS, table[0]))
    for key in ("component_pct", "organic_matter_pct", "available_water"):
        soil[key] = None if soil[key] is None else float(soil[key])
    soil["source"] = "USDA Soil Data Access (SSURGO), top layer of the dominant soil at the point"
    return soil


def soil(lat, lon):
    payload = json.dumps({"query": SOIL_QUERY.format(lon=lon, lat=lat), "format": "JSON"}).encode()
    req = urllib.request.Request(SOIL_URL, payload, {"Content-Type": "application/json"})
    return parse_soil(json.loads(fetch(req)).get("Table", []))


def parse_category(xml):
    match = CATEGORY.search(xml)
    return match.group(1) if match else None


def crop_of_year(lat, lon, year):
    x, y = to_conus_albers(lon, lat)
    try:
        return parse_category(fetch(f"{CROP_URL}?year={year}&x={x:.1f}&y={y:.1f}").decode("utf-8"))
    except OSError:
        return None


def crops(lat, lon):
    years = range(CROP_YEARS[0], CROP_YEARS[1] + 1)
    with ThreadPoolExecutor(max_workers=8) as pool:
        found = list(pool.map(lambda year: crop_of_year(lat, lon, year), years))
    if all(crop is None for crop in found):
        raise OSError("CropScape gave no answer")
    return {
        "years": {str(year): crop for year, crop in zip(years, found)},
        "source": "USDA CropScape (Cropland Data Layer), one 30 m pixel at the point",
        "note": "One pixel at the point, not the whole field. A year with no answer is left empty.",
    }
