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
    for s in data["seasons"]:
        if s.get("dry") is not None:
            verdict = "dry" if s["dry"] else "not dry"
            bundle[f"season.{s['year']}.dry"] = entry(
                f"Summer {s['year']} counts as {verdict} under the project rule.",
                "platform_calculation", [float(s["year"])])
    rule = data.get("dry_summer_rule")
    if rule:
        bundle["method.dry_summer"] = entry(rule["rationale"], "platform_calculation")
    for r in data.get("yields", []):
        crop, y = r["crop"], r["year"]
        value, expected, change = r["yield"], r["expected"], r["change_vs_trend"]
        if value["value"] is None:
            continue
        text = (f"County {crop} yield in {y}: {value['value']} {value['unit']} ({value['source']}, "
                f"queried {value['queried_on']}).")
        numbers = [value["value"], float(y)] + numbers_in(value["unit"])
        if expected["value"] is not None:
            text += f" The usual yield from the trend of non-dry summers was {expected['value']} {expected['unit']} (TEA-8 calculation)."
            numbers.append(expected["value"])
        if change["value"] is not None:
            text += f" That is a change of {change['value']} percent against the usual yield (TEA-8 calculation)."
            numbers.append(abs(change["value"]))
        bundle[f"yield.{crop.replace(' ', '_')}.{y}"] = entry(text, "platform_calculation", numbers)
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
        if "summer_field_share" in r:
            bundle[f"exposure.{r['id']}"] = _figure(
                f"{r['name']}: share of June to August days with a crop in the field (exposure, not yield)",
                r["summer_field_share"])
        for rule in r["rules"]:
            bundle[f"rule.{rule['id']}"] = entry(
                rule["text"], rule["origin"], citation=rule.get("citation"))
    for i, limit in enumerate(data.get("limits", [])):
        bundle[f"limit.{i}"] = entry(limit, "platform_calculation")
    return bundle
