import json
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

import main

ORIGIN = "https://tea-8.vercel.app"


class FakeLLM:
    def complete_json(self, messages, schema, name="answer"):
        return {"answered": True, "claims": [{"text": "Point A grew corn in 2023.", "evidence_keys": ["crop.point-a.2023"]}]}


def post(url, body, headers=None):
    request = urllib.request.Request(url, body, {"Content-Type": "application/json", **(headers or {})}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status, json.load(response), response.headers
    except urllib.error.HTTPError as error:
        return error.code, json.load(error), error.headers


class RouteTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = main.LLM
        main.LLM = FakeLLM()
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), main.Handler)
        cls.url = f"http://127.0.0.1:{cls.server.server_port}"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        main.LLM = cls.original

    def setUp(self):
        main.LIMITER = main.RateLimiter(main.PER_IP_LIMIT, main.GLOBAL_LIMIT)

    def test_ask_answers_with_cors_for_the_allowed_origin(self):
        status, body, headers = post(f"{self.url}/ask", b'{"question": "What did point A grow in 2023?"}', {"Origin": ORIGIN})
        self.assertEqual(status, 200)
        self.assertTrue(body["answered"])
        self.assertEqual(headers["Access-Control-Allow-Origin"], ORIGIN)

    def test_other_origins_are_refused(self):
        status, _, _ = post(f"{self.url}/ask", b'{"question": "q"}', {"Origin": "https://evil.example"})
        self.assertEqual(status, 403)

    def test_bad_json_is_a_400(self):
        status, body, _ = post(f"{self.url}/ask", b"nope")
        self.assertEqual((status, body["error"]["code"]), (400, "BAD_REQUEST"))

    def test_oversized_body_is_a_413(self):
        status, _, _ = post(f"{self.url}/ask", b'{"question": "' + b"x" * 5000 + b'"}')
        self.assertEqual(status, 413)

    def test_unknown_post_path_is_a_404(self):
        self.assertEqual(post(f"{self.url}/other", b"{}")[0], 404)

    def test_rate_limit_applies_to_ask(self):
        main.LIMITER = main.RateLimiter(1, 100)
        self.assertEqual(post(f"{self.url}/ask", b'{"question": "q"}')[0], 200)
        self.assertEqual(post(f"{self.url}/ask", b'{"question": "q"}')[0], 429)


if __name__ == "__main__":
    unittest.main()
