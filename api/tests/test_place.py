import unittest
from datetime import date

from place import sources
from place.service import UNAVAILABLE, handle_place


def monthly(values):
    """POWER-style monthly table: the same value for June to August of each year."""
    return {f"{year}{month}": value for year, value in values.items() for month in ("06", "07", "08")}


class FakeSources:
    def __init__(self, fail=()):
        self.fail = fail

    def climate(self, lat, lon, last_year):
        if "climate" in self.fail:
            raise OSError("down")
        return {"dry_years": [2012]}

    def soil(self, lat, lon):
        if "soil" in self.fail:
            raise OSError("down")
        return {"name": "Harney"}

    def crops(self, lat, lon):
        return {"years": {"2008": "Corn"}}


class HandlePlace(unittest.TestCase):
    def test_returns_the_three_sources(self):
        status, body = handle_place("lat=38.5&lon=-98.8", date(2026, 11, 15), FakeSources())
        self.assertEqual(status, 200)
        self.assertEqual(body["place"], {"lat": 38.5, "lon": -98.8})
        self.assertEqual(body["queried_on"], "2026-11-15")
        self.assertEqual(body["climate"], {"dry_years": [2012]})
        self.assertEqual(body["soil"], {"name": "Harney"})
        self.assertEqual(body["crops"], {"years": {"2008": "Corn"}})
        self.assertTrue(body["limits"])

    def test_a_source_that_fails_does_not_hide_the_others(self):
        status, body = handle_place("lat=38.5&lon=-98.8", date(2026, 11, 15), FakeSources(fail=("climate", "soil")))
        self.assertEqual(status, 200)
        self.assertEqual(body["climate"], UNAVAILABLE)
        self.assertEqual(body["soil"], UNAVAILABLE)
        self.assertEqual(body["crops"], {"years": {"2008": "Corn"}})

    def test_rejects_bad_coordinates(self):
        for query in ("", "lat=abc&lon=1", "lat=40", "lat=nan&lon=-88"):
            status, body = handle_place(query, src=FakeSources())
            self.assertEqual((status, body["error"]["code"]), (400, "BAD_REQUEST"), query)

    def test_rejects_a_place_outside_the_contiguous_united_states(self):
        status, body = handle_place("lat=6.25&lon=-75.56", src=FakeSources())
        self.assertEqual((status, body["error"]["code"]), (400, "OUTSIDE_COVERAGE"))


class Climate(unittest.TestCase):
    def test_dry_summer_rule_uses_the_baseline_of_the_cell(self):
        wet = {year: 0.6 for year in range(2001, 2026)}
        wet.update({2005: 0.7, 2012: 0.3, 2024: 0.3})
        flat = monthly({year: 3.0 for year in wet})
        result = sources.summarize_climate(
            {"GWETROOT": monthly(wet), "PRECTOTCORR": flat, "T2M": flat}, 2025)
        self.assertEqual(result["baseline"], "2001-2023")
        self.assertEqual(result["dry_years"], [2012, 2024])
        self.assertEqual(len(result["seasons"]), 25)
        season = next(s for s in result["seasons"] if s["year"] == 2012)
        self.assertEqual(season["root_wetness"], 0.3)
        self.assertLess(season["root_wetness_deviation"], -1.0)

    def test_a_summer_with_a_missing_month_is_left_out(self):
        wet = {year: 0.6 for year in range(2001, 2026)}
        wet.update({2010: 0.5, 2011: 0.7})
        table = monthly(wet)
        table["202507"] = -999
        flat = monthly({year: 3.0 for year in wet})
        result = sources.summarize_climate({"GWETROOT": table, "PRECTOTCORR": flat, "T2M": flat}, 2025)
        self.assertNotIn(2025, [s["year"] for s in result["seasons"]])


class Parsers(unittest.TestCase):
    def test_soil_row(self):
        soil = sources.parse_soil([["Harney", "97", "Well drained", "C", "2.3", "0.22"]])
        self.assertEqual(soil["name"], "Harney")
        self.assertEqual(soil["organic_matter_pct"], 2.3)
        self.assertIsNone(sources.parse_soil([]))

    def test_crop_category(self):
        self.assertEqual(sources.parse_category('{x: 1, category: "Corn", color: "#FFD300"}'), "Corn")
        self.assertIsNone(sources.parse_category("<error/>"))


if __name__ == "__main__":
    unittest.main()
