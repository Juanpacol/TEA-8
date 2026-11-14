"""County yields for the case area and how each year compares with its trend.

The yields come from pipeline/inputs/ (USDA NASS QuickStats, copied by hand). For each crop, a
straight line is fitted to the yields of the years that were NOT dry summers; the expected yield of any
year is that line. The change against it is then shown for every year. Fitting on non-dry years keeps
the droughts from pulling the expected yield down. It is a simple trend, not a crop model: it says
nothing about price, seed or other causes.
"""

import csv
from pathlib import Path

INPUTS = Path(__file__).resolve().parents[1] / "inputs"
CROPS = {
    "corn": ("nass_mclean_corn_yield.csv", "CORN, GRAIN - YIELD, MEASURED IN BU / ACRE"),
    "soybeans": ("nass_mclean_soybean_yield.csv", "SOYBEANS - YIELD, MEASURED IN BU / ACRE"),
}
TREND_SOURCE = "TEA-8 calculation"


def read_yields(filename: str) -> dict:
    with open(INPUTS / filename, encoding="utf-8", newline="") as f:
        return {int(r["year"]): (float(r["value"]), r["queried_on"]) for r in csv.DictReader(f)}


def fit_line(points: list) -> tuple:
    """Ordinary least squares of y on x. Returns (intercept, slope)."""
    n = len(points)
    mean_x = sum(x for x, _ in points) / n
    mean_y = sum(y for _, y in points) / n
    slope = sum((x - mean_x) * (y - mean_y) for x, y in points) / sum((x - mean_x) ** 2 for x, _ in points)
    return mean_y - slope * mean_x, slope


def build_yields(dry_years: set) -> list:
    records = []
    for crop, (filename, data_item) in CROPS.items():
        series = read_yields(filename)
        intercept, slope = fit_line([(y, v) for y, (v, _) in series.items() if y not in dry_years])
        for year in sorted(series):
            value, queried_on = series[year]
            expected = intercept + slope * year
            records.append({
                "year": year,
                "crop": crop,
                "yield": {"value": value, "unit": "bu/acre", "source": "USDA NASS QuickStats",
                          "parameter": data_item, "queried_on": queried_on},
                "expected": {"value": round(expected, 1), "unit": "bu/acre", "source": TREND_SOURCE,
                             "parameter": "linear trend of the non-dry summers", "queried_on": queried_on},
                "change_vs_trend": {"value": round((value / expected - 1) * 100, 1), "unit": "percent",
                                    "source": TREND_SOURCE, "parameter": "yield / expected yield - 1",
                                    "queried_on": queried_on},
            })
    return records
