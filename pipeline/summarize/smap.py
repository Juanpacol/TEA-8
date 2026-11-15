"""The summer mean of SMAP root-zone soil moisture from the weekly samples."""

import statistics

MIN_SAMPLES = 12  # a full June-August has 14 weekly samples; fewer means the summer is not over or has gaps


def summer_smap(samples: list):
    """Mean soil moisture (m3/m3) of a summer's weekly samples, or None when there are too few."""
    values = [s["value"] for s in samples if s["value"] is not None]
    return round(statistics.fmean(values), 3) if len(values) >= MIN_SAMPLES else None
