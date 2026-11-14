"""Daily cap on questions that reach the model: every call costs money.

In memory, per process: the count resets when the service restarts and each
instance counts on its own. The deployment runs a single instance, so this is a
real bound on one day's spend and not a billing control.
"""

import threading
from datetime import datetime, timezone


class DailyBudget:
    def __init__(self, limit, clock=lambda: datetime.now(timezone.utc)):
        self._limit, self._clock = limit, clock
        self._lock = threading.Lock()
        self._day, self._used = clock().date(), 0

    def try_acquire(self):
        """True and counts one question while today's limit is not reached."""
        with self._lock:
            today = self._clock().date()
            if today != self._day:
                self._day, self._used = today, 0
            if self._used >= self._limit:
                return False
            self._used += 1
            return True
