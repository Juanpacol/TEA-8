import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web" / "public" / "data" / "summary.json"
API = ROOT / "api" / "data" / "summary.json"
SCHEMA = ROOT / "pipeline" / "schema" / "tea8.schema.json"


class DataFilesTest(unittest.TestCase):
    def test_web_and_api_copies_are_identical(self):
        self.assertEqual(WEB.read_text(encoding="utf-8"), API.read_text(encoding="utf-8"),
                         "run `python -m pipeline.summarize.build` and commit both copies")

    def test_the_committed_file_follows_the_schema(self):
        validator = Draft202012Validator(json.loads(SCHEMA.read_text(encoding="utf-8")))
        errors = list(validator.iter_errors(json.loads(WEB.read_text(encoding="utf-8"))))
        self.assertEqual([e.message for e in errors], [])


if __name__ == "__main__":
    unittest.main()
