import json
import unittest
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "rotations" / "rotations.json"


class RotationsTest(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(PATH.read_text(encoding="utf-8"))

    def test_three_rotations_one_current(self):
        rotations = self.data["rotations"]
        self.assertEqual(len(rotations), 3)
        self.assertEqual([r["is_current"] for r in rotations].count(True), 1)

    def test_alternatives_are_hypothetical(self):
        for r in self.data["rotations"]:
            self.assertEqual(r["hypothetical"], not r["is_current"])

    def test_every_citation_rule_names_its_source(self):
        for r in self.data["rotations"]:
            for rule in r["rules"]:
                if rule["origin"] in ("citation", "citation_to_verify"):
                    self.assertTrue(rule.get("citation"), rule["id"])

    def test_every_rotation_has_a_rule(self):
        for r in self.data["rotations"]:
            self.assertTrue(r["rules"], r["id"])


if __name__ == "__main__":
    unittest.main()
