import json
import unittest
from datetime import date

from place.zone import MAX_CORNERS, area_m2, handle_zone, inside, parse_corners, sample_points

SQUARE = [[38.49, -98.81], [38.49, -98.79], [38.51, -98.79], [38.51, -98.81]]


def body(corners):
    return json.dumps({"corners": corners}).encode()


def ok(value):
    return lambda: value


def down():
    raise OSError("down")


class Geometry(unittest.TestCase):
    def test_area_of_a_square_matches_a_flat_estimate(self):
        flat = (0.02 * 111_195) * (0.02 * 111_195 * 0.7826)
        self.assertAlmostEqual(area_m2([tuple(c) for c in SQUARE]) / flat, 1, places=2)

    def test_inside(self):
        corners = [tuple(c) for c in SQUARE]
        self.assertTrue(inside(38.5, -98.8, corners))
        self.assertFalse(inside(38.6, -98.8, corners))

    def test_samples_fall_inside_even_for_a_thin_l_shape(self):
        shape = [(0, 0), (0, 3), (1, 3), (1, 1), (3, 1), (3, 0)]
        points = sample_points(shape)
        self.assertEqual(len(points), 5)
        self.assertTrue(all(inside(lat, lon, shape) for lat, lon in points))


class ParseCorners(unittest.TestCase):
    def test_drops_the_repeated_last_corner(self):
        self.assertEqual(len(parse_corners(body(SQUARE + [SQUARE[0]]))), 4)

    def test_rejects_bad_input(self):
        for raw in (b"", b"not json", body([[1, 2], [3, 4]]), body([[1, "x"], [2, 3], [4, 5]]),
                    body([[0, i] for i in range(MAX_CORNERS + 1)]), b'{"corners": 5}'):
            self.assertIsNone(parse_corners(raw), raw[:40])


class HandleZone(unittest.TestCase):
    def test_returns_the_three_sources_and_the_area(self):
        status, payload = handle_zone(body(SQUARE), date(2026, 11, 15), ok({"dry_years": [2012]}), ok({"soils": []}), ok({"points": 5}))
        self.assertEqual(status, 200)
        self.assertEqual(payload["zone"]["corners"], 4)
        self.assertAlmostEqual(payload["zone"]["area_ha"], 387, delta=1)
        self.assertEqual(payload["climate"], {"dry_years": [2012]})
        self.assertEqual(payload["queried_on"], "2026-11-15")

    def test_a_source_that_fails_does_not_hide_the_others(self):
        status, payload = handle_zone(body(SQUARE), date(2026, 11, 15), down, ok({"soils": []}), down)
        self.assertEqual(status, 200)
        self.assertIn("error", payload["climate"])
        self.assertIn("error", payload["crops"])
        self.assertEqual(payload["soil"], {"soils": []})

    def test_refuses_outside_the_us_too_large_and_too_small(self):
        self.assertEqual(handle_zone(body([[6, -75], [6, -75.01], [6.01, -75.01]]))[1]["error"]["code"], "OUTSIDE_COVERAGE")
        self.assertEqual(handle_zone(body([[38, -99], [38, -98], [39, -98]]))[1]["error"]["code"], "TOO_LARGE")
        tiny = [[38.5, -98.8], [38.5, -98.80001], [38.50001, -98.80001]]
        self.assertEqual(handle_zone(body(tiny))[1]["error"]["code"], "BAD_REQUEST")


if __name__ == "__main__":
    unittest.main()
