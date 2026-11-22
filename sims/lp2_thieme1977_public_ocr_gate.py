"""Test publicly offered text/OCR files for the pinned 1977 Severa/Zahradnik edition.

No borrowing or access-control bypass: only the Archive.org public metadata
and links that metadata itself exposes. Preserve metadata + limited excerpts,
never publish a copyrighted OCR dump.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from filelock import FileLock

ITEM = "fieldguideincolo0000zahr_d8z2"
ROOT = f"https://archive.org/download/{ITEM}/"
META = f"https://archive.org/metadata/{ITEM}"
OUT = Path("out_thieme")
OUT.mkdir(exist_ok=True)


def get(url: str, max_bytes: int = 6_000_000) -> tuple[int, bytes, str]:
    req = Request(url, headers={"User-Agent": "ResearchSourceGate/1.0 (public endpoints only)"})
    with urlopen(req, timeout=30) as response:
        data = response.read(max_bytes + 1)
        if len(data) > max_bytes:
            raise ValueError(f"response exceeds {max_bytes} bytes")
        return response.status, data, response.headers.get_content_type()


observations: list[dict[str, object]] = []
public_text: list[dict[str, object]] = []

try:
    status, body, content_type = get(META, 2_000_000)
    meta = json.loads(body)
    files = meta.get("files", [])
    observations.append({
        "url": META,
        "status": status,
        "type": content_type,
        "bytes": len(body),
        "sha256": hashlib.sha256(body).hexdigest(),
        "file_count": len(files),
        "title": meta.get("metadata", {}).get("title"),
        "access_restriction": meta.get("is_dark") or meta.get("metadata", {}).get("access-restricted-item"),
    })
    ocr = [f for f in files if str(f.get("name", "")).lower().endswith(("_djvu.txt", "_full_text.txt"))]
    observations.append({"ocr_candidates": [
        {"name": f.get("name"), "size": f.get("size"), "private": f.get("private")} for f in ocr
    ]})
    for item in ocr[:2]:
        if item.get("private"):
            public_text.append({"name": item["name"], "status": "private_declared_skip"})
            continue
        name = str(item["name"])
        url = ROOT + quote(name)
        try:
            code, payload, mime = get(url)
            decoded = payload.decode("utf-8", "replace")
            # Any text must actually derive from the original edition and the fixed mayfly locus.
            matches = []
            upper = decoded.upper()
            for needle in ("EPHEMERELLA", "IGNITA"):
                start = 0
                while (pos := upper.find(needle, start)) >= 0 and len(matches) < 4:
                    matches.append({"needle": needle, "position": pos, "local_context": decoded[max(0,pos-85):pos+165]})
                    start = pos + len(needle)
            public_text.append({
                "name": name, "status": code, "type": mime, "bytes": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(), "matches": matches,
            })
        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
            public_text.append({"name": name, "error_type": type(exc).__name__, "detail": str(exc)[:350]})
except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
    observations.append({"url": META, "error_type": type(exc).__name__, "detail": str(exc)[:350]})

report = {
    "issue": 1333, "source_item": ITEM, "source_host": "archive.org",
    "scope": "public listing and publicly downloadable OCR for the exact 1977 English edition only",
    "metadata": observations, "public_ocr": public_text,
}
target = OUT / "public_ocr_gate.json"
with FileLock(str(target) + ".lock"):
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUT, prefix=".tmp_", suffix=".json", delete=False) as temp:
        json.dump(report, temp, indent=2, ensure_ascii=False)
        temp.write("\n")
        temp.flush()
        os.fsync(temp.fileno())
        temp_path = temp.name
    os.replace(temp_path, target)
print(json.dumps(report, indent=2, ensure_ascii=False))
