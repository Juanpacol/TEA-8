"""TEA-8 API service: health endpoint with CORS allowlist and rate limiting (DEP-5, DEP-9)."""
import json
import os
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, HTTPServer

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
        ip = client_ip(self.headers.get("X-Forwarded-For"), self.client_address[0])
        if not LIMITER.allow(ip):
            self.send_response(429)
            self.send_header("Retry-After", str(WINDOW_SECONDS))
            body = json.dumps({"error": "too many requests"}).encode()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._cors()
            self.end_headers()
            self.wfile.write(body)
            return
        self._json(404, {"error": "not found"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()
