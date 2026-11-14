"""How much of June to August a rotation keeps a crop in the field (CG-2).

This measures exposure to a dry summer, not yield. The dates come from
calendar.json (USDA NASS usual planting and harvesting dates, Illinois).
"""

from datetime import date

YEAR = 2001  # any non-leap year: only the day of the year matters
SUMMER_START = date(YEAR, 6, 1).timetuple().tm_yday
SUMMER_END = date(YEAR, 8, 31).timetuple().tm_yday
SUMMER_DAYS = SUMMER_END - SUMMER_START + 1


def day_of_year(month_day: str) -> int:
    month, day = month_day.split("-")
    return date(YEAR, int(month), int(day)).timetuple().tm_yday


def summer_days_in_field(window: dict) -> int:
    """Days of June to August on which a crop with this window is in the field."""
    start = 1 if window["planted_previous_year"] else day_of_year(window["in_field_from"])
    end = day_of_year(window["in_field_until"])
    return max(0, min(end, SUMMER_END) - max(start, SUMMER_START) + 1)


def rotation_summer_share(sequence: list, crops: dict) -> float:
    """Mean over the years of the cycle of the share of June to August with a crop in the field (0 to 1)."""
    shares = [summer_days_in_field(crops[crop]) / SUMMER_DAYS for crop in sequence]
    return sum(shares) / len(shares)
