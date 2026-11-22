#!/usr/bin/env python3
"""Source-locked pixel audit of punctuation in the 2013 0_wisdom page.

Run from a repository checkout:
    python3 sims/2013_0_wisdom_punctuation_image_audit.py
Dependency: Pillow.
"""
from __future__ import annotations

from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "05.jpg"
EXPECTED_GIT_BLOB = "2829e13812015601ff1014cb4427587b4a8aa3a6"
EXPECTED_SHA256 = "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7"

# Native-image crop boxes (left, top, right, bottom), in 2400x3600 coordinates.
REGIONS = {
    "after_some_wisdom": ((1050, 675, 1110, 780), "red", 11, [1, 3, 3, 3, 1]),
    "after_encrypted": ((810, 1325, 880, 1435), "black", 11, [1, 3, 3, 3, 1]),
    "after_know_this": ((865, 1995, 930, 2105), "red", 11, [1, 3, 3, 3, 1]),
    "after_first_sacred": ((745, 915, 805, 980), "black", 4, [1, 2, 1]),
    "after_second_sacred": ((800, 1130, 875, 1190), "black", 4, [1, 2, 1]),
}
TABLE_REGION = (550, 2150, 1800, 2800)


def is_ink(rgb: tuple[int, int, int], kind: str) -> bool:
    r, g, b = rgb
    if kind == "red":
        return r > 85 and r > 1.4 * g and r > 1.4 * b and g < 130
    return max(rgb) < 110


def components(image: Image.Image, box: tuple[int, int, int, int], kind: str):
    """Return detached 8-connected ink components of the requested crop."""
    x0, y0, x1, y1 = box
    px = image.load()
    foreground = {
        (x, y)
        for y in range(y0, y1)
        for x in range(x0, x1)
        if is_ink(px[x, y], kind)
    }
    found = []
    while foreground:
        seed = foreground.pop()
        q = [seed]
        comp = [seed]
        while q:
            x, y = q.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    p = (x + dx, y + dy)
                    if p in foreground:
                        foreground.remove(p)
                        q.append(p)
                        comp.append(p)
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        w, h, area = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1, len(comp)
        if 5 <= w <= 20 and 5 <= h <= 20 and 20 <= area <= 300:
            found.append({
                "center": [round(sum(xs) / area, 2), round(sum(ys) / area, 2)],
                "bbox": [min(xs), min(ys), max(xs) + 1, max(ys) + 1],
                "size": [w, h],
                "area": area,
            })
    return sorted(found, key=lambda c: (c["center"][1], c["center"][0]))


def row_counts(found: list[dict]) -> list[int]:
    rows: list[list[float]] = []
    for c in found:
        y = c["center"][1]
        if not rows or abs(y - sum(rows[-1]) / len(rows[-1])) > 10:
            rows.append([y])
        else:
            rows[-1].append(y)
    return [len(row) for row in rows]


def main() -> None:
    raw = IMAGE.read_bytes()
    git_blob = hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()
    sha256 = hashlib.sha256(raw).hexdigest()
    assert git_blob == EXPECTED_GIT_BLOB, (git_blob, EXPECTED_GIT_BLOB)
    assert sha256 == EXPECTED_SHA256, (sha256, EXPECTED_SHA256)
    image = Image.open(IMAGE).convert("RGB")
    assert image.size == (2400, 3600), image.size

    result = {
        "source": str(IMAGE.relative_to(ROOT)),
        "dimensions": list(image.size),
        "git_blob_sha1": git_blob,
        "sha256": sha256,
        "regions": {},
    }
    for label, (box, ink, expected_n, expected_rows) in REGIONS.items():
        found = components(image, box, ink)
        counts = row_counts(found)
        assert len(found) == expected_n, (label, len(found), found)
        assert counts == expected_rows, (label, counts, found)
        result["regions"][label] = {
            "ink": ink,
            "bbox": list(box),
            "component_count": len(found),
            "row_occupancy": counts,
            "dot_centers_xy": [c["center"] for c in found],
            "component_bboxes_xyxy": [c["bbox"] for c in found],
        }

    table_dots = components(image, TABLE_REGION, "black")
    assert len(table_dots) == 0, table_dots
    result["table_rows"] = {
        "bbox": list(TABLE_REGION),
        "detached_square_components": len(table_dots),
        "interpretation": (
            "The five trailing transcription ⁘ characters are not separate "
            "10/13-dot marks in the original table image; row divisions are visual spacing."
        ),
    }
    result["decision"] = {
        "three_transcription_⁜_positions": (
            "11-dot stencils with row occupancy 1/3/3/3/1; red, black, red respectively."
        ),
        "two_prose_⁘_positions": (
            "Four-dot diamond punctuation with row occupancy 1/2/1; both black."
        ),
        "table_row_⁘_positions": (
            "No corresponding detached dot stencils in the image."
        ),
        "mapping": (
            "The proposed ⁜-to-13-dot and ⁘-to-10-dot mapping is falsified for this source image."
        ),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
