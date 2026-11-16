#!/usr/bin/env python3
"""Metadata-only Wayback CDX check for 2014 Cicada onion hosts via two published Tor2web proxies.

This deliberately does NOT replay, download, or view any archived page body. It only
queries CDX metadata and reports captures whose embedded .onion hostname is one of
the eight source-identified Cicada 2014 chain hosts.
"""
from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

CICADA_HOSTS = {
    "avowyfgl5lkzfj3n.onion",
    "auqgnxjtvdbll3pv.onion",
    "cu343l33nqaekrnw.onion",
    "fv7lyucmeozzd5j4.onion",
    "ky2khlqdf7qdznac.onion",
    "q4utgdi2n4m4uim5.onion",
    "sq6wmgv2zcsrix6t.onion",
    "ut3qtzbrvs7dtvzp.onion",
}
ONION_RE = re.compile(r"(?i)([a-z2-7]{16}[.]onion)")
CDX_ENDPOINTS = (
    "https://web.archive.org/cdx/search/cdx",
    "http://web.archive.org/search/cdx",
)
QUERIES = (
    "tor2web.onionsearchengine.com/*",
    "*.onion.ly/",
)


def fetch_cdx(pattern: str) -> list[dict[str, str]]:
    params = [
        ("url", pattern),
        ("output", "json"),
        ("from", "2014"),
        ("to", "2016"),
        ("filter", "statuscode:200"),
        ("fl", "timestamp,original,mimetype,statuscode,digest,length"),
        ("collapse", "urlkey"),
        ("limit", "10000"),
    ]
    query = urllib.parse.urlencode(params)
    last_error: Exception | None = None
    for endpoint in CDX_ENDPOINTS:
        url = endpoint + "?" + query
        for attempt in range(2):
            request = urllib.request.Request(
                url,
                headers={"User-Agent": "LiberPrimusResearch/1.0 (metadata-only CDX audit)"},
            )
            try:
                with urllib.request.urlopen(request, timeout=30) as response:
                    raw = response.read().decode("utf-8", "replace")
                data = json.loads(raw)
                if not data:
                    return []
                header = data[0]
                return [dict(zip(header, row)) for row in data[1:]]
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
                last_error = exc
                time.sleep((1, 3)[attempt])
    raise RuntimeError(f"CDX query failed for {pattern}: {last_error}")


def main() -> None:
    report: dict[str, object] = {
        "scope": "CDX metadata only; no replay or page-body retrieval",
        "period": "2014-2016",
        "known_cicada_2014_hosts": sorted(CICADA_HOSTS),
        "queries": [],
    }
    for pattern in QUERIES:
        started = time.time()
        try:
            rows = fetch_cdx(pattern)
            matches = []
            onion_hosts_seen: set[str] = set()
            for row in rows:
                original = urllib.parse.unquote(row.get("original", ""))
                hosts = {m.group(1).lower() for m in ONION_RE.finditer(original)}
                onion_hosts_seen.update(hosts)
                matched = sorted(hosts & CICADA_HOSTS)
                if matched:
                    matches.append({
                        "cicada_hosts": matched,
                        "timestamp": row.get("timestamp", ""),
                        "original": original,
                        "mimetype": row.get("mimetype", ""),
                        "statuscode": row.get("statuscode", ""),
                        "digest_sha1_base32": row.get("digest", ""),
                        "length": row.get("length", ""),
                    })
            report["queries"].append({
                "pattern": pattern,
                "rows": len(rows),
                "distinct_onion_hosts": len(onion_hosts_seen),
                "known_cicada_host_matches": matches,
                "possibly_truncated_at_10000": len(rows) >= 10000,
                "elapsed_seconds": round(time.time() - started, 2),
            })
        except Exception as exc:  # preserve the failure as a reproducible result
            report["queries"].append({
                "pattern": pattern,
                "error": f"{type(exc).__name__}: {exc}",
            })

    out = Path("im-results/wayback-tor2web-cdx-metadata.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2) + chr(10), encoding="utf-8")
    for item in report["queries"]:
        print(json.dumps(item, sort_keys=True))
    if any("error" in item for item in report["queries"]):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
