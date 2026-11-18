"""Recover 2014-2015 Ahmia onion URL lists from Internet Archive captures.

Historical Ahmia source at commit 349f33a5 (2014-05-31) exposed:
- /address/ as JSON when Content-Type contains "json"
- /onions/ and /oniondomains.txt as plain-text onion URL lists
and scheduled weekly /address/ snapshots.

This script queries the Wayback CDX index for those exact public endpoints,
downloads unique archived responses, and extracts version-2 onion hostnames.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import tempfile
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ONION_RE = re.compile(rb"(?i)([a-z2-7]{16}\.onion)")
CDX = "https://web.archive.org/cdx/search/cdx"
ENDPOINTS = (
    "http://ahmia.fi/address/",
    "https://ahmia.fi/address/",
    "http://ahmia.fi/onions/",
    "https://ahmia.fi/onions/",
    "http://ahmia.fi/oniondomains.txt",
    "https://ahmia.fi/oniondomains.txt",
)
USER_AGENT = "liber-primus-research/1.0 (+https://github.com/FlareZ123/liber-primus)"


def get_bytes(url: str, attempts: int = 4) -> bytes:
    """Fetch one public URL with bounded retry for transient archive errors."""
    delay = 2
    for attempt in range(attempts):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(request, timeout=45) as response:
                return response.read()
        except Exception:
            if attempt + 1 == attempts:
                raise
            time.sleep(delay)
            delay *= 2
    raise RuntimeError("unreachable")


def cdx_rows(original: str) -> list[dict[str, str]]:
    """Return unique successful captures for one exact historical endpoint."""
    query = urlencode(
        {
            "url": original,
            "from": "2014",
            "to": "2015",
            "output": "json",
            "filter": "statuscode:200",
            "fl": "timestamp,original,digest,length,mimetype,statuscode",
            "collapse": "digest",
        }
    )
    raw = get_bytes(CDX + "?" + query)
    rows = json.loads(raw)
    if not rows:
        return []
    header = rows[0]
    return [dict(zip(header, row, strict=True)) for row in rows[1:]]


def atomic_locked_write(path: Path, data: bytes) -> None:
    """Write bytes atomically under a simple exclusive lock file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lock = path.with_name(path.name + ".lock")
    lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    temp_name = ""
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            dir=path.parent,
            prefix=path.name + ".",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temp_name = handle.name
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    finally:
        os.close(lock_fd)
        lock.unlink(missing_ok=True)
        if temp_name:
            Path(temp_name).unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("url_output", type=Path)
    parser.add_argument("report_output", type=Path)
    args = parser.parse_args()

    onions: set[str] = set()
    capture_records: list[dict[str, object]] = []
    cdx_failures: list[dict[str, str]] = []
    replay_failures: list[dict[str, str]] = []

    for endpoint in ENDPOINTS:
        try:
            rows = cdx_rows(endpoint)
        except Exception as exc:
            cdx_failures.append({"endpoint": endpoint, "error": repr(exc)})
            continue

        for row in rows:
            timestamp = row["timestamp"]
            original = row["original"]
            replay = f"https://web.archive.org/web/{timestamp}id_/{original}"
            try:
                body = get_bytes(replay)
            except Exception as exc:
                replay_failures.append(
                    {"timestamp": timestamp, "original": original, "error": repr(exc)}
                )
                continue

            found = {
                match.group(1).decode("ascii").lower()
                for match in ONION_RE.finditer(body)
            }
            onions.update(found)
            capture_records.append(
                {
                    "timestamp": timestamp,
                    "original": original,
                    "digest": row.get("digest"),
                    "length": row.get("length"),
                    "mimetype": row.get("mimetype"),
                    "downloaded_bytes": len(body),
                    "unique_onions": len(found),
                }
            )

    url_lines = "".join(f"http://{host}/\n" for host in sorted(onions)).encode("utf-8")
    report = {
        "date_range": "2014-2015",
        "source": "Internet Archive CDX + replay of historical Ahmia public list endpoints",
        "endpoints": list(ENDPOINTS),
        "successful_captures": len(capture_records),
        "unique_v2_onion_hosts": len(onions),
        "cdx_failures": cdx_failures,
        "replay_failures": replay_failures,
        "captures": capture_records,
    }

    atomic_locked_write(args.url_output, url_lines)
    atomic_locked_write(
        args.report_output,
        (json.dumps(report, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    )
    print(json.dumps(report, indent=2, sort_keys=True))
    print(f"RECOVERED_UNIQUE_V2_ONIONS={len(onions)}")


if __name__ == "__main__":
    main()
