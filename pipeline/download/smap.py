"""Read NASA SMAP root-zone soil moisture at the climate point from NASA GIBS tiles.

Usage: python -m pipeline.download.smap
Writes pipeline/output/raw/smap_<point-id>.json. GIBS serves SMAP Level 4 root-zone soil moisture as
colored map tiles, one per day since 2015, with no account needed. Each color stands for a range of
values (the layer's published color map, steps of 0.003 m3/m3), so a pixel is turned back into a number
by looking its color up. One pixel is a grid cell of about 9 km, the product's own resolution.
SMAP L4 is a land model corrected with SMAP satellite measurements, not a raw measurement.
"""

import io
import json
import math
import re
import urllib.error
from datetime import date, timedelta
from urllib.request import Request

from PIL import Image

from pipeline.download.http import request
from pipeline.download.power import RAW_DIR
from pipeline.points import CASE_POINTS
from pipeline.region import REGION

LAYER = "SMAP_L4_Analyzed_Root_Zone_Soil_Moisture"
TILE_URL = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{day}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png"
COLORMAP_URL = "https://gibs.earthdata.nasa.gov/colormaps/v1.3/SMAP_Analyzed_Soil_Moisture.xml"
ZOOM = 6  # the finest level this layer is published at
FIRST_YEAR = 2015  # SMAP data start in March 2015
SAMPLE_EVERY_DAYS = 7  # one tile a week from June 1 to August 31: 14 samples per summer
STEP = 0.003  # width of one color step, in m3/m3

ENTRY = re.compile(r'<ColorMapEntry rgb="(\d+),(\d+),(\d+)"[^>]*? value="([^"]*)"')
RANGE = re.compile(r"\[([-\d.]+),([^)]*)\)")


def parse_colormap(xml: str) -> dict:
    """Maps each (r, g, b) color to the middle of the value range it stands for. The no-data color is left out."""
    colors = {}
    for r, g, b, text in ENTRY.findall(xml):
        found = RANGE.fullmatch(text)
        if not found:
            continue
        low = float(found.group(1))
        high = low + STEP if "INF" in found.group(2) else float(found.group(2))
        colors[(int(r), int(g), int(b))] = round((low + high) / 2, 4)
    return colors


def tile_pixel(lat: float, lon: float, zoom: int = ZOOM) -> dict:
    """The web-map tile that holds a point and the pixel of the point inside that 256 x 256 tile."""
    n = 2 ** zoom
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return {"x": int(x), "y": int(y), "px": int((x % 1) * 256), "py": int((y % 1) * 256)}


def value_at(png: bytes, pixel: dict, colors: dict):
    """The soil moisture (m3/m3) under a pixel, or None when it is transparent or its color is unknown."""
    r, g, b, a = Image.open(io.BytesIO(png)).convert("RGBA").getpixel((pixel["px"], pixel["py"]))
    return colors.get((r, g, b)) if a else None


def sample_days(year: int) -> list:
    day, days = date(year, 6, 1), []
    while day <= date(year, 8, 31):
        days.append(day)
        day += timedelta(days=SAMPLE_EVERY_DAYS)
    return days


def fetch_tile(day: date, tile: dict):
    url = TILE_URL.format(layer=LAYER, day=day.isoformat(), z=ZOOM, y=tile["y"], x=tile["x"])
    try:
        return request(Request(url))
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None  # no tile for that day
        raise


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    point = CASE_POINTS[REGION["climate_point"]]
    tile = tile_pixel(point["lat"], point["lon"])
    colors = parse_colormap(request(Request(COLORMAP_URL)).decode("utf-8"))
    today = date.today()
    years = {}
    for year in range(FIRST_YEAR, today.year + 1):
        values = []
        for day in sample_days(year):
            if day > today:
                continue
            png = fetch_tile(day, tile)
            value = value_at(png, tile, colors) if png else None
            if value is not None:
                values.append({"date": day.isoformat(), "value": value})
        years[str(year)] = values
        print(year, len(values), "samples")
    out = RAW_DIR / f"smap_{REGION['climate_point']}.json"
    out.write_text(json.dumps({"queried_on": today.isoformat(), "layer": LAYER, "zoom": ZOOM, "tile": tile, "years": years}), encoding="utf-8")
    print("saved", out)


if __name__ == "__main__":
    main()
