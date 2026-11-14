#!/usr/bin/env python3
"""Frozen comparison of four independently dated Clker plates with original LP2 p42 art.

Positive: a first-party image source whose complete distinctive ink geometry
registers with the exact LP2 border under a single fixed reflection. No key
or plaintext is inferred from a visually similar drawing.
"""
from __future__ import annotations

import hashlib
import io
import json
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
THRESHOLD = 180
PLATES = [
    ("mswildcrd", "2013-01-16", "H/h/J/w/S/E/swirl-tree-hi.png"),
    ("missyven", "2013-06-06", "4/W/z/w/A/z/swirl-tree-hi.png"),
    ("DeAwn_Bunch", "2012-07-12", "C/x/Q/b/Y/j/leaf-flourish-hi.png"),
    ("Chris", "2013-10-21", "b/6/b/y/d/v/swirl-black-filigree-hi.png"),
]


def mask(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    bits = bytes(int(alpha >= 128 and max(red, green, blue) < THRESHOLD)
                 for red, green, blue, alpha in rgba.getdata())
    return Image.frombytes("L", rgba.size, bits)


def iou(first: Image.Image, second: Image.Image) -> float:
    assert first.size == second.size
    left, right = first.tobytes(), second.tobytes()
    together = sum(bool(a or b) for a, b in zip(left, right))
    return sum(bool(a and b) for a, b in zip(left, right)) / together if together else 0.0


def compare(candidate: Image.Image, target: Image.Image) -> dict:
    ink = mask(candidate)
    bounds = ink.getbbox()
    target_bounds = target.getbbox()
    if bounds is None or target_bounds is None:
        return {"status": "no_ink"}
    dimensions = (target_bounds[2] - target_bounds[0],
                  target_bounds[3] - target_bounds[1])
    norm = ink.crop(bounds).resize(dimensions, Image.Resampling.NEAREST)
    scores = {}
    for direction, figure in (
        ("original", norm),
        ("horizontal_mirror", ImageOps.mirror(norm)),
    ):
        canvas = Image.new("L", target.size)
        canvas.paste(figure, target_bounds[:2])
        scores[direction] = round(iou(target, canvas), 8)
    return {"status": "registered", "source_bbox": bounds,
            "original_bbox": target_bounds,
            "orientation_iou": scores,
            "best_iou": max(scores.values()),
            "frozen_geometry": "ink bbox crop, nearest rescale, horizontal mirror only"}


def fetch(url: str) -> tuple[bytes, dict]:
    request = urllib.request.Request(
        url, headers={
            "Accept": "image/png,image/*;q=0.8,*/*;q=0.1",
            "User-Agent": "Mozilla/5.0 (compatible; source-attribution research)",
        })
    with urllib.request.urlopen(request, timeout=18) as response:
        content = response.read(10_000_001)
        if len(content) > 10_000_000:
            raise ValueError("response exceeds 10MB source-file cap")
        return content, {
            "content_type": response.headers.get("Content-Type", ""),
            "last_modified": response.headers.get("Last-Modified", ""),
        }


def main() -> None:
    image = Image.open(ROOT / "resources/liber-primus/59.jpg").convert("RGB")
    assert image.size == (2400, 3600)
    left = mask(image.crop((0, 0, 500, 3600)))
    right = mask(image.crop((1900, 0, 2400, 3600)))
    control = {
        "source": "resources/liber-primus/59.jpg",
        "mirror_iou": round(iou(left, ImageOps.mirror(right)), 8),
        "vertical_control_iou": round(iou(left, ImageOps.flip(right)), 8),
        "source_ink_bbox": left.getbbox(),
    }
    print("SOURCE_POSITIVE_CONTROL", json.dumps(control))
    assert control["mirror_iou"] > 0.98
    reports = []
    for uploader, published, path in PLATES:
        url = "https://www.clker.com/cliparts/" + path
        report = {"uploader": uploader,
                  "period_html_date": published,
                  "source_png_url": url}
        try:
            payload, response_headers = fetch(url)
            if not payload.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError("not a PNG; response prefix " + repr(payload[:32]))
            image = Image.open(io.BytesIO(payload))
            image.load()
            report.update({
                "status": "retrieved",
                "source_sha256": hashlib.sha256(payload).hexdigest(),
                "pixels": image.size,
                "response_headers": response_headers,
                "registration": compare(image, left),
            })
        except (OSError, urllib.error.URLError, TimeoutError, ValueError) as error:
            report.update({"status": "inaccessible", "exception": str(error)[:240]})
        print("CANDIDATE", json.dumps(report))
        reports.append(report)
    matched = [r["source_png_url"] for r in reports
               if r["status"] == "retrieved"
               and r["registration"].get("best_iou", 0) >= 0.90]
    decision = {
        "originals_retrieved": sum(x["status"] == "retrieved" for x in reports),
        "near_exact_90pct_matches": matched,
        "conclusion": ("Only byte-retrieved image matches may be considered a source candidate. "
                       "No cipher, key or plaintext is inferred by this image test."),
    }
    print("FROZEN_DECISION", json.dumps(decision))


if __name__ == "__main__":
    main()
