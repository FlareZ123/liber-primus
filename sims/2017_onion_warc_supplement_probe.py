"""Bounded first-party metadata gate for the publicly cited 2017 Tor WARC supplement.

Primary paper: Bernaschi et al. (2022), doi:10.1007/s11280-022-01044-z.
The 2017 crawls generated three WARC files; the paper's published supplement
may contain only derived graph data. Print transport metadata and, only if the
entire archive is small, its member inventory. Never print or fetch onion-page
content and never store the fetched bytes.
"""
from __future__ import annotations

import collections
import io
import json
import tarfile
import urllib.error
import urllib.request

SOURCE = "https://www.cranic.it/data/supporting_material.tar.gz"
CAP = 24 * 1024 * 1024
TIMEOUT = 20


def emit(**row: object) -> None:
    print(json.dumps(row, sort_keys=True, ensure_ascii=True), flush=True)


def main() -> None:
    headers = {"User-Agent": "liber-primus-archival-inventory/1.0"}
    req = urllib.request.Request(SOURCE, headers=headers, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            n = response.headers.get("Content-Length")
            emit(stage="head", status=response.status, final_url=response.url,
                 content_type=response.headers.get("Content-Type"),
                 size_bytes=int(n) if n is not None else None,
                 accept_ranges=response.headers.get("Accept-Ranges"))
            if n is not None and int(n) > CAP:
                emit(stage="catalog", result="size_exceeds_safe_cap",
                     cap_bytes=CAP, note="No archive downloaded")
                return
    except (OSError, urllib.error.URLError, ValueError) as error:
        emit(stage="head", error=f"{type(error).__name__}: {error}")
        return

    req = urllib.request.Request(SOURCE, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            data = response.read(CAP + 1)
            emit(stage="get", status=response.status, bytes_read=len(data))
            if len(data) > CAP:
                emit(stage="catalog", result="stream_exceeds_safe_cap",
                     cap_bytes=CAP, note="No archive persisted")
                return
            with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
                members = archive.getmembers()
                suffix_counts = collections.Counter(
                    "." + m.name.rsplit(".", 1)[-1].lower()
                    if "." in m.name.rsplit("/", 1)[-1] else "(none)"
                    for m in members if m.isfile()
                )
                emit(stage="catalog", result="available",
                     total_files=sum(x.isfile() for x in members),
                     suffix_counts=dict(sorted(suffix_counts.items())),
                     warc_file_count=sum(
                         m.isfile() and m.name.lower().endswith((".warc", ".warc.gz"))
                         for m in members
                     ),
                     member_names=[m.name for m in members[:60]])
                known_cicada_hosts = (
                    "ky2khlqdf7qdznac.onion",  # Authentic 2014 Onion7 LP2 index
                    "eq6emgv2ehsrix6t.onion",  # Historical missing continuation
                )
                for member in members:
                    if not member.isfile() or not member.name.endswith(".nodes"):
                        continue
                    handle = archive.extractfile(member)
                    assert handle is not None
                    node_bytes = handle.read().lower()
                    lines = node_bytes.splitlines()
                    emit(stage="node_inventory", source_file=member.name,
                         bytes=len(node_bytes), row_count=len(lines),
                         onion_literals=node_bytes.count(b".onion"),
                         first_line_bytes=len(lines[0]) if lines else 0,
                         known_cicada_hosts_present={host: host.encode() in node_bytes
                                                     for host in known_cicada_hosts},
                         cicada_literal_count=node_bytes.count(b"cicada"))
    except (OSError, urllib.error.URLError, tarfile.TarError, ValueError) as error:
        emit(stage="get_or_catalog", error=f"{type(error).__name__}: {error}")


if __name__ == "__main__":
    main()
