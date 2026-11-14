"""Wording the tool must never produce: it supports a decision, it does not
make it, and it gives no final score or best option."""

import re

FORBIDDEN = (
    "best rotation", "best option", "best choice", "optimal rotation", "you should plant",
    "you should switch", "you must", "guarantee", "guaranteed", "will increase your yield",
    "will increase yield", "highest score", "final score", "ranked first",
)


def find_violations(claims):
    text = " ".join(c["text"] for c in claims)
    return [f"forbidden wording: {p!r}" for p in FORBIDDEN
            if re.search(rf"\b{re.escape(p)}\b", text, re.IGNORECASE)]
