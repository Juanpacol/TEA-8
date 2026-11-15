import json
import unittest

from ask.service import handle_ask
from ask.verifier import verify
from place.bundle import Cache, place_bundle

PLACE = {
    "place": {"lat": 38.5, "lon": -98.8},
    "queried_on": "2026-11-15",
    "climate": {
        "baseline": "2001-2023",
        "dry_years": [2011, 2012],
        "seasons": [{"year": 2012, "root_wetness": 0.42, "root_wetness_deviation": -1.18,
                     "rainfall_mm_day": 1.9, "temperature_c": 27.1, "dry": True}],
        "source": "NASA POWER", "note": "",
    },
    "soil": {"name": "Harney", "drainage": "Well drained", "hydrologic_group": "C",
             "organic_matter_pct": 2.3, "available_water": 0.22, "source": "SSURGO"},
    "crops": {"years": {"2012": "Winter Wheat", "2013": None}, "source": "CDL", "note": ""},
    "limits": ["Climate describes the area, not the field."],
}

ZONE = {
    "zone": {"corners": 4, "area_ha": 387.1, "center": {"lat": 38.5, "lon": -98.8}},
    "queried_on": "2026-11-15",
    "climate": {"error": "This source did not answer."},
    "soil": {"soils": [{"name": "Harney", "drainage": "Well drained", "hydrologic_group": "C", "share_pct": 37}],
             "source": "", "note": ""},
    "crops": {"points": 5, "years": {"2012": {"Winter Wheat": 2, "Sorghum": 3}, "2013": {}}, "source": "", "note": ""},
    "limits": [],
}


class FakeLLM:
    def __init__(self, claims):
        self.claims, self.messages = claims, None

    def complete_json(self, messages, schema):
        self.messages = messages
        return {"answered": True, "claims": self.claims}


class PlaceBundle(unittest.TestCase):
    def test_a_true_claim_about_the_place_is_verified(self):
        bundle = place_bundle(PLACE)
        claim = {"text": "Summer 2012 was dry here: soil moisture 0.42 on a scale from 0 to 1.",
                 "evidence_keys": ["season.2012.root_wetness", "season.2012.dry"]}
        self.assertTrue(verify(claim, bundle)["verified"])

    def test_a_wrong_number_is_not_verified(self):
        claim = {"text": "Summer 2012 averaged 23.3 °C.", "evidence_keys": ["season.2012.temperature"]}
        self.assertFalse(verify(claim, place_bundle(PLACE))["verified"])

    def test_soil_and_crops_of_a_point(self):
        bundle = place_bundle(PLACE)
        self.assertTrue(verify({"text": "Organic matter is 2.3 percent.", "evidence_keys": ["soil.organic_matter"]}, bundle)["verified"])
        self.assertIn("crop.2012", bundle)
        self.assertNotIn("crop.2013", bundle)

    def test_a_field_with_its_soils_and_crop_counts_and_no_climate(self):
        bundle = place_bundle(ZONE)
        self.assertNotIn("climate.dry_years", bundle)
        claim = {"text": "Harney covers about 37 percent of the field; in 2012, 3 of 5 points grew sorghum.",
                 "evidence_keys": ["soil.0", "crop.2012"]}
        self.assertTrue(verify(claim, bundle)["verified"])
        self.assertIn("field.area", bundle)


class AskAboutAPlace(unittest.TestCase):
    def test_the_question_uses_the_bundle_of_the_place(self):
        llm = FakeLLM([{"text": "Summer 2012 was dry here.", "evidence_keys": ["season.2012.dry"]}])
        status, body = handle_ask(json.dumps({"question": "Was 2012 dry?", "place": {"lat": 38.5, "lon": -98.8}}).encode(),
                                  {}, llm, None, lambda payload: (200, PLACE))
        self.assertEqual(status, 200)
        self.assertTrue(body["claims"][0]["verified"])
        self.assertIn("the place the farmer chose", llm.messages[0]["content"])
        self.assertNotIn("McLean", llm.messages[0]["content"])

    def test_a_refused_place_is_passed_on(self):
        refused = (400, {"error": {"code": "OUTSIDE_COVERAGE", "message": "no data"}})
        status, body = handle_ask(json.dumps({"question": "x", "place": {"lat": 6, "lon": -75}}).encode(),
                                  {}, FakeLLM([]), None, lambda payload: refused)
        self.assertEqual((status, body["error"]["code"]), (400, "OUTSIDE_COVERAGE"))

    def test_no_evidence_at_all_is_an_error(self):
        empty = {"climate": {"error": "x"}, "soil": None, "crops": {"error": "x"}, "limits": ["a"]}
        status, body = handle_ask(json.dumps({"question": "x", "place": {"lat": 38, "lon": -98}}).encode(),
                                  {}, FakeLLM([]), None, lambda payload: (200, empty))
        self.assertEqual((status, body["error"]["code"]), (502, "NO_EVIDENCE"))


class EvidenceCache(unittest.TestCase):
    def test_keeps_full_answers_and_asks_again_after_a_failure(self):
        cache, calls = Cache(), []

        def make(value):
            calls.append(value)
            return value

        cache.get_or_make("a", lambda: make(1))
        cache.get_or_make("a", lambda: make(2))
        self.assertEqual(calls, [1])
        cache.get_or_make("b", lambda: make("bad"), keep=lambda v: False)
        cache.get_or_make("b", lambda: make("good"))
        self.assertEqual(calls, [1, "bad", "good"])

    def test_old_entries_expire(self):
        now = [0.0]
        cache, calls = Cache(ttl=10, clock=lambda: now[0]), []
        cache.get_or_make("a", lambda: calls.append(1) or 1)
        now[0] = 11
        cache.get_or_make("a", lambda: calls.append(2) or 2)
        self.assertEqual(calls, [1, 2])


if __name__ == "__main__":
    unittest.main()
