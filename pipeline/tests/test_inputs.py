import csv
import unittest
from pathlib import Path

INPUTS = Path(__file__).resolve().parents[1] / "inputs"


class NassCornYieldTest(unittest.TestCase):
    def setUp(self):
        with open(INPUTS / "nass_mclean_corn_yield.csv", encoding="utf-8", newline="") as f:
            self.rows = list(csv.DictReader(f))

    def test_every_year_from_2001_to_2025_appears_once(self):
        self.assertEqual(sorted(int(r["year"]) for r in self.rows), list(range(2001, 2026)))

    def test_values_are_plausible_bushels_per_acre(self):
        for r in self.rows:
            self.assertTrue(80 <= float(r["value"]) <= 300, r["year"])

    def test_every_row_names_its_source_and_date(self):
        for r in self.rows:
            self.assertEqual(r["source"], "USDA NASS QuickStats")
            self.assertRegex(r["queried_on"], r"^\d{4}-\d{2}-\d{2}$")

    def test_the_known_drought_year_is_the_lowest(self):
        lowest = min(self.rows, key=lambda r: float(r["value"]))
        self.assertEqual(lowest["year"], "2012")


class NassSoybeanYieldTest(unittest.TestCase):
    def setUp(self):
        with open(INPUTS / "nass_mclean_soybean_yield.csv", encoding="utf-8", newline="") as f:
            self.rows = list(csv.DictReader(f))

    def test_every_year_from_2001_to_2025_appears_once(self):
        self.assertEqual(sorted(int(r["year"]) for r in self.rows), list(range(2001, 2026)))

    def test_values_are_plausible_bushels_per_acre(self):
        for r in self.rows:
            self.assertTrue(25 <= float(r["value"]) <= 90, r["year"])

    def test_every_row_names_its_source_and_date(self):
        for r in self.rows:
            self.assertEqual(r["source"], "USDA NASS QuickStats")
            self.assertRegex(r["queried_on"], r"^\d{4}-\d{2}-\d{2}$")


if __name__ == "__main__":
    unittest.main()
