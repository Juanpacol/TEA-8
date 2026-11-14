"""Download the soil map-unit polygons around each case point from USDA SSURGO.

Usage: python -m pipeline.download.soil_zones
Writes web/src/features/map/soil-zones.json: for every case point, the soil zones
(polygons) in a small window around it, simplified so the file stays small, and the
zone that holds the point. Only the outer ring of each polygon is kept.
"""

import json
import math
import re
import urllib.request
from datetime import date
from pathlib import Path

from pipeline.download.http import request
from pipeline.points import CASE_POINTS

URL = "https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest"
OUT = Path(__file__).resolve().parents[2] / "web" / "src" / "features" / "map" / "soil-zones.json"
HALF_LAT, HALF_LON = 0.012, 0.015  # about 1.3 km each way
TOLERANCE_M = 4.0  # simplification: shapes move by at most this much
DECIMALS = 5  # about 1 m

ZONES_QUERY = """SELECT mp.mupolygonkey, mu.muname, mp.mupolygongeo.STAsText()
FROM mapunit mu INNER JOIN mupolygon mp ON mp.mukey = mu.mukey
WHERE mp.mupolygonkey IN (SELECT * FROM SDA_Get_Mupolygonkey_from_intersection_with_WktWgs84('{box}'))"""
POINT_QUERY = "SELECT * FROM SDA_Get_Mupolygonkey_from_intersection_with_WktWgs84('point({lon} {lat})')"


def sql(query: str) -> list:
    payload = json.dumps({"query": query, "format": "JSON"}).encode()
    req = urllib.request.Request(URL, payload, {"Content-Type": "application/json"})
    return json.loads(request(req)).get("Table", [])


def outer_rings(wkt: str) -> list[list[tuple[float, float]]]:
    """The outer ring (first ring) of each polygon in a POLYGON or MULTIPOLYGON text."""
    rings, rings_seen = [], [0]  # rings_seen[-1]: rings read so far in the polygon being read
    i = 0
    while i < len(wkt):
        char = wkt[i]
        if char == "(":
            j = i + 1
            while wkt[j] == " ":
                j += 1
            if wkt[j] in "-0123456789":  # a ring of coordinates
                end = wkt.index(")", j)
                if rings_seen[-1] == 0:
                    rings.append([tuple(map(float, pair.split())) for pair in wkt[j:end].split(",")])
                rings_seen[-1] += 1
                i = end
            else:  # a polygon, or the list of polygons
                rings_seen.append(0)
        elif char == ")":
            rings_seen.pop()
            if not rings_seen:
                rings_seen = [0]
        i += 1
    return rings


def _distance_m(p, a, b, lat0: float) -> float:
    kx, ky = 111320 * math.cos(math.radians(lat0)), 110574
    px, py, ax, ay, bx, by = p[0] * kx, p[1] * ky, a[0] * kx, a[1] * ky, b[0] * kx, b[1] * ky
    dx, dy = bx - ax, by - ay
    if dx == dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def simplify(points: list, tolerance: float, lat0: float) -> list:
    """Douglas-Peucker: drop points that sit within `tolerance` meters of the line between their neighbours."""
    if len(points) < 3:
        return points
    index, worst = 0, 0.0
    for i in range(1, len(points) - 1):
        d = _distance_m(points[i], points[0], points[-1], lat0)
        if d > worst:
            index, worst = i, d
    if worst <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[: index + 1], tolerance, lat0)[:-1] + simplify(points[index:], tolerance, lat0)


def clip(ring: list, west: float, south: float, east: float, north: float) -> list:
    """Sutherland-Hodgman: keep the part of a ring inside the window, so far-reaching zones stay small."""
    edges = [
        (lambda p: p[0] >= west, lambda a, b: (west, a[1] + (b[1] - a[1]) * (west - a[0]) / (b[0] - a[0]))),
        (lambda p: p[0] <= east, lambda a, b: (east, a[1] + (b[1] - a[1]) * (east - a[0]) / (b[0] - a[0]))),
        (lambda p: p[1] >= south, lambda a, b: (a[0] + (b[0] - a[0]) * (south - a[1]) / (b[1] - a[1]), south)),
        (lambda p: p[1] <= north, lambda a, b: (a[0] + (b[0] - a[0]) * (north - a[1]) / (b[1] - a[1]), north)),
    ]
    for inside, cross in edges:
        if not ring:
            break
        kept, previous = [], ring[-1]
        for current in ring:
            if inside(current):
                if not inside(previous):
                    kept.append(cross(previous, current))
                kept.append(current)
            elif inside(previous):
                kept.append(cross(previous, current))
            previous = current
        ring = kept
    return ring


def build_point(point: dict) -> dict:
    lon, lat = point["lon"], point["lat"]
    box = (f"POLYGON(({lon - HALF_LON} {lat - HALF_LAT},{lon + HALF_LON} {lat - HALF_LAT},"
           f"{lon + HALF_LON} {lat + HALF_LAT},{lon - HALF_LON} {lat + HALF_LAT},{lon - HALF_LON} {lat - HALF_LAT}))")
    holds_point = {row[0] for row in sql(POINT_QUERY.format(lon=lon, lat=lat))}
    zones = []
    for key, name, wkt in sql(ZONES_QUERY.format(box=box)):
        for ring in outer_rings(wkt):
            ring = clip(ring[:-1], lon - HALF_LON, lat - HALF_LAT, lon + HALF_LON, lat + HALF_LAT)
            if len(ring) < 3:
                continue
            ring = simplify(ring + [ring[0]], TOLERANCE_M, lat)
            if len(ring) < 4:
                continue
            zones.append({
                "name": name,
                "holds_point": key in holds_point,
                "ring": [[round(x, DECIMALS), round(y, DECIMALS)] for x, y in ring],
            })
    return {"zones": zones}


def main() -> None:
    result = {
        "source": "USDA NRCS SSURGO soil map units, Soil Data Access",
        "queried_on": date.today().isoformat(),
        "points": {},
    }
    for point_id, point in CASE_POINTS.items():
        result["points"][point_id] = build_point(point)
        zones = result["points"][point_id]["zones"]
        print(point_id, len(zones), "zones,", sum(z["holds_point"] for z in zones), "hold the point")
    OUT.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print("wrote", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
