import json
import unittest
from pathlib import Path

from pipeline.explain.templates import driest_summer, explain, exposure_evidence

ROOT = Path(__file__).resolve().parents[2]
ORIGINS = {"nasa_data", "platform_calculation", "model_text", "citation", "citation_to_verify"}


def season(year, value):
    figure = lambda v: {"value": v, "unit": "u", "source": "NASA POWER", "parameter": "GWETROOT", "queried_on": "2026-11-14"}
    return {"year": year, "root_wetness": figure(value), "root_wetness_deviation": figure(-1.0 if value else None)}


class ExplainTest(unittest.TestCase):
    def setUp(self):
        self.rotations = json.loads((ROOT / "pipeline/rotations/rotations.json").read_text())["rotations"]
        self.seasons = [season(2012, 0.51), season(2013, 0.73), season(2023, None)]

    def statements(self, rotation):
        return [s for part in explain(rotation, self.seasons, self.rotations).values() for s in part]

    def test_every_sentence_has_a_valid_origin(self):
        for rotation in self.rotations:
            for s in self.statements(rotation):
                self.assertIn(s["origin"], ORIGINS)

    def test_cited_sentences_name_their_source(self):
        for rotation in self.rotations:
            for s in self.statements(rotation):
                if s["origin"] in ("citation", "citation_to_verify"):
                    self.assertTrue(s.get("citation"))

    def test_every_section_is_filled(self):
        for rotation in self.rotations:
            for name, part in explain(rotation, self.seasons, self.rotations).items():
                self.assertTrue(part, f"{rotation['id']} {name}")

    def test_unknown_seasons_are_skipped(self):
        self.assertEqual(driest_summer(self.seasons)["year"], 2012)
        self.assertIsNone(driest_summer([season(2012, None)]))

class ExposureEvidenceTest(unittest.TestCase):
    share = {"value": 80.4, "unit": "percent", "source": "TEA-8 calculation", "parameter": "p", "queried_on": "2026-11-14"}

    def test_sentence_names_dry_summers_and_says_it_is_not_yield(self):
        seasons = [{"year": 2012, "dry": True}, {"year": 2013, "dry": False}, {"year": 2024, "dry": True}]
        [statement] = exposure_evidence({"summer_field_share": self.share}, seasons)
        self.assertEqual(statement["origin"], "platform_calculation")
        self.assertIn("1 dry summer of 2001-2023 (2012)", statement["text"])
        self.assertIn("80%", statement["text"])
        self.assertIn("not yield", statement["text"])

    def test_nothing_is_said_without_a_figure_or_dry_summers(self):
        self.assertEqual(exposure_evidence({}, [{"year": 2012, "dry": True}]), [])
        self.assertEqual(exposure_evidence({"summer_field_share": self.share}, [{"year": 2012, "dry": False}]), [])



if __name__ == "__main__":
    unittest.main()
