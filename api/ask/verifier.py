"""Deterministic rubric: does each claim really rest on the evidence it cites?

A claim is verified only when it cites at least one key, every key exists in
the bundle and every number in the claim appears in the cited evidence.
Formatting a citation is not the same as the citation supporting the claim.
Each claim carries the checks that were run, so the process can be shown.
"""

import re

CLAIM_NUMBER = re.compile(r"(?<![\w.])-?(\d+(?:\.(\d+))?)")


def _number_supported(text_value, decimals, cited):
    value = float(text_value)
    return any(round(c, decimals) == value or abs(c - value) < 1e-9 for c in map(abs, cited))


def numbers_match(text, evidence):
    cited = [n for e in evidence for n in e["numbers"]]
    for match in CLAIM_NUMBER.finditer(text):
        decimals = len(match.group(2) or "")
        if not _number_supported(match.group(1), decimals, cited):
            return False
    return True


def verify(claim, bundle):
    keys = claim["evidence_keys"]
    evidence = [bundle[k] for k in keys if k in bundle]
    checks = [
        {"name": "cites_evidence", "passed": bool(keys)},
        {"name": "keys_exist", "passed": bool(keys) and len(evidence) == len(keys)},
        {"name": "numbers_match", "passed": bool(evidence) and numbers_match(claim["text"], evidence)},
    ]
    return {
        "text": claim["text"],
        "evidence_keys": keys,
        "origins": sorted({e["origin"] for e in evidence}),
        "citations": sorted({e["citation"] for e in evidence if e["citation"]}),
        "checks": checks,
        "verified": all(c["passed"] for c in checks),
    }
