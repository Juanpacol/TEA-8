"""GET /place: the evidence the sources hold for one latitude and longitude.

Each source is asked on its own: one that fails is reported as unavailable and
does not hide the others. Nothing about the place is stored.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import date
from urllib.parse import parse_qs

from place import sources

# The contiguous United States, where SSURGO and CropScape have data.
US = {"south": 24.4, "north": 49.4, "west": -125.0, "east": -66.9}
UNAVAILABLE = {"error": "This source did not answer. Try again later."}


def error(status, code, message):
    return status, {"error": {"code": code, "message": message}}


def parse_place(query):
    params = parse_qs(query)
    try:
        lat, lon = float(params["lat"][0]), float(params["lon"][0])
    except (KeyError, ValueError):
        return None
    if not (lat == lat and lon == lon):  # NaN
        return None
    return round(lat, 5), round(lon, 5)


def _safe(job):
    try:
        return job()
    except (OSError, ValueError, KeyError, TypeError):
        return UNAVAILABLE


def handle_place(query, today=None, src=sources):
    place = parse_place(query)
    if place is None:
        return error(400, "BAD_REQUEST", "lat and lon must be numbers")
    lat, lon = place
    if not (US["south"] <= lat <= US["north"] and US["west"] <= lon <= US["east"]):
        return error(400, "OUTSIDE_COVERAGE", "This tool has data only for the contiguous United States.")
    today = today or date.today()
    with ThreadPoolExecutor(max_workers=4) as pool:
        climate = pool.submit(_safe, lambda: src.climate(lat, lon, today.year - 1))
        soil = pool.submit(_safe, lambda: src.soil(lat, lon))
        crops = pool.submit(_safe, lambda: src.crops(lat, lon))
        vegetation = pool.submit(_safe, lambda: src.vegetation(lat, lon, today.year - 1))
        return 200, {
            "place": {"lat": lat, "lon": lon},
            "queried_on": today.isoformat(),
            "climate": climate.result(),
            "soil": soil.result(),
            "crops": crops.result(),
            "vegetation": vegetation.result(),
            "limits": [
                "Climate is one value for a grid cell of about 50 km: it describes the area, not the field.",
                "Soil and crop are read at one point, not over the whole field.",
                "NDVI and VCI are read at one 250 m pixel at the point.",
                "No yields are given for this place.",
                "This supports a decision and does not replace local expertise.",
            ],
        }
