import unittest

import main


class FakeClock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


class RateLimiterTest(unittest.TestCase):
    def test_blocks_after_per_client_limit_and_recovers(self):
        clock = FakeClock()
        limiter = main.RateLimiter(2, 100, window=60, clock=clock)
        self.assertTrue(limiter.allow("a"))
        self.assertTrue(limiter.allow("a"))
        self.assertFalse(limiter.allow("a"))
        self.assertTrue(limiter.allow("b"))
        clock.now = 61
        self.assertTrue(limiter.allow("a"))

    def test_global_limit_applies_across_clients(self):
        limiter = main.RateLimiter(10, 2, window=60, clock=FakeClock())
        self.assertTrue(limiter.allow("a"))
        self.assertTrue(limiter.allow("b"))
        self.assertFalse(limiter.allow("c"))


class ClientIpTest(unittest.TestCase):
    def test_uses_last_forwarded_address(self):
        self.assertEqual(main.client_ip("6.6.6.6, 203.0.113.9", "10.0.0.1"), "203.0.113.9")

    def test_falls_back_to_socket_address(self):
        self.assertEqual(main.client_ip(None, "10.0.0.1"), "10.0.0.1")


if __name__ == "__main__":
    unittest.main()
