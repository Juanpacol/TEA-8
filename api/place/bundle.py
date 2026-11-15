"""Evidence bundle for a place or a field, built from the answer of GET /place or POST /zone.

Same shape as ask.evidence.build_bundle, so the prompt and the verifier are
unchanged: every number a claim writes must appear in the evidence it cites.
"""

import threading
import time
from collections import OrderedDict

from ask.evidence import entry, numbers_in

NASA = "nasa_data"
USDA = "platform_calculation"


def _climate(bundle, climate, where):
    if not isinstance(climate, dict) or "seasons" not in climate:
        return
    for s in climate["seasons"]:
        y = s["year"]
        bundle[f"season.{y}.root_wetness"] = entry(
            f"Summer {y} soil moisture where the roots are, {where}: {s['root_wetness']} on a scale from 0 dry to 1 wet "
            f"(NASA POWER GWETROOT, June to August, a grid cell of about 50 km).", NASA, [s["root_wetness"], float(y), 0.0, 1.0, 50.0])
        if s.get("root_wetness_deviation") is not None:
            dev = s["root_wetness_deviation"]
            bundle[f"season.{y}.root_wetness_deviation"] = entry(
                f"Summer {y} soil moisture deviation from the {climate['baseline']} summers, {where}: {dev} standard deviations.",
                USDA, [abs(dev), float(y)] + numbers_in(climate["baseline"]))
        if s.get("dry") is not None:
            verdict = "dry" if s["dry"] else "not dry"
            bundle[f"season.{y}.dry"] = entry(
                f"Summer {y} counts as {verdict} {where} under the project rule (soil moisture 1 standard deviation or more below the mean).",
                USDA, [float(y), 1.0])
        if s.get("rainfall_mm_day") is not None:
            bundle[f"season.{y}.rainfall"] = entry(
                f"Summer {y} rainfall, {where}: {s['rainfall_mm_day']} mm per day (NASA POWER).", NASA, [s["rainfall_mm_day"], float(y)])
        if s.get("temperature_c") is not None:
            bundle[f"season.{y}.temperature"] = entry(
                f"Summer {y} mean temperature, {where}: {s['temperature_c']} °C (NASA POWER).", NASA, [abs(s["temperature_c"]), float(y)])
    years = ", ".join(str(y) for y in climate["dry_years"]) or "none"
    bundle["climate.dry_years"] = entry(
        f"Dry summers {where} under the project rule, compared with {climate['baseline']}: {years}.",
        USDA, [float(y) for y in climate["dry_years"]] + numbers_in(climate["baseline"]))


def _soil_point(bundle, soil):
    if not isinstance(soil, dict) or "name" not in soil:
        return
    bundle["soil.name"] = entry(
        f"The soil at the point is {soil['name']}, {soil.get('drainage') or 'drainage unknown'}, hydrologic group "
        f"{soil.get('hydrologic_group') or 'unknown'} (USDA SSURGO).", USDA, [])
    if soil.get("organic_matter_pct") is not None:
        bundle["soil.organic_matter"] = entry(
            f"Organic matter of the top soil layer at the point: {soil['organic_matter_pct']} percent (USDA SSURGO).",
            USDA, [soil["organic_matter_pct"]])
    if soil.get("available_water") is not None:
        bundle["soil.available_water"] = entry(
            f"Available water of the top soil layer at the point: {soil['available_water']} cm per cm of soil (USDA SSURGO).",
            USDA, [soil["available_water"]])


def _soil_zone(bundle, soil):
    if not isinstance(soil, dict) or "soils" not in soil:
        return
    for i, s in enumerate(soil["soils"]):
        bundle[f"soil.{i}"] = entry(
            f"{s['name']} soil ({s.get('drainage') or 'drainage unknown'}, hydrologic group {s.get('hydrologic_group') or 'unknown'}) "
            f"covers about {s['share_pct']} percent of the field (USDA SSURGO map).", USDA, [float(s["share_pct"])])


def _crops(bundle, crops, zone):
    if not isinstance(crops, dict) or "years" not in crops:
        return
    for year, value in crops["years"].items():
        if zone:
            if not value:
                continue
            parts = ", ".join(f"{crop} at {n} of {crops['points']} points" for crop, n in value.items())
            bundle[f"crop.{year}"] = entry(f"Crops inside the field in {year}: {parts} (USDA CropScape).",
                                           USDA, [float(year), float(crops["points"])] + [float(n) for n in value.values()])
        elif value:
            bundle[f"crop.{year}"] = entry(f"The point grew {value} in {year} (USDA CropScape).", USDA, [float(year)])


def place_bundle(evidence):
    """Keys like the McLean bundle (season.2012.dry, soil.name, crop.2015, limit.0) for one place or field."""
    zone = "zone" in evidence
    where = "in the area around this field" if zone else "in the area around this place"
    bundle = {}
    _climate(bundle, evidence.get("climate"), where)
    (_soil_zone if zone else _soil_point)(bundle, evidence.get("soil"))
    _crops(bundle, evidence.get("crops"), zone)
    if zone:
        z = evidence["zone"]
        bundle["field.area"] = entry(f"The field covers {z['area_ha']} hectares.", USDA, [z["area_ha"]])
    for i, limit in enumerate(evidence.get("limits", [])):
        bundle[f"limit.{i}"] = entry(limit, USDA)
    return bundle


class Cache:
    """The evidence of recent places, so a question right after an analysis does not ask the sources again."""

    def __init__(self, size=200, ttl=3600, clock=time.monotonic):
        self.size, self.ttl, self.clock = size, ttl, clock
        self.items = OrderedDict()
        self.lock = threading.Lock()

    def get_or_make(self, key, make, keep=lambda value: True):
        now = self.clock()
        with self.lock:
            hit = self.items.get(key)
            if hit and now - hit[0] < self.ttl:
                self.items.move_to_end(key)
                return hit[1]
        value = make()
        if not keep(value):
            return value
        with self.lock:
            self.items[key] = (now, value)
            self.items.move_to_end(key)
            while len(self.items) > self.size:
                self.items.popitem(last=False)
        return value
