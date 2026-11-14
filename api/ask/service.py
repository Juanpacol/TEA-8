"""Use case: answer a question grounded in the data file, and check the answer."""

import json
import time

from ask.evidence import build_bundle
from ask.guardrails import find_violations
from ask.llm import LLMError
from ask.prompt import OUTPUT_SCHEMA, PROMPT_VERSION, build_messages
from ask.verifier import verify

MAX_QUESTION_CHARS = 500
MAX_ATTEMPTS = 2
RETRY_ONLY_BEFORE_SECONDS = 10  # a second model call after this would pass the 30 s Cloud Run limit
NOTICE = "This tool supports, and does not replace, local agricultural expertise."
UNKNOWN = "The project data does not cover this question."


class AskError(Exception):
    def __init__(self, code, message, status):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status


def _reply(answered, answer, claims):
    return {"answered": answered, "answer": answer, "claims": claims,
            "notice": NOTICE, "prompt_version": PROMPT_VERSION}


def ask(question, rotation_id, data, llm, budget=None, clock=time.monotonic):
    if not isinstance(question, str) or not question.strip():
        raise AskError("BAD_REQUEST", "question is required", 400)
    if len(question) > MAX_QUESTION_CHARS:
        raise AskError("BAD_REQUEST", f"question is longer than {MAX_QUESTION_CHARS} characters", 400)
    if budget is not None and not budget.try_acquire():
        raise AskError("DAILY_LIMIT", "the daily limit of questions was reached", 429)
    bundle = build_bundle(data)
    messages = build_messages(question, bundle, rotation_id)
    started = clock()
    for attempt in range(MAX_ATTEMPTS):
        if attempt and clock() - started > RETRY_ONLY_BEFORE_SECONDS:
            break
        try:
            output = llm.complete_json(messages, OUTPUT_SCHEMA)
        except LLMError as exc:
            raise AskError(exc.code, exc.message, exc.status) from exc
        claims = output.get("claims") or []
        if not output.get("answered") or not claims:
            return _reply(False, UNKNOWN, [])
        if find_violations(claims):
            continue
        checked = [verify(c, bundle) for c in claims]
        verified = [c["text"] for c in checked if c["verified"]]
        return _reply(bool(verified), " ".join(verified) or UNKNOWN, checked)
    raise AskError("LLM_INVALID_OUTPUT", "the answer broke the wording rules twice", 502)


def handle_ask(body, data, llm, budget=None):
    """HTTP-agnostic entry point: raw request body to (status, JSON-able dict)."""
    try:
        payload = json.loads(body or b"{}")
    except json.JSONDecodeError:
        return 400, {"error": {"code": "BAD_REQUEST", "message": "body must be JSON"}}
    if not isinstance(payload, dict):
        return 400, {"error": {"code": "BAD_REQUEST", "message": "body must be a JSON object"}}
    try:
        return 200, ask(payload.get("question"), payload.get("rotation_id"), data, llm, budget)
    except AskError as exc:
        return exc.status, {"error": {"code": exc.code, "message": exc.message}}
