"""Minimal TEA-8 API service. Only a health endpoint for now (DEP-5)."""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = json.dumps({"status": "ok", "service": "tea-8-api"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
        else:
            body = json.dumps({"error": "not found"}).encode()
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()
