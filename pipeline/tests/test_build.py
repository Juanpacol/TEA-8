import unittest

from pipeline.summarize.build import deviation, rounded


class DeviationTest(unittest.TestCase):
    def test_deviation_uses_baseline(self):
        self.assertAlmostEqual(deviation(1.0, [1.0, 2.0, 3.0]), -1.2247, places=3)

    def test_unknown_stays_unknown(self):
        self.assertIsNone(deviation(None, [1.0, 2.0]))
        self.assertIsNone(rounded(None, 2))


if __name__ == "__main__":
    unittest.main()
