#!/usr/bin/env python3
"""Bounded Wayback CDX audit for the lost 2012 Britannica-book-code onion."""
from __future__ import annotations

import hashlib
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HOST = "eq6emgv2ehsrix6t.onion"
SUFFIXES = ["", ".to", ".city", ".link", ".cab", ".direct", ".lt", ".ws", ".sh"]
BASE = "https://web.archive.org/cdx/search/cdx"
OUT = Path("eq6-cdx-output")
RAW = OUT / "responses"


def fetch(host: str) -> dict:
    params = {
        "output": "json",
        "collapse": "digest",
        "limit": "3000",
        "url": host,
        "matchType": "domain",
    }
    url = BASE + "?" + urllib.parse.urlencode(params)
    headers = {"User-Agent": "FlareZ123-liber-primus-research/1.0"}
    last_error = None
    for attempt in range(3):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                status = response.status
                body = response.read()
                break
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_error = str(exc)
            if attempt < 2:
                time.sleep(3 * (attempt + 1))
    else:
        return {
            "host": host,
            "query_url": url,
            "status": None,
            "error": last_error,
            "bytes": 0,
            "sha256": hashlib.sha256(b"").hexdigest(),
            "record_count": None,
            "preview": None,
        }

    RAW.mkdir(parents=True, exist_ok=True)
    slug = host.replace(".", "_")
    (RAW / f"{slug}.json").write_bytes(body)
    record_count = None
    preview = None
    parse_error = None
    if body:
        try:
            parsed = json.loads(body.decode("utf-8"))
            if isinstance(parsed, list):
                if parsed and isinstance(parsed[0], list) and parsed[0] and parsed[0][0] == "urlkey":
                    record_count = max(0, len(parsed) - 1)
                else:
                    record_count = len(parsed)
                preview = parsed[:4]
            else:
                parse_error = "CDX JSON was not an array"
        except Exception as exc:
            parse_error = str(exc)
    else:
        record_count = 0

    return {
        "host": host,
        "query_url": url,
        "status": status,
        "bytes": len(body),
        "sha256": hashlib.sha256(body).hexdigest(),
        "record_count": record_count,
        "preview": preview,
        "parse_error": parse_error,
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    rows = [fetch(HOST + suffix) for suffix in SUFFIXES]
    complete = all(row["status"] == 200 and row["record_count"] == 0 for row in rows)
    found = any((row["record_count"] or 0) > 0 for row in rows)
    result = {
        "target_host": HOST,
        "method": "Wayback CDX output=json, collapse=digest, limit=3000, matchType=domain",
        "exact_proxy_suffix_set": SUFFIXES,
        "queries": rows,
        "all_queries_returned_zero_records": complete,
        "any_records_found": found,
        "decision": (
            "NO_CDX_RECORDS_FOR_EQ6_OR_TESTED_PROXIES" if complete
            else "CDX_RECORDS_FOUND" if found
            else "INCOMPLETE_OR_UNPARSEABLE"
        ),
        "scope": [
            "This reproduces the exact nine-host suffix set previously used for sq6 and cginizi.",
            "A zero-result CDX audit does not prove the onion service was never online or accessed.",
            "No guessed numeric paths are queried; matchType=domain covers archived paths under each tested host.",
        ],
    }
    output = OUT / "eq6-wayback-cdx-results.json"
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
