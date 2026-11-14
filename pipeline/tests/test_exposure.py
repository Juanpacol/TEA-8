import json
import unittest
from pathlib import Path

from pipeline.rotations.exposure import SUMMER_DAYS, rotation_summer_share, summer_days_in_field

CALENDAR = json.loads((Path(__file__).resolve().parents[1] / "rotations" / "calendar.json").read_text(encoding="utf-8"))


def window(start, end, previous=False):
    return {"in_field_from": start, "in_field_until": end, "planted_previous_year": previous}


class ExposureTest(unittest.TestCase):
    def test_summer_has_92_days(self):
        self.assertEqual(SUMMER_DAYS, 92)

    def test_crop_in_the_field_all_summer(self):
        self.assertEqual(summer_days_in_field(window("04-30", "11-03")), 92)

    def test_crop_harvested_in_june(self):
        self.assertEqual(summer_days_in_field(window("04-01", "06-30")), 30)

    def test_crop_planted_the_year_before(self):
        self.assertEqual(summer_days_in_field(window("10-13", "07-08", True)), 38)

    def test_crop_gone_before_summer(self):
        self.assertEqual(summer_days_in_field(window("03-01", "05-20")), 0)

    def test_rotation_is_the_mean_of_its_years(self):
        crops = {"a": window("01-01", "12-31"), "b": window("06-01", "06-30")}
        self.assertAlmostEqual(rotation_summer_share(["a", "b"], crops), (1 + 30 / 92) / 2)

    def test_every_crop_of_every_rotation_has_dates(self):
        rotations = json.loads((Path(__file__).resolve().parents[1] / "rotations" / "rotations.json").read_text(encoding="utf-8"))
        for rotation in rotations["rotations"]:
            for crop in rotation["sequence"]:
                self.assertIn(crop, CALENDAR["crops"], crop)

    def test_calendar_cites_a_source_that_was_read(self):
        self.assertIn("read at https://", CALENDAR["source"]["citation"])

    def test_known_shares(self):
        shares = {c: summer_days_in_field(w) for c, w in CALENDAR["crops"].items()}
        self.assertEqual(shares["corn"], 92)
        self.assertEqual(shares["small grain"], 38)  # winter wheat, harvested by July 8
        self.assertEqual(shares["oat/clover"], 64)  # spring oats, harvested by August 3


if __name__ == "__main__":
    unittest.main()
