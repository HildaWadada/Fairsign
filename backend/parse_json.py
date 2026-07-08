"""
parse_json.py — Robust JSON extraction from LLM output.

Replaces the greedy regex r'\{[\s\S]*\}' in graph.py which breaks
when the response contains markdown fences or multiple JSON objects.

Usage:
    from parse_json import extract_json

    text = llm_response          # may contain ```json ... ``` fences
    data = extract_json(text)    # raises ValueError if nothing valid found
"""

import json
import re
import logging

logger = logging.getLogger(__name__)


def extract_json(text: str) -> dict:
    """
    Extract the first valid top-level JSON object from an LLM response.

    Strategy (in order):
      1. Strip ```json ... ``` or ``` ... ``` markdown fences and try direct parse.
      2. Stack-based brace matching — finds the outermost { ... } block.
      3. Raises ValueError if no valid JSON found.
    """
    if not text:
        raise ValueError("Empty LLM response")

    # ── Step 1: strip markdown fences ────────────────────────────────────────
    stripped = _strip_fences(text)
    try:
        return json.loads(stripped.strip())
    except json.JSONDecodeError:
        pass

    # ── Step 2: stack-based brace matching ───────────────────────────────────
    start = stripped.find("{")
    if start == -1:
        raise ValueError("No JSON object found in LLM response")

    depth = 0
    in_string = False
    escape_next = False

    for i, ch in enumerate(stripped[start:], start):
        if escape_next:
            escape_next = False
            continue
        if ch == "\\" and in_string:
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                candidate = stripped[start : i + 1]
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError as exc:
                    logger.warning("Stack-matched JSON failed to parse: %s", exc)
                    raise ValueError(f"Malformed JSON in LLM response: {exc}") from exc

    raise ValueError("Unmatched braces in LLM response — JSON extraction failed")


def _strip_fences(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` fences."""
    # Match fenced blocks: ```json\n...\n``` or ```\n...\n```
    fenced = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if fenced:
        return fenced.group(1)
    # No fences — return as-is
    return text