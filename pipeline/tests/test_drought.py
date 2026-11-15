import unittest

from pipeline.summarize.drought import summer_drought_share


def weeks(year, shares, month="07"):
    return [{"mapDate": f"{year}-{month}-{day:02d}T00:00:00", "d1": s} for day, s in zip(range(1, 29), shares)]


class SummerDroughtShareTest(unittest.TestCase):
    def test_mean_of_the_summer_weeks(self):
        self.assertEqual(summer_drought_share(weeks(2012, [100.0] * 6 + [50.0] * 6), 2012), 75.0)

    def test_other_years_and_months_are_ignored(self):
        data = weeks(2012, [100.0] * 12) + weeks(2013, [0.0] * 12) + weeks(2012, [0.0] * 12, month="12")
        self.assertEqual(summer_drought_share(data, 2012), 100.0)

    def test_unfinished_summer_is_unknown_not_zero(self):
        self.assertIsNone(summer_drought_share(weeks(2026, [100.0] * 5), 2026))

    def test_missing_values_are_not_averaged_in(self):
        self.assertIsNone(summer_drought_share(weeks(2012, [None] * 12), 2012))


if __name__ == "__main__":
    unittest.main()
