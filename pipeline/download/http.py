"""Small HTTP helper with retries, shared by the download modules."""

import time
import urllib.request


def request(req, attempts: int = 4, timeout: int = 90) -> bytes:
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read()
        except OSError:
            if attempt == attempts - 1:
                raise
            time.sleep(2 * (attempt + 1))
