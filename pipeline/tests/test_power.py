import unittest

from pipeline.download.power import summer_mean


class SummerMeanTest(unittest.TestCase):
    def test_mean_of_june_to_august(self):
        monthly = {"201206": 0.55, "201207": 0.48, "201208": 0.49, "201205": 0.9}
        self.assertAlmostEqual(summer_mean(monthly, 2012), 0.5067, places=3)

    def test_missing_month_is_unknown(self):
        self.assertIsNone(summer_mean({"202306": 0.5, "202307": 0.5}, 2023))

    def test_fill_value_is_unknown(self):
        self.assertIsNone(summer_mean({"202306": 0.5, "202307": -999, "202308": 0.5}, 2023))


if __name__ == "__main__":
    unittest.main()
