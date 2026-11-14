"""The region the pipeline runs for, read from pipeline/region.json.

Name, state, case points and the year ranges live in that one file. The yields in pipeline/inputs/,
the sourced rotations in pipeline/rotations/ and the wording of pipeline/explain/ are still written
for McLean County and must be revisited for another region.
"""

import json
from pathlib import Path

REGION_FILE = Path(__file__).resolve().parent / "region.json"


def load_region(path: Path = REGION_FILE) -> dict:
    region = json.loads(path.read_text(encoding="utf-8"))
    if region["climate_point"] not in region["case_points"]:
        raise ValueError(f"climate_point {region['climate_point']!r} is not one of the case points")
    for key in ("baseline_years", "crop_history_years"):
        start, end = region[key]
        if start > end:
            raise ValueError(f"{key} starts after it ends")
    return region


REGION = load_region()
