"""TEA-8 API service: /health, GET /place, POST /zone and POST /ask, with a CORS allowlist and rate limiting (DEP-5, DEP-9, BE-7)."""
import json
import os
import threading
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from ask.budget import DailyBudget
from ask.llm import MuseSparkClient
from ask.service import handle_ask
from place.service import handle_place, parse_place
from place.bundle import Cache
from place.zone import handle_zone, parse_corners

ALLOWED_ORIGINS = {
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "https://tea-8.vercel.app").split(",")
    if o.strip()
}
PER_IP_LIMIT = int(os.environ.get("RATE_LIMIT_PER_IP_PER_MIN", "20"))
GLOBAL_LIMIT = int(os.environ.get("RATE_LIMIT_GLOBAL_PER_MIN", "120"))
WINDOW_SECONDS = 60


class RateLimiter:
    """Sliding-window limiter, per client and global. In memory: the service runs a single instance."""

    def __init__(self, per_client, global_limit, window=WINDOW_SECONDS, clock=time.monotonic):
        self.per_client, self.global_limit, self.window, self.clock = per_client, global_limit, window, clock
        self.clients = defaultdict(deque)
        self.total = deque()

    def _trim(self, q, now):
        while q and now - q[0] >= self.window:
            q.popleft()

    def allow(self, client):
        now = self.clock()
        self._trim(self.total, now)
        q = self.clients[client]
        self._trim(q, now)
        if len(q) >= self.per_client or len(self.total) >= self.global_limit:
            return False
        q.append(now)
        self.total.append(now)
        if len(self.clients) > 10000:
            self.clients = defaultdict(deque, {k: v for k, v in self.clients.items() if v})
        return True


LIMITER = RateLimiter(PER_IP_LIMIT, GLOBAL_LIMIT)
LIMITER_LOCK = threading.Lock()
MAX_BODY_BYTES = 4096
# A field outline of up to 200 corners, alone (/zone) or with a question (/ask).
MAX_ZONE_BODY_BYTES = 16384

DATA = json.loads((Path(__file__).parent / "data" / "summary.json").read_text(encoding="utf-8"))
LLM = MuseSparkClient(os.environ.get("META_MODEL_API_KEY"), os.environ.get("META_MODEL_ID", "muse-spark-1.3"))
BUDGET = DailyBudget(int(os.environ.get("DAILY_ASK_LIMIT", "300")))
EVIDENCE = Cache()


def complete(result):
    """Only a full answer is kept: a refusal or a source that did not answer is asked again next time."""
    status, body = result
    return status == 200 and not any(isinstance(v, dict) and "error" in v for v in body.values())


def cached_place(query):
    place = parse_place(query)
    key = ("place", place) if place else ("place-bad", query)
    return EVIDENCE.get_or_make(key, lambda: handle_place(query), keep=complete)


def cached_zone(raw):
    corners = parse_corners(raw)
    if corners is None:
        return handle_zone(raw)
    return EVIDENCE.get_or_make(("zone", tuple(corners)), lambda: handle_zone(raw), keep=complete)


def place_evidence(payload):
    """The evidence for the place or field a question is about, from the cache when it was just analyzed."""
    if "place" in payload:
        place = payload["place"] if isinstance(payload["place"], dict) else {}
        try:
            query = f"lat={float(place.get('lat')):.5f}&lon={float(place.get('lon')):.5f}"
        except (TypeError, ValueError):
            return 400, {"error": {"code": "BAD_REQUEST", "message": "place must have lat and lon"}}
        return cached_place(query)
    return cached_zone(json.dumps({"corners": payload.get("zone")}).encode())


def client_ip(forwarded_for, fallback):
    """Cloud Run appends the real client address last; earlier entries can be spoofed."""
    if forwarded_for:
        return forwarded_for.split(",")[-1].strip()
    return fallback


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        origin = self.headers.get("Origin")
        if origin and origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "600")

    def _json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _blocked_origin(self):
        origin = self.headers.get("Origin")
        return bool(origin) and origin not in ALLOWED_ORIGINS

    def _rate_limited(self):
        """Answers 429 and returns True when this client is over the limit."""
        ip = client_ip(self.headers.get("X-Forwarded-For"), self.client_address[0])
        with LIMITER_LOCK:
            allowed = LIMITER.allow(ip)
        if allowed:
            return False
        body = json.dumps({"error": "too many requests"}).encode()
        self.send_response(429)
        self.send_header("Retry-After", str(WINDOW_SECONDS))
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)
        return True

    def do_OPTIONS(self):
        if self._blocked_origin():
            return self._json(403, {"error": "origin not allowed"})
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            return self._json(200, {"status": "ok", "service": "tea-8-api"})
        if self._blocked_origin():
            return self._json(403, {"error": "origin not allowed"})
        if self._rate_limited():
            return
        path, _, query = self.path.partition("?")
        if path == "/place":
            return self._json(*cached_place(query))
        self._json(404, {"error": "not found"})

    def do_POST(self):
        if self._blocked_origin():
            return self._json(403, {"error": "origin not allowed"})
        if self.path not in ("/ask", "/zone"):
            return self._json(404, {"error": "not found"})
        if self._rate_limited():
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = -1
        limit = MAX_ZONE_BODY_BYTES  # a question about a field carries its outline too
        if length < 0 or length > limit:
            return self._json(413, {"error": {"code": "BAD_REQUEST", "message": "request too large"}})
        if self.path == "/zone":
            return self._json(*cached_zone(self.rfile.read(length)))
        status, payload = handle_ask(self.rfile.read(length), DATA, LLM, BUDGET, place_evidence)
        self._json(status, payload)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
