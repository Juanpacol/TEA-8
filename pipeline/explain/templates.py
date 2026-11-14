"""Generate the pre-written explanations from templates.

Every sentence is built from the data file or from a cited rule and keeps its
origin label. Nothing here is written by a model, and nothing scores or ranks
the rotations: the decision belongs to the farmer.
"""

NASA_POWER_GRID = "NASA POWER is a grid of about 50 km: it represents the area, not the plot."
NO_YIELDS = "No yield data exists for this rotation: county yields cover corn and soybeans as a whole, so the comparison measures stress and exposure, not outcomes."
LOCAL_REVIEW = "A local agronomist should review this rotation before it is considered."


def statement(text, origin, citation=None):
    result = {"text": text, "origin": origin}
    if citation:
        result["citation"] = citation
    return result


def from_rule(rule):
    return statement(rule["text"], rule["origin"], rule.get("citation"))


def driest_summer(seasons):
    """The season with the lowest known root wetness among 2001-2023, or None."""
    known = [s for s in seasons if 2001 <= s["year"] <= 2023 and s["root_wetness"]["value"] is not None]
    return min(known, key=lambda s: s["root_wetness"]["value"]) if known else None


def climate_evidence(seasons):
    season = driest_summer(seasons)
    if season is None:
        return []
    wet, dev = season["root_wetness"], season["root_wetness_deviation"]
    text = (f"The driest summer of 2001-2023 at the case area was {season['year']}: root-zone wetness "
            f"{wet['value']:.2f}, {dev['value']:+.2f} standard deviations from the 2001-2023 mean "
            f"({wet['source']}, {wet['parameter']}, queried {wet['queried_on']}).")
    return [statement(text, "nasa_data")]


def exposure_evidence(rotation, seasons):
    """CG-2: how much of June to August the rotation keeps a crop in the field, set against the dry summers."""
    share = rotation.get("summer_field_share")
    dry = [s["year"] for s in seasons if s.get("dry") is True and 2001 <= s["year"] <= 2023]
    if share is None or share["value"] is None or not dry:
        return []
    years = ", ".join(str(y) for y in dry)
    text = (f"In the {len(dry)} dry summers of 2001-2023 ({years}), this rotation would have had a crop in the field "
            f"on about {share['value']:.0f}% of June to August days (usual Illinois planting and harvest dates, "
            f"USDA NASS Handbook 628, 1997). This measures how much of the summer a crop is exposed, not yield.")
    return [statement(text, "platform_calculation")]


def explain(rotation, seasons, all_rotations, assumptions=()):
    rules = rotation["rules"]
    cited = [r for r in rules if r["origin"] == "citation" and r.get("kind") != "risk"]
    explanation = {"why": [], "evidence": climate_evidence(seasons) + exposure_evidence(rotation, seasons),
                   "gaps": [statement(a, "platform_calculation") for a in assumptions], "risks": []}

    if rotation["is_current"]:
        explanation["why"] = [from_rule(r) for r in rules if r["origin"] == "platform_calculation"]
        reference = next((r for o in all_rotations for r in o["rules"] if r["origin"] == "citation"), None)
        if reference:
            explanation["risks"].append(statement(
                "In the cited Illinois model, rotations with two crops carried a higher risk of low corn "
                "yields in dry weather than rotations with three.", "citation", reference["citation"]))
    else:
        explanation["why"] = [from_rule(c) for c in cited[:1]]
        explanation["evidence"] += [from_rule(c) for c in cited[1:]]
        explanation["gaps"] += [from_rule(r) for r in rules if r["origin"] == "platform_calculation"]
        explanation["gaps"].append(statement("This rotation is hypothetical: it does not exist in the observed fields.",
                                             "platform_calculation"))
        explanation["risks"] += [from_rule(r) for r in rules if r.get("kind") == "risk"]
        explanation["risks"].append(statement(LOCAL_REVIEW, "platform_calculation"))

    explanation["gaps"] += [statement(NO_YIELDS, "platform_calculation"), statement(NASA_POWER_GRID, "platform_calculation")]
    return explanation
