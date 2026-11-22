#!/usr/bin/env python3
"""Exact SHA-512 scan for concatenated per-host HTML archives.

The scanner is intended for a locally supplied, access-authorized archive such as
DUTA's per-host HTML files. It never prints or copies page content: only paths,
byte offsets, lengths, hashes, and match metadata are emitted.

It checks:
  1. each complete host file;
  2. each complete HTML document delimited by <html ...> ... </html>;
  3. when present, the same document including its immediately preceding
     <!DOCTYPE ...> declaration.

No whitespace, encoding, line-ending, tag, or content normalization is applied.
A page-level hit is exact only if the archive preserved the original page bytes
and the detected document boundaries coincide with the bytes originally hashed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from typing import Iterator

P56_SHA512 = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)

HTML_OPEN = re.compile(rb"<html\b", re.IGNORECASE)
HTML_CLOSE = re.compile(rb"</html\s*>", re.IGNORECASE)
DOCTYPE = re.compile(rb"<!doctype\b", re.IGNORECASE)


def sha512(data: bytes) -> str:
    return hashlib.sha512(data).hexdigest()


def html_documents(data: bytes) -> Iterator[tuple[str, int, int]]:
    """Yield (kind, start, end) exact byte ranges for closed HTML documents."""
    opens = list(HTML_OPEN.finditer(data))
    closes = list(HTML_CLOSE.finditer(data))
    close_index = 0
    previous_end = 0

    for i, opening in enumerate(opens):
        next_open = opens[i + 1].start() if i + 1 < len(opens) else len(data)

        while close_index < len(closes) and closes[close_index].start() < opening.end():
            close_index += 1
        if close_index >= len(closes) or closes[close_index].start() >= next_open:
            continue

        closing = closes[close_index]
        html_start, html_end = opening.start(), closing.end()
        yield ("html-tag-document", html_start, html_end)

        # Include the closest preceding doctype only if it lies after the end
        # of the previous closed document. This avoids swallowing prior pages.
        preceding = [
            m for m in DOCTYPE.finditer(data, previous_end, html_start)
        ]
        if preceding:
            yield ("doctype-plus-html-document", preceding[-1].start(), html_end)

        previous_end = html_end
        close_index += 1


def scan_file(path: Path, root: Path, target: str) -> tuple[dict, list[dict]]:
    data = path.read_bytes()
    rel = str(path.relative_to(root))
    file_hash = sha512(data)
    summary = {
        "path": rel,
        "bytes": len(data),
        "html_open_tags": len(list(HTML_OPEN.finditer(data))),
        "html_close_tags": len(list(HTML_CLOSE.finditer(data))),
        "whole_file_sha512": file_hash,
    }
    hits: list[dict] = []

    if file_hash == target:
        hits.append({
            "path": rel,
            "kind": "whole-host-file",
            "start": 0,
            "end": len(data),
            "bytes": len(data),
            "sha512": file_hash,
        })

    for kind, start, end in html_documents(data):
        segment = data[start:end]
        digest = sha512(segment)
        if digest == target:
            hits.append({
                "path": rel,
                "kind": kind,
                "start": start,
                "end": end,
                "bytes": end - start,
                "sha512": digest,
            })

    return summary, hits


def self_test() -> None:
    sample = (
        b"prefix\n<!DOCTYPE html><html><body>first</body></html>\n"
        b"<!doctype html><html><body>second</body></html>\nsuffix"
    )
    docs = list(html_documents(sample))
    assert len(docs) == 4, docs
    second = sample[sample.index(b"<!doctype html>"):sample.index(b"</html>", sample.index(b"<!doctype html>")) + len(b"</html>")]
    target = sha512(second)
    found = False
    for kind, start, end in docs:
        if sha512(sample[start:end]) == target:
            found = True
            break
    assert found, "page-level exact-hash positive control failed"
    assert sha512(b"abc") == (
        "ddaf35a193617abacc417349ae204131"
        "12e6fa4e89a97ea20a9eeee64b55d39a"
        "2192992a274fc1a836ba3c23a3feebbd"
        "454d4423643ce80e2a9ac94fa54ca49f"
    )
    print("SELF-TEST PASS: whole-file SHA-512 and concatenated HTML boundaries")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, help="root directory of authorized raw HTML files")
    parser.add_argument("--digest", default=P56_SHA512, help="target SHA-512 hex digest")
    parser.add_argument("--output", type=Path, help="optional JSON output path")
    parser.add_argument("--self-test", action="store_true", help="run synthetic positive controls")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        if args.root is None:
            return 0

    if args.root is None:
        parser.error("--root is required unless --self-test is used alone")
    if not re.fullmatch(r"[0-9a-fA-F]{128}", args.digest):
        parser.error("--digest must be exactly 128 hexadecimal characters")

    root = args.root.resolve()
    if not root.is_dir():
        parser.error(f"not a directory: {root}")
    target = args.digest.lower()

    files = sorted(p for p in root.rglob("*") if p.is_file() and not p.is_symlink())
    report = {
        "target_sha512": target,
        "root": str(root),
        "files_scanned": 0,
        "html_documents_scanned": 0,
        "hits": [],
        "files": [],
        "normalization": "none; all hashes are over exact input bytes",
        "warning": (
            "HTML segments are boundary candidates, not proof of original HTTP "
            "response boundaries. A match is decisive only if byte preservation "
            "and segmentation are independently established."
        ),
    }

    for path in files:
        try:
            summary, hits = scan_file(path, root, target)
        except OSError as exc:
            print(f"READ-ERROR {path}: {exc}", file=sys.stderr)
            continue
        report["files_scanned"] += 1
        report["html_documents_scanned"] += summary["html_open_tags"]
        report["files"].append(summary)
        report["hits"].extend(hits)
        for hit in hits:
            print("MATCH " + json.dumps(hit, sort_keys=True))

    report["files"] = [
        {k: v for k, v in item.items() if k != "whole_file_sha512"}
        for item in report["files"]
    ]
    print("SUMMARY " + json.dumps({
        "files_scanned": report["files_scanned"],
        "html_open_tags": report["html_documents_scanned"],
        "hits": len(report["hits"]),
    }, sort_keys=True))

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
