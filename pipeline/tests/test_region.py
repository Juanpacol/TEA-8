import json
import tempfile
import unittest
from pathlib import Path

from pipeline.points import CASE_POINTS
from pipeline.region import REGION, load_region
from pipeline.summarize.build import BASELINE_YEARS, CLIMATE_POINT

DATA = Path(__file__).resolve().parents[2] / "web" / "public" / "data" / "summary.json"


class RegionTest(unittest.TestCase):
    def test_the_data_file_carries_the_region_of_the_config(self):
        data = json.loads(DATA.read_text(encoding="utf-8"))
        self.assertEqual((data["region"]["name"], data["region"]["state"]), (REGION["name"], REGION["state"]))
        self.assertEqual([p["id"] for p in data["region"]["case_points"]], list(CASE_POINTS))

    def test_years_come_from_the_config(self):
        self.assertEqual((BASELINE_YEARS[0], BASELINE_YEARS[-1]), tuple(REGION["baseline_years"]))
        self.assertIn(CLIMATE_POINT, CASE_POINTS)

    def test_a_config_with_an_unknown_climate_point_is_refused(self):
        bad = dict(REGION, climate_point="point-z")
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "region.json"
            path.write_text(json.dumps(bad), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_region(path)

    def test_a_backwards_year_range_is_refused(self):
        bad = dict(REGION, baseline_years=[2023, 2001])
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "region.json"
            path.write_text(json.dumps(bad), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_region(path)


if __name__ == "__main__":
    unittest.main()
