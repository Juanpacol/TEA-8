"""Muse Spark (Meta Model API) client for structured JSON answers.

Bearer auth and a strict `response_format.json_schema`, as checked in the
author's earlier project on 2026-11-03. Standard library only.
"""

import json
import time
import urllib.error
import urllib.request

BASE_URL = "https://api.meta.ai/v1/chat/completions"
RETRYABLE = {429, 500, 502, 503, 504}


class LLMError(Exception):
    def __init__(self, code, message, status=502):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status


class MuseSparkClient:
    def __init__(self, api_key, model="muse-spark-1.3", reasoning_effort="low",
                 max_completion_tokens=2048, timeout=45, backoff=0.5, opener=urllib.request.urlopen):
        self._api_key, self._model = api_key, model
        self._effort, self._max_tokens = reasoning_effort, max_completion_tokens
        self._timeout, self._backoff, self._open = timeout, backoff, opener

    def complete_json(self, messages, schema, name="answer"):
        if not self._api_key:
            raise LLMError("LLM_UNAVAILABLE", "Muse Spark API key is not configured", 503)
        payload = {
            "model": self._model,
            "messages": messages,
            "max_completion_tokens": self._max_tokens,
            "reasoning_effort": self._effort,
            "response_format": {"type": "json_schema",
                                "json_schema": {"name": name, "strict": True, "schema": schema}},
        }
        body = self._post(payload)
        try:
            return json.loads(body["choices"][0]["message"]["content"])
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
            raise LLMError("LLM_BAD_OUTPUT", "Muse Spark returned an unreadable answer") from exc

    def _post(self, payload):
        request = urllib.request.Request(
            BASE_URL, json.dumps(payload).encode(), method="POST",
            headers={"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"})
        for attempt in range(2):
            try:
                with self._open(request, timeout=self._timeout) as response:
                    return json.load(response)
            except urllib.error.HTTPError as exc:
                if exc.code in (401, 403):
                    raise LLMError("LLM_AUTH_FAILED", "Muse Spark rejected the API key") from exc
                if exc.code in RETRYABLE and attempt == 0:
                    time.sleep(self._backoff)
                    continue
                raise LLMError("LLM_REQUEST_FAILED", f"Muse Spark request failed with status {exc.code}") from exc
            except (TimeoutError, urllib.error.URLError) as exc:
                if attempt == 0:
                    time.sleep(self._backoff)
                    continue
                raise LLMError("LLM_TIMEOUT", "Muse Spark request timed out", 504) from exc
