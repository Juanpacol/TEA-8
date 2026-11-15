"""POST /zone: the evidence for a field the person drew or loaded.

Soil: the soil types inside the outline and the share of the field each one
covers (USDA SSURGO, intersected on the server of Soil Data Access).
Crops: the crop of each year at a few points sampled inside the outline
(USDA CropScape). Climate: the NASA POWER cell of the center of the field.
Nothing about the field is stored.
"""

import json
import math
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date

from place import sources
from place.service import UNAVAILABLE, US, _safe, error

MAX_CORNERS = 200
MAX_AREA_KM2 = 50.0
MIN_AREA_M2 = 100.0
SAMPLES = 5
EARTH_RADIUS_M = 6_371_008.8

ZONE_SOIL_QUERY = """~DeclareGeometry(@aoi)~
select @aoi = geometry::STPolyFromText('{wkt}', 4326)
select P.mukey, sum(geography::STGeomFromWKB(P.mupolygongeo.STIntersection(@aoi).STAsBinary(), 4326).MakeValid().STArea()) as area_m2
into #a from mupolygon P where P.mupolygongeo.STIntersects(@aoi) = 1 group by P.mukey
select c.compname, c.drainagecl, c.hydgrp, sum(a.area_m2 * c.comppct_r / 100.0) as area_m2
from #a a inner join component c on c.mukey = a.mukey where c.majcompflag = 'Yes'
group by c.compname, c.drainagecl, c.hydgrp order by area_m2 desc"""


def area_m2(corners):
    """Spherical excess of the outline, as the web app computes it."""
    total = 0.0
    for i, (lat_a, lon_a) in enumerate(corners):
        lat_b, lon_b = corners[(i + 1) % len(corners)]
        total += math.radians(lon_b - lon_a) * (2 + math.sin(math.radians(lat_a)) + math.sin(math.radians(lat_b)))
    return abs(total * EARTH_RADIUS_M ** 2 / 2)


def inside(lat, lon, corners):
    """Ray casting: is the point inside the outline?"""
    found = False
    for i, (lat_a, lon_a) in enumerate(corners):
        lat_b, lon_b = corners[i - 1]
        if (lat_a > lat) != (lat_b > lat) and lon < (lon_b - lon_a) * (lat - lat_a) / (lat_b - lat_a) + lon_a:
            found = not found
    return found


def sample_points(corners, count=SAMPLES):
    """Up to `count` points inside the outline: the center if it falls inside, then a grid over the field."""
    lats, lons = [c[0] for c in corners], [c[1] for c in corners]
    center = (sum(lats) / len(lats), sum(lons) / len(lons))
    points = [center] if inside(*center, corners) else []
    for size in range(3, 12):
        for i in range(size):
            for j in range(size):
                lat = min(lats) + (max(lats) - min(lats)) * (i + 0.5) / size
                lon = min(lons) + (max(lons) - min(lons)) * (j + 0.5) / size
                if inside(lat, lon, corners) and (lat, lon) not in points:
                    points.append((lat, lon))
        if len(points) >= count:
            break
    if len(points) <= count:
        return points
    step = len(points) / count
    return [points[int(k * step)] for k in range(count)]


def parse_corners(body):
    try:
        raw = json.loads(body or b"{}").get("corners")
        corners = [(float(lat), float(lon)) for lat, lon in raw]
    except (ValueError, TypeError, AttributeError):
        return None
    if corners and corners[0] == corners[-1]:
        corners = corners[:-1]
    if not 3 <= len(corners) <= MAX_CORNERS:
        return None
    if any(not (math.isfinite(lat) and math.isfinite(lon)) for lat, lon in corners):
        return None
    return [(round(lat, 6), round(lon, 6)) for lat, lon in corners]


def wkt(corners):
    ring = corners + [corners[0]]
    return "POLYGON((" + ", ".join(f"{lon} {lat}" for lat, lon in ring) + "))"


