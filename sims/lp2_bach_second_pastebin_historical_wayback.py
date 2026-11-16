#!/usr/bin/env python3
"""Archive-authenticate the second 2014 Bach Pastebin, with a first-ID control.

Windows 11 / GitHub Actions Python 3.12, standard library only.
All downloaded HTML is treated as untrusted, inert text and never executed.
"""
from __future__ import annotations

import base64
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "im-results" / "historical-source-retrieval-tmp"
SOURCES = [
    ("note-list-control", "3T089HUW", "20160411164121", "QQ4Q4OEMLFQHDZ7W2UHN3NNY2B7KA46F"),
    ("numeric-april", "17h9MhyK", "20160411164121", "CCQHGUR36DNGLBE7BURCM45ICERVAVPN"),
    ("numeric-june", "17h9MhyK", "20160623232243", "P63CYGHZ26SV7SKMDDJD3FMXGWJZUGKO"),
]


class PasteCodeParser(HTMLParser):
    """Read the original Pastebin textarea, not the page's visible comments."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.active = False
        self.parts: list[str] = []
        self.found = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        if tag == "textarea" and (
            attrs_map.get("id") == "paste_code" or attrs_map.get("name") == "paste_code"
        ):
            self.active = True
            self.found += 1

    def handle_data(self, data: str) -> None:
        if self.active:
            self.parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "textarea":
            self.active = False


def atomic_write(filename: Path, content: bytes) -> None:
    """Serialize writes using a Windows sidecar lock, fsync and os.replace."""
    import msvcrt

    filename.parent.mkdir(parents=True, exist_ok=True)
    with Path(str(filename) + ".lock").open("a+b") as lock:
        lock.seek(0)
        lock.write(b"\x00")
        lock.flush()
        lock.seek(0)
        msvcrt.locking(lock.fileno(), msvcrt.LK_LOCK, 1)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(
                prefix="bach-archive-", suffix=".partial",
                dir=filename.parent, delete=False
            ) as tmp:
                temporary = Path(tmp.name)
                tmp.write(content)
                tmp.flush()
                os.fsync(tmp.fileno())
            os.replace(temporary, filename)
        finally:
            if temporary is not None and temporary.exists():
                temporary.unlink()
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)


def fetch_archival_original(paste_id: str, timestamp: str) -> tuple[bytes, str]:
    url = (
        "https://web.archive.org/web/" + timestamp + "id_/http://pastebin.com/" + paste_id
    )
    errors = []
    for attempt in range(4):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html",
                },
            )
            with urllib.request.urlopen(req, timeout=40) as response:
                response_body = response.read(2_000_000)
                if len(response_body) >= 2_000_000:
                    raise ValueError("historical HTML exceeds source-bound size")
                return response_body, response.url
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            errors.append(type(exc).__name__ + ": " + str(exc)[:180])
            print("retry", paste_id, timestamp, attempt, errors[-1], flush=True)
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
    raise RuntimeError("archive attempts exhausted: " + "; ".join(errors))


def normalize(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n").rstrip("\n")


def archive_pass() -> None:
    entries = []
    accepted = 0
    for name, paste_id, timestamp, cdx_sha1 in SOURCES:
        expected = (
            ROOT / "resources" / "external" /
            ("cicada2014-bach-pastebin-" + paste_id + ".txt")
        ).read_bytes()
        print("TARGET", name, paste_id, timestamp, "known source bytes", len(expected), flush=True)
        try:
            payload, final_url = fetch_archival_original(paste_id, timestamp)
            raw_cdx = base64.b32encode(hashlib.sha1(payload).digest()).decode().rstrip("=")
            html_source = payload.decode("utf-8", errors="replace")
            parser = PasteCodeParser()
            parser.feed(html_source)
            parser.close()
            restored = "".join(parser.parts)
            matched = parser.found == 1 and normalize(restored) == normalize(
                expected.decode("utf-8")
            )
            desc = {
                "case": name, "id": paste_id, "timestamp": timestamp,
                "final_url": final_url,
                "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest(),
                "sha1_base32": raw_cdx, "cdx_sha1_base32": cdx_sha1,
                "cdx_exact_match": raw_cdx == cdx_sha1, "textarea_count": parser.found,
                "decoded_text_bytes": len(restored.encode("utf-8")),
                "text_matches_prior_2014_paste": matched,
                "restored_sha256": hashlib.sha256(restored.encode("utf-8")).hexdigest(),
                "expected_paste_sha256": hashlib.sha256(expected).hexdigest(),
            }
            atomic_write(OUTPUT / (name + "-2016-wayback-source.html"), payload)
            atomic_write(OUTPUT / (name + "-extracted.txt"), restored.encode("utf-8"))
            if matched:
                accepted += 1
            print("RESULT", json.dumps(desc, sort_keys=True), flush=True)
            entries.append(desc)
        except Exception as exc:
            entries.append({"case": name, "error": type(exc).__name__ + ": " + str(exc)})
            print("FAILED", name, type(exc).__name__, str(exc), flush=True)
    report = {
        "archive": "Wayback April and June 2016 genuine archived captures",
        "expected_records": len(SOURCES), "matched_records": accepted,
        "source_corpus": "liber-primus original 2014 Bach ID text pair",
        "records": entries,
    }
    atomic_write(
        OUTPUT / "manifest.json",
        (json.dumps(report, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    )
    print("MANIFEST", json.dumps(report, sort_keys=True), flush=True)
    assert accepted == len(SOURCES), "historical archive failed frozen source-text gate"


if __name__ == "__main__":
    archive_pass()
