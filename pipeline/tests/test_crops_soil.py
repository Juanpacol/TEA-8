import unittest

from pipeline.download.albers import to_conus_albers
from pipeline.download.cropscape import parse_category
from pipeline.download.soil import parse_row


class AlbersTest(unittest.TestCase):
    def test_projection_origin(self):
        x, y = to_conus_albers(-96, 23)
        self.assertAlmostEqual(x, 0, places=3)
        self.assertAlmostEqual(y, 0, places=3)


class ParseTest(unittest.TestCase):
    def test_category(self):
        xml = '<Result>{x: 1.0, y: 2.0, value: 5, category: "Soybeans", color: "#267300"}</Result>'
        self.assertEqual(parse_category(xml), "Soybeans")

    def test_no_answer_is_none(self):
        self.assertIsNone(parse_category("<Result>{error}</Result>"))

    def test_soil_row(self):
        row = parse_row([["Osco", "90", "Well drained", "B", "3.5", "0.23"]])
        self.assertEqual(row["name"], "Osco")
        self.assertEqual(row["available_water"], "0.23")

    def test_empty_soil_is_empty(self):
        self.assertEqual(parse_row([]), {})


if __name__ == "__main__":
    unittest.main()