def zone_soil(corners, field_m2):
    payload = json.dumps({"query": ZONE_SOIL_QUERY.format(wkt=wkt(corners)), "format": "JSON"}).encode()
    req = urllib.request.Request(sources.SOIL_URL, payload, {"Content-Type": "application/json"})
    table = json.loads(sources.fetch(req, timeout=40)).get("Table", [])
    soils = []
    for name, drainage, group, area in table:
        share = 100 * float(area) / field_m2
        if share >= 1:
            soils.append({"name": name, "drainage": drainage, "hydrologic_group": group, "share_pct": round(share)})
    if not soils:
        return None
    return {
        "soils": soils,
        "source": "USDA Soil Data Access (SSURGO), major soil components intersected with the outline",
        "note": "Shares of the field area; minor soils and unmapped land (towns, water) are left out, so they may add up to less than 100.",
    }


def zone_crops(corners):
    points = sample_points(corners)
    years = list(range(sources.CROP_YEARS[0], sources.CROP_YEARS[1] + 1))
    jobs = [(lat, lon, year) for lat, lon in points for year in years]
    found = sources.crops_at(jobs)
    if all(crop is None for crop in found):
        raise OSError("CropScape gave no answer")
    by_year = {}
    for (_, _, year), crop in zip(jobs, found):
        if crop is not None:
            counts = by_year.setdefault(str(year), {})
            counts[crop] = counts.get(crop, 0) + 1
    return {
        "points": len(points),
        "years": {str(y): by_year.get(str(y), {}) for y in years},
        "source": "USDA CropScape (Cropland Data Layer), 30 m pixels at points sampled inside the outline",
        "note": f"The crop at {len(points)} points inside the field, not a full count of its area.",
    }


def handle_zone(body, today=None, climate=None, soil=None, crops=None, vegetation=None):
    corners = parse_corners(body)
    if corners is None:
        return error(400, "BAD_REQUEST", f"corners must be 3 to {MAX_CORNERS} [lat, lon] pairs")
    if not all(US["south"] <= lat <= US["north"] and US["west"] <= lon <= US["east"] for lat, lon in corners):
        return error(400, "OUTSIDE_COVERAGE", "This tool has data only for the contiguous United States.")
    field_m2 = area_m2(corners)
    if field_m2 < MIN_AREA_M2:
        return error(400, "BAD_REQUEST", "The outline is too small to be a field.")
    if field_m2 > MAX_AREA_KM2 * 1e6:
        return error(400, "TOO_LARGE", f"The outline is larger than {MAX_AREA_KM2:g} km2. Draw one field at a time.")
    today = today or date.today()
    lat_c = sum(c[0] for c in corners) / len(corners)
    lon_c = sum(c[1] for c in corners) / len(corners)
    climate = climate or (lambda: sources.climate(lat_c, lon_c, today.year - 1))
    soil = soil or (lambda: zone_soil(corners, field_m2))
    crops = crops or (lambda: zone_crops(corners))
    vegetation = vegetation or (lambda: sources.vegetation(lat_c, lon_c, today.year - 1))
    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs = [pool.submit(_safe, job) for job in (climate, soil, crops, vegetation)]
        return 200, {
            "zone": {"corners": len(corners), "area_ha": round(field_m2 / 1e4, 1), "center": {"lat": round(lat_c, 5), "lon": round(lon_c, 5)}},
            "queried_on": today.isoformat(),
            "climate": jobs[0].result(),
            "soil": jobs[1].result(),
            "crops": jobs[2].result(),
            "vegetation": jobs[3].result(),
            "limits": [
                "Climate is one value for a grid cell of about 50 km around the center of the field: it describes the area, not the field.",
                "Soil shares come from the soil survey map, not from samples taken in the field.",
                "Crops are read at a few points inside the field, not over its whole area.",
                "NDVI and VCI are read at one 250 m pixel at the center of the field.",
                "No yields are given for this field.",
                "This supports a decision and does not replace local expertise.",
            ],
        }


__all__ = ["handle_zone", "UNAVAILABLE"]
