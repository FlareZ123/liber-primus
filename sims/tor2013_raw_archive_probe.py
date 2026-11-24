#!/usr/bin/env python3
"""Search a pinned 2013 Tor HSDir raw archive for v2 onion IDs and descriptor IDs.

No onion service is contacted. The archive is streamed through bzip2 and GNU grep
so the multi-pattern scan runs in compiled code rather than Python per-record loops.
The two-month collection window is inferred from the operator's 2013-05-15 post.
"""
from __future__ import annotations

import base64
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import urllib.request
from pathlib import Path

ARCHIVE_URL = (
    "https://raw.githubusercontent.com/DonnchaC/tor-hsdir-research/"
    "c0333031b71d91659a6bb5d3f96432ecb727a105/data/raw_data_csv_export.tar.bz2"
)
EXPECTED_GIT_BLOB_SHA1 = "87c479547a58338c6b43434b98ecb75f4bb3f537"
START = dt.datetime(2013, 3, 15, tzinfo=dt.timezone.utc)
END = dt.datetime(2013, 5, 16, tzinfo=dt.timezone.utc)


def descriptor_ids(service_id: str) -> set[str]:
    sid = base64.b32decode(service_id.upper())
    first = sid[0]
    periods = set()
    t = START
    while t < END:
        seconds = int(t.timestamp())
        periods.add(int((seconds + first * 86400 / 256) / 86400))
        t += dt.timedelta(hours=1)
    out = set()
    for period in periods:
        for replica in (0, 1):
            secret = hashlib.sha1(period.to_bytes(4, "big") + bytes([replica])).digest()
            desc = hashlib.sha1(sid + secret).digest()
            out.add(base64.b32encode(desc).decode("ascii").lower())
            out.add(desc.hex())
    return out


def download_archive(path: Path) -> dict:
    request = urllib.request.Request(
        ARCHIVE_URL,
        headers={"User-Agent": "LiberPrimusResearch/1.0 targeted historical metadata probe"},
    )
    with urllib.request.urlopen(request, timeout=180) as response, path.open("wb") as out:
        shutil.copyfileobj(response, out)
    size = path.stat().st_size
    sha256 = hashlib.sha256()
    git_header = b"blob " + str(size).encode("ascii") + bytes([0])
    git_sha1 = hashlib.sha1(git_header)
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha256.update(chunk)
            git_sha1.update(chunk)
    actual = git_sha1.hexdigest()
    if actual != EXPECTED_GIT_BLOB_SHA1:
        raise RuntimeError(f"archive Git blob mismatch: expected {EXPECTED_GIT_BLOB_SHA1}, got {actual}")
    return {"size": size, "sha256": sha256.hexdigest(), "git_blob_sha1": actual}


def main() -> None:
    targets = [x.strip().lower() for x in os.getenv("TARGET_IDS", "hxazsilqjcq5n555").split(",") if x.strip()]
    controls = [x.strip().lower() for x in os.getenv(
        "CONTROL_IDS", "silkroadvb5piz3r,5onwnspjvuk7cwvk,kpvz7ki2v5agwt35"
    ).split(",") if x.strip()]
    services = list(dict.fromkeys(targets + controls))

    needle_meta: dict[str, set[str]] = {}
    for service in services:
        if len(service) != 16:
            raise ValueError(f"not a 16-character v2 onion ID: {service}")
        base64.b32decode(service.upper())
        needle_meta.setdefault(service, set()).add(f"service:{service}")
        for desc in descriptor_ids(service):
            needle_meta.setdefault(desc, set()).add(f"descriptor:{service}")

    needles = sorted(needle_meta)
    regex = re.compile(b"(?:" + b"|".join(re.escape(x.encode("ascii")) for x in needles) + b")")
    hits = {x: {"count": 0, "samples": []} for x in needle_meta}
    matched_line_bytes = 0
    matched_line_count = 0
    grep_rc = None
    bz2_rc = None
    archive_meta = None

    with tempfile.TemporaryDirectory(prefix="lp2-tor2013-") as td:
        archive_path = Path(td) / "raw_data_csv_export.tar.bz2"
        needle_path = Path(td) / "needles.txt"
        archive_meta = download_archive(archive_path)
        needle_path.write_text("\n".join(needles) + "\n", encoding="ascii")
        print(json.dumps({"archive_downloaded": archive_meta, "needle_count": len(needles)}), flush=True)

        decompressor = subprocess.Popen(
            ["bzip2", "-dc", str(archive_path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        assert decompressor.stdout is not None
        grep = subprocess.Popen(
            ["grep", "-a", "-i", "-F", "-f", str(needle_path)],
            stdin=decompressor.stdout,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        decompressor.stdout.close()
        assert grep.stdout is not None
        for line_no, line in enumerate(grep.stdout, 1):
            matched_line_bytes += len(line)
            matched_line_count += 1
            for match in regex.finditer(line.lower()):
                needle = match.group().decode("ascii").lower()
                item = hits[needle]
                item["count"] += 1
                if len(item["samples"]) < 3:
                    item["samples"].append({"matched_line": line_no, "match": needle})
        grep_rc = grep.wait()
        bz2_rc = decompressor.wait()
        if bz2_rc != 0:
            raise RuntimeError(f"bzip2 decompression failed with exit code {bz2_rc}")
        if grep_rc not in (0, 1):
            raise RuntimeError(f"grep failed with exit code {grep_rc}")

    def result_for(service: str) -> dict:
        desc = [
            {"id": n, "count": hits[n]["count"], "samples": hits[n]["samples"]}
            for n, meta in needle_meta.items()
            if f"descriptor:{service}" in meta and hits[n]["count"]
        ]
        return {
            "service_id": service,
            "service_id_hits": hits[service],
            "descriptor_hit_count": sum(x["count"] for x in desc),
            "descriptor_hits": desc[:10],
        }

    report = {
        "source": ARCHIVE_URL,
        "collection_window_utc": [START.isoformat(), END.isoformat()],
        "archive": archive_meta,
        "needle_count": len(needles),
        "matched_line_count": matched_line_count,
        "matched_line_bytes": matched_line_bytes,
        "grep_exit_code": grep_rc,
        "bzip2_exit_code": bz2_rc,
        "targets": [result_for(x) for x in targets],
        "controls": [result_for(x) for x in controls],
        "interpretation": (
            "Positive hits establish presence in this archive. Negative hits are "
            "bounded to the two-month 2013 collection and do not exclude a service "
            "created later."
        ),
    }
    payload = json.dumps(report, indent=2, sort_keys=True)
    print(payload)
    output_path = Path(os.environ.get("GITHUB_WORKSPACE", ".")) / "tor2013_archive_probe.json"
    output_path.write_text(payload + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
