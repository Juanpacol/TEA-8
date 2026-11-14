import json
import unittest
from pathlib import Path

from pipeline.summarize.build import DRY_THRESHOLD
from pipeline.summarize.yields import fit_line

SUMMARY = Path(__file__).resolve().parents[2] / "web" / "public" / "data" / "summary.json"


class FitLineTest(unittest.TestCase):
    def test_a_perfect_line_is_recovered(self):
        intercept, slope = fit_line([(2001, 100.0), (2002, 103.0), (2003, 106.0)])
        self.assertAlmostEqual(slope, 3.0)
        self.assertAlmostEqual(intercept + slope * 2004, 109.0)


class CommittedDataTest(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(SUMMARY.read_text(encoding="utf-8"))

    def test_the_rule_states_its_threshold_and_that_it_is_a_project_choice(self):
        rule = self.data["dry_summer_rule"]
        self.assertEqual(rule["threshold"], DRY_THRESHOLD)
        self.assertIn("project choice", rule["rationale"])

    def test_dry_summers_are_exactly_those_at_or_below_the_threshold(self):
        for season in self.data["seasons"]:
            deviation = season["root_wetness_deviation"]["value"]
            self.assertEqual(season["dry"], None if deviation is None else deviation <= DRY_THRESHOLD, season["year"])

    def test_the_known_dry_summers(self):
        self.assertEqual([s["year"] for s in self.data["seasons"] if s["dry"]], [2005, 2006, 2012, 2023])

    def test_every_crop_has_a_record_for_every_year(self):
        for crop in ("corn", "soybeans"):
            years = [r["year"] for r in self.data["yields"] if r["crop"] == crop]
            self.assertEqual(years, list(range(2001, 2026)), crop)

    def test_2012_is_the_largest_corn_loss(self):
        corn = [r for r in self.data["yields"] if r["crop"] == "corn"]
        worst = min(corn, key=lambda r: r["change_vs_trend"]["value"])
        self.assertEqual(worst["year"], 2012)

    def test_every_figure_names_its_source(self):
        for r in self.data["yields"]:
            for key in ("yield", "expected", "change_vs_trend"):
                self.assertTrue(r[key]["source"], (r["year"], key))


if __name__ == "__main__":
    unittest.main()
