"""Evidence bundle: the facts of the data file an answer can cite.

Every entry has a key, a sentence, the numbers it contains and its origin.
The model may cite only these keys. The technique (a keyed bundle plus a
deterministic check of each claim) is inspired by a citation verifier from the
author's earlier hackathon project; no code is reused.
"""

import re

NUMBER = re.compile(r"\d+(?:\.\d+)?")


def numbers_in(text):
    return [float(n) for n in NUMBER.findall(text)]


def entry(text, origin, numbers=None, citation=None):
    return {
        "text": text,
        "origin": origin,
        "numbers": numbers_in(text) if numbers is None else numbers,
        "citation": citation,
    }


def _figure(label, fig, year=None):
    if fig["value"] is None:
        return entry(f"{label}: unknown (no data).", "nasa_data", [year] if year else [])
    text = (f"{label}: {fig['value']} {fig['unit']} "
            f"({fig['source']}, {fig['parameter']}, queried {fig['queried_on']}).")
    numbers = [abs(fig["value"])] + numbers_in(fig["unit"]) + ([year] if year else [])
    return entry(text, "nasa_data" if fig["source"] == "NASA POWER" else "platform_calculation", numbers)


def build_bundle(data):
    bundle = {}
    for s in data["seasons"]:
        y = s["year"]
        bundle[f"season.{y}.root_wetness"] = _figure(f"Summer {y} root-zone wetness", s["root_wetness"], y)
        bundle[f"season.{y}.root_wetness_deviation"] = _figure(
            f"Summer {y} root-zone wetness deviation", s["root_wetness_deviation"], y)
        bundle[f"season.{y}.rainfall"] = _figure(f"Summer {y} rainfall", s["rainfall"], y)
        bundle[f"season.{y}.temperature"] = _figure(f"Summer {y} temperature", s["temperature"], y)
    for p in data["region"]["case_points"]:
        pid, soil = p["id"], p["soil"]
        bundle[f"soil.{pid}.name"] = entry(f"{p['label']} soil is {soil['name']}, {soil['drainage']}, "
                                           f"hydrologic group {soil['hydrologic_group']}.", "platform_calculation")
        bundle[f"soil.{pid}.organic_matter"] = _figure(f"{p['label']} soil organic matter", soil["organic_matter"])
        bundle[f"soil.{pid}.available_water"] = _figure(f"{p['label']} soil available water", soil["available_water"])
        for c in p["crop_history"]:
            bundle[f"crop.{pid}.{c['year']}"] = entry(
                f"{p['label']} grew {c['crop'] or 'an unknown crop'} in {c['year']} ({c['source']}).",
                "platform_calculation", [float(c["year"])])
    for r in data["rotations"]:
        kind = "hypothetical" if r["hypothetical"] else "current"
        bundle[f"rotation.{r['id']}"] = entry(
            f"{r['name']} is a {kind} rotation: {', '.join(r['sequence'])}.", "platform_calculation")
        for rule in r["rules"]:
            bundle[f"rule.{rule['id']}"] = entry(
                rule["text"], rule["origin"], citation=rule.get("citation"))
    for i, limit in enumerate(data.get("limits", [])):
        bundle[f"limit.{i}"] = entry(limit, "platform_calculation")
    return bundle
