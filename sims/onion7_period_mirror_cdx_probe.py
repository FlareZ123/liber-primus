#!/usr/bin/env python3
"""Retrieve and hash period-linked Onion7 mirrors; compare any recovered ZIP pages to canonical scans.

The exact source leads are frozen from Wikia page 9003's 2014 revisions:
  2014-05-02: http://shadow-code.org/onion7.zip
  2014-05-03: http://imgur.com/a/8xnWx
  2015-08:    http://tinyurl.com/2014onion7
This script queries public archive indexes only, then replays only a positive exact capture.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("RUNNER_TEMP", "/tmp")) / "onion7-period-mirror"
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = [
    ("shadow-code-http-zip", "http://shadow-code.org/onion7.zip"),
    ("shadow-code-https-zip", "https://shadow-code.org/onion7.zip"),
    ("shadow-code-www-http-zip", "http://www.shadow-code.org/onion7.zip"),
    ("shadow-code-www-https-zip", "https://www.shadow-code.org/onion7.zip"),
    ("shadow-code-http-root", "http://shadow-code.org/"),
    ("tinyurl-http-2014onion7", "http://tinyurl.com/2014onion7"),
    ("tinyurl-https-2014onion7", "https://tinyurl.com/2014onion7"),
    ("imgur-http-8xnWx", "http://imgur.com/a/8xnWx"),
    ("imgur-https-8xnWx", "https://imgur.com/a/8xnWx"),
]
CDX = "https://web.archive.org/cdx/search/cdx"
ARQUIVO = "https://arquivo.pt/wayback/cdx"
HEADERS = {
    "User-Agent": "LiberPrimus-period-mirror-research/1.0 (read-only source comparison)",
    "Accept": "application/json, text/plain, */*",
}
CANONICAL_DIR = ROOT / "resources" / "liber-primus"


def fetch(url: str, timeout: int = 45) -> tuple[int, str, bytes]:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.status, response.geturl(), response.read()


def cdx_query(endpoint: str, target: str, match_type: str = "exact") -> dict:
    params = {
        "url": target,
        "output": "json",
        "from": "2014",
        "to": "2016",
        "fl": "timestamp,original,mimetype,statuscode,digest,length,redirect",
        "matchType": match_type,
        "limit": "10000",
    }
    url = endpoint + "?" + urllib.parse.urlencode(params)
    try:
        status, final_url, body = fetch(url, timeout=60)
        text = body.decode("utf-8", "replace")
        data = json.loads(text)
        if not data:
            rows = []
        else:
            header = data[0]
            rows = [dict(zip(header, row)) for row in data[1:]]
        return {"status": status, "url": final_url, "rows": rows, "error": None}
    except Exception as exc:
        return {"status": None, "url": url, "rows": [], "error": f"{type(exc).__name__}: {exc}"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compare_zip(zip_path: Path) -> dict:
    try:
        from PIL import Image, ImageChops, ImageStat
    except Exception as exc:
        return {"error": f"Pillow unavailable: {exc}"}
    rows = []
    with zipfile.ZipFile(zip_path) as zf:
        names = set(zf.namelist())
        for page in range(58):
            candidate = next((n for n in names if Path(n).suffix.lower() == ".jpg" and Path(n).stem.isdigit() and int(Path(n).stem) == page), None)
            if candidate is None:
                rows.append({"page": page, "status": "missing-in-archive"})
                continue
            archived = zf.read(candidate)
            canonical_path = CANONICAL_DIR / f"{page + 17:02d}.jpg"
            if not canonical_path.exists():
                rows.append({"page": page, "status": "canonical-missing", "archive_path": candidate})
                continue
            canonical = canonical_path.read_bytes()
            item = {
                "page": page,
                "archive_path": candidate,
                "archive_bytes": len(archived),
                "archive_sha256": sha256(archived),
                "canonical_path": str(canonical_path.relative_to(ROOT)),
                "canonical_bytes": len(canonical),
                "canonical_sha256": sha256(canonical),
                "byte_equal": archived == canonical,
            }
            try:
                import io
                with Image.open(io.BytesIO(archived)) as a, Image.open(canonical_path) as c:
                    a.load(); c.load()
                    item["archive_size"] = list(a.size)
                    item["canonical_size"] = list(c.size)
                    if a.size != c.size:
                        item["decoded_comparison"] = "dimension-mismatch"
                    else:
                        ag = a.convert("L")
                        cg = c.convert("L")
                        diff = ImageChops.difference(ag, cg)
                        item["mean_abs_gray_difference"] = round(ImageStat.Stat(diff).mean[0], 6)
                        item["max_abs_gray_difference"] = diff.getextrema()[1]
                        item["gray_diff_bbox"] = list(diff.getbbox()) if diff.getbbox() else None
                        for threshold in (64, 128, 192):
                            am = ag.point(lambda x, t=threshold: 255 if x < t else 0)
                            cm = cg.point(lambda x, t=threshold: 255 if x < t else 0)
                            md = ImageChops.difference(am, cm)
                            hist = md.histogram()
                            item[f"binary_diff_pixels_t{threshold}"] = sum(hist[1:])
                            item[f"binary_diff_bbox_t{threshold}"] = list(md.getbbox()) if md.getbbox() else None
                        item["decoded_comparison"] = "pixel-identical" if diff.getbbox() is None else "pixel-different"
            except Exception as exc:
                item["decoded_comparison_error"] = f"{type(exc).__name__}: {exc}"
            rows.append(item)
    counts = {
        "pages_present": sum(1 for x in rows if x.get("status") is None),
        "byte_equal": sum(1 for x in rows if x.get("byte_equal") is True),
        "decoded_pixel_equal": sum(1 for x in rows if x.get("decoded_comparison") == "pixel-identical"),
        "decoded_pixel_different": sum(1 for x in rows if x.get("decoded_comparison") == "pixel-different"),
        "missing": sum(1 for x in rows if x.get("status") == "missing-in-archive"),
    }
    return {"zip_sha256": sha256(zip_path.read_bytes()), "zip_bytes": zip_path.stat().st_size, "counts": counts, "pages": rows}


def replay_capture(row: dict, label: str) -> dict:
    timestamp = row.get("timestamp", "")
    original = row.get("original", "")
    replay = f"https://web.archive.org/web/{timestamp}id_/{original}"
    try:
        status, final_url, body = fetch(replay, timeout=120)
        digest = sha256(body)
        suffix = ".zip" if body.startswith(b"PK\x03\x04") else (".jpg" if body.startswith(b"\xff\xd8") else ".bin")
        dest = OUT / f"{label}-{timestamp}{suffix}"
        dest.write_bytes(body)
        result = {
            "status": status, "final_url": final_url, "bytes": len(body),
            "sha256": digest, "saved_path": str(dest), "is_zip": body.startswith(b"PK\x03\x04"),
        }
        if body.startswith(b"PK\x03\x04"):
            result["zip_comparison"] = compare_zip(dest)
        elif body[:1000].lstrip().lower().startswith((b"<!doctype html", b"<html")):
            html = body.decode("utf-8", "replace")
            result["html_imgur_urls"] = sorted(set(re.findall(r"https?://(?:i\.)?imgur\.com/[^\s\"'<>]+", html, re.I)))
        return result
    except Exception as exc:
        return {"replay": replay, "error": f"{type(exc).__name__}: {exc}"}


def main() -> int:
    report = {
        "purpose": "Recover source-linked period Onion7 image mirrors; exact bytes only, no cipher speculation.",
        "period": "2014-01-01 through 2016-12-31",
        "source_basis": [
            {"date": "2014-05-02T17:50:04Z", "pageid": 9003, "revision": 15859, "url": "http://shadow-code.org/onion7.zip"},
            {"date": "2014-05-03T10:33:23Z", "pageid": 9003, "revision": 15873, "url": "http://imgur.com/a/8xnWx"},
            {"date": "2015-08-17", "pageid": 9003, "url": "http://tinyurl.com/2014onion7"},
        ],
        "sources": [],
    }
    candidates = []
    redirect_candidates = []
    for label, target in SOURCES:
        wayback = cdx_query(CDX, target, "exact")
        arquivo = cdx_query(ARQUIVO, target, "exact")
        item = {
            "label": label, "target": target,
            "wayback": wayback, "arquivo_pt": arquivo,
        }
        report["sources"].append(item)
        for row in wayback.get("rows", []):
            original = row.get("original", "").lower()
            statuscode = row.get("statuscode", "")
            if statuscode == "200" and (
                "onion7.zip" in original or "imgur.com/a/8xnwx" in original
            ):
                candidates.append((label, row))
            if "tinyurl.com/2014onion7" in original and statuscode in {"200", "301", "302", "303", "307", "308"}:
                redirect_candidates.append((label, row))
    # Also inspect all 2014-2016 captures under the named mirror host, then keep only
    # the ZIP, its HTML index, or numbered image paths.
    domain = cdx_query(CDX, "shadow-code.org/*", "domain")
    domain_rows = [
        r for r in domain.get("rows", [])
        if re.search(r"(onion7\.zip|(?:^|/)index\.html|/\d+\.jpg)$", r.get("original", ""), re.I)
    ]
    report["shadow_code_domain_census"] = {
        "status": domain.get("status"), "error": domain.get("error"),
        "all_rows": len(domain.get("rows", [])), "relevant_rows": domain_rows,
    }
    for row in domain_rows:
        if row.get("statuscode") == "200":
            candidates.append(("shadow-code-domain", row))
    # Replay one distinct capture per exact source URL, preferring earliest 2014 capture.
    replayed = []
    seen = set()
    for label, row in sorted(candidates + redirect_candidates, key=lambda x: (x[0], x[1].get("timestamp", ""))):
        key = (label, row.get("timestamp"), row.get("original"))
        if key in seen:
            continue
        seen.add(key)
        replayed.append({"label": label, "capture": row, "replay": replay_capture(row, label)})
    report["replayed_captures"] = replayed
    report["summary"] = {
        "wayback_exact_queries": sum(1 for x in report["sources"] if x["wayback"].get("error") is None),
        "arquivo_exact_queries": sum(1 for x in report["sources"] if x["arquivo_pt"].get("error") is None),
        "wayback_exact_captures": sum(len(x["wayback"].get("rows", [])) for x in report["sources"]),
        "arquivo_exact_captures": sum(len(x["arquivo_pt"].get("rows", [])) for x in report["sources"]),
        "zip_replays": sum(1 for x in replayed if x["replay"].get("is_zip")),
        "replay_errors": sum(1 for x in replayed if x["replay"].get("error")),
    }
    dest = ROOT / "im-results" / "onion7-period-mirror-cdx.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], sort_keys=True))
    for item in report["sources"]:
        print(json.dumps({
            "label": item["label"],
            "wayback_rows": len(item["wayback"].get("rows", [])),
            "wayback_error": item["wayback"].get("error"),
            "arquivo_rows": len(item["arquivo_pt"].get("rows", [])),
            "arquivo_error": item["arquivo_pt"].get("error"),
        }, sort_keys=True))
    for item in replayed:
        print(json.dumps({"label": item["label"], "capture": item["capture"], "replay": item["replay"]}, sort_keys=True))
    # Network errors remain explicit/inconclusive; a completed all-empty census is a bounded negative.
    return 1 if any(x["wayback"].get("error") for x in report["sources"]) else 0


if __name__ == "__main__":
    sys.exit(main())
