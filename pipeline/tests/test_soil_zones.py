import json
import unittest
from pathlib import Path

from pipeline.download.soil_zones import clip, outer_rings, simplify
from pipeline.points import CASE_POINTS

ROOT = Path(__file__).resolve().parents[2]
ZONES = ROOT / "web" / "src" / "features" / "map" / "soil-zones.json"
SUMMARY = ROOT / "web" / "public" / "data" / "summary.json"


class SoilZonesTest(unittest.TestCase):
    def test_outer_rings_ignore_holes_and_read_each_polygon(self):
        wkt = "MULTIPOLYGON (((0 0, 4 0, 4 4, 0 4, 0 0), (1 1, 2 1, 2 2, 1 1)), ((10 10, 11 10, 11 11, 10 10)))"
        rings = outer_rings(wkt)
        self.assertEqual(len(rings), 2)
        self.assertEqual(len(rings[0]), 5)

    def test_clip_keeps_only_the_part_inside_the_window(self):
        square = [(-1.0, -1.0), (3.0, -1.0), (3.0, 3.0), (-1.0, 3.0)]
        xs = [x for x, _ in clip(square, 0, 0, 2, 2)]
        self.assertTrue(all(0 <= x <= 2 for x in xs))

    def test_simplify_drops_points_on_a_straight_line(self):
        line = [(0.0, 40.0), (0.00001, 40.0), (0.00002, 40.0), (0.001, 40.0)]
        self.assertEqual(simplify(line, 4.0, 40.0), [line[0], line[-1]])

    def test_each_point_has_zones_and_exactly_one_holds_it_with_the_soil_of_the_summary(self):
        zones = json.loads(ZONES.read_text(encoding="utf-8"))
        summary = json.loads(SUMMARY.read_text(encoding="utf-8"))
        soils = {p["id"]: p["soil"]["name"] for p in summary["region"]["case_points"]}
        self.assertEqual(list(zones["points"]), list(CASE_POINTS))
        for point_id, entry in zones["points"].items():
            holding = [z for z in entry["zones"] if z["holds_point"]]
            self.assertEqual(len(holding), 1, point_id)
            self.assertTrue(holding[0]["name"].startswith(soils[point_id].split(",")[0]), point_id)


if __name__ == "__main__":
    unittest.main()
