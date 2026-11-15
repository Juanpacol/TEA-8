"""The summer drought share from the US Drought Monitor weekly county records."""

import statistics

MIN_WEEKS = 12  # a full June-August has 13 or 14 weekly maps; fewer means the summer is not over or has gaps


def summer_drought_share(weeks: list, year: int):
    """Mean percent of the county in drought class D1 or worse over the June-August weekly maps, or None.

    `weeks` are the service's records: "mapDate" ("2012-07-24T00:00:00") and "d1" (percent of area).
    """
    shares = [w["d1"] for w in weeks if w["mapDate"][:4] == str(year) and w["mapDate"][5:7] in ("06", "07", "08") and w["d1"] is not None]
    return round(statistics.fmean(shares), 1) if len(shares) >= MIN_WEEKS else None
