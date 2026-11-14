import json
import unittest
from pathlib import Path

from ask.evidence import build_bundle
from ask.guardrails import find_violations
from ask.llm import LLMError
from ask.service import AskError, UNKNOWN, ask, handle_ask
from ask.verifier import verify

DATA = json.loads((Path(__file__).resolve().parents[1] / "data" / "summary.json").read_text())
BUNDLE = build_bundle(DATA)


class FakeLLM:
    def __init__(self, *outputs):
        self.outputs, self.calls = list(outputs), 0

    def complete_json(self, messages, schema, name="answer"):
        self.calls += 1
        out = self.outputs.pop(0)
        if isinstance(out, Exception):
            raise out
        return out


def claim(text, *keys):
    return {"text": text, "evidence_keys": list(keys)}


class VerifierTest(unittest.TestCase):
    def test_supported_claim_is_verified(self):
        r = verify(claim("Summer 2012 root wetness was 0.51.", "season.2012.root_wetness"), BUNDLE)
        self.assertTrue(r["verified"])
        self.assertEqual(r["origins"], ["nasa_data"])
        self.assertEqual([c["passed"] for c in r["checks"]], [True, True, True])

    def test_number_not_in_evidence_fails(self):
        r = verify(claim("Summer 2012 root wetness was 0.75.", "season.2012.root_wetness"), BUNDLE)
        self.assertFalse(r["verified"])
        self.assertFalse(r["checks"][2]["passed"])

    def test_negative_deviation_matches_its_magnitude(self):
        r = verify(claim("In 2012 the deviation was -1.98.", "season.2012.root_wetness_deviation"), BUNDLE)
        self.assertTrue(r["verified"])

    def test_baseline_years_from_the_unit_are_allowed(self):
        r = verify(claim("In 2012 root wetness was -1.98 standard deviations vs 2001-2023.",
                         "season.2012.root_wetness_deviation"), BUNDLE)
        self.assertTrue(r["verified"])

    def test_misread_number_is_caught(self):
        r = verify(claim("Summer 2012 temperature was 23.0 C.", "season.2012.temperature"), BUNDLE)
        self.assertFalse(r["verified"])

    def test_no_citation_is_not_verified(self):
        self.assertFalse(verify(claim("Rotations help."), BUNDLE)["verified"])

    def test_invented_key_is_not_verified(self):
        r = verify(claim("Summer 2012 was dry.", "season.2012.nonsense"), BUNDLE)
        self.assertFalse(r["verified"])
        self.assertFalse(r["checks"][1]["passed"])

    def test_cited_rule_carries_its_citation(self):
        r = verify(claim("Three-crop rotations lowered the risk of low corn yields in dry weather.", "rule.r-three-1"), BUNDLE)
        self.assertTrue(r["verified"])
        self.assertTrue(r["citations"])


class GuardrailTest(unittest.TestCase):
    def test_best_option_is_forbidden(self):
        self.assertTrue(find_violations([claim("This is the best rotation for you.")]))

    def test_plain_description_passes(self):
        self.assertEqual(find_violations([claim("Point A grew corn in 2023.")]), [])


class AskTest(unittest.TestCase):
    def good(self):
        return {"answered": True, "claims": [claim("Point A grew corn in 2023.", "crop.point-a.2023")]}

    def test_verified_answer(self):
        r = ask("What did point A grow in 2023?", None, DATA, FakeLLM(self.good()))
        self.assertTrue(r["answered"])
        self.assertEqual(r["answer"], "Point A grew corn in 2023.")
        self.assertIn("local agricultural expertise", r["notice"])

    def test_model_says_it_does_not_know(self):
        r = ask("Will it rain next week?", None, DATA, FakeLLM({"answered": False, "claims": []}))
        self.assertEqual((r["answered"], r["answer"], r["claims"]), (False, UNKNOWN, []))

    def test_unverified_claims_are_flagged_not_hidden(self):
        out = {"answered": True, "claims": [claim("Wetness was 0.99 in 2012.", "season.2012.root_wetness")]}
        r = ask("q", None, DATA, FakeLLM(out))
        self.assertFalse(r["answered"])
        self.assertFalse(r["claims"][0]["verified"])

    def test_forbidden_wording_is_retried_then_rejected(self):
        bad = {"answered": True, "claims": [claim("This is the best rotation.", "rotation.three-crop")]}
        llm = FakeLLM(bad, bad)
        with self.assertRaises(AskError) as ctx:
            ask("q", None, DATA, llm)
        self.assertEqual((ctx.exception.status, llm.calls), (502, 2))

    def test_retry_can_recover(self):
        bad = {"answered": True, "claims": [claim("This is the best rotation.", "rotation.three-crop")]}
        r = ask("q", None, DATA, FakeLLM(bad, self.good()))
        self.assertTrue(r["answered"])

    def test_bad_questions(self):
        for q in (None, "  ", "x" * 501):
            with self.assertRaises(AskError) as ctx:
                ask(q, None, DATA, FakeLLM())
            self.assertEqual(ctx.exception.status, 400)

    def test_llm_failure_becomes_http_error(self):
        status, body = handle_ask(b'{"question": "q"}', DATA, FakeLLM(LLMError("LLM_TIMEOUT", "slow", 504)))
        self.assertEqual((status, body["error"]["code"]), (504, "LLM_TIMEOUT"))

    def test_handle_ask_rejects_bad_json(self):
        self.assertEqual(handle_ask(b"nope", DATA, FakeLLM())[0], 400)
        self.assertEqual(handle_ask(b"[1]", DATA, FakeLLM())[0], 400)


if __name__ == "__main__":
    unittest.main()
