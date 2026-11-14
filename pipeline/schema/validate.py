"""Validate a TEA-8 data file against the JSON schema.

Usage: python pipeline/schema/validate.py [path-to-json ...]
Defaults to every JSON file in web/public/data/.
Exits with status 1 if any file is invalid.
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = Path(__file__).with_name("tea8.schema.json")
DATA_DIR = ROOT / "web" / "public" / "data"


def validate(path: Path, validator: Draft202012Validator) -> list[str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return [
        f"{path}: {'/'.join(map(str, e.absolute_path)) or '<root>'}: {e.message}"
        for e in validator.iter_errors(data)
    ]


def main(argv: list[str]) -> int:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    paths = [Path(a) for a in argv] or sorted(DATA_DIR.glob("*.json"))
    if not paths:
        print("No data files found.")
        return 1
    errors = [msg for p in paths for msg in validate(p, validator)]
    for msg in errors:
        print(msg)
    print(f"{len(paths)} file(s) checked, {len(errors)} error(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
