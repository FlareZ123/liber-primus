#!/usr/bin/env python3
"""Audit word-divider displacement against original LP2 JPEGs.

Requires numpy, opencv-python. The original 75-JPEG archive may be passed via
--archive; otherwise read resources/liber-primus/17.jpg through 74.jpg.
This is an original-image geometry test, not rune OCR or a decryption.
"""
from __future__ import annotations
import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]


def image_for(page: int, archive: ZipFile | None) -> np.ndarray:
    name = f"{page + 17:02}.jpg"
    if archive is None:
        return cv2.imread(str(ROOT / "resources" / "liber-primus" / name), cv2.IMREAD_GRAYSCALE)
    data = np.frombuffer(archive.read(f"liber-primus-jpegs/{name}"), np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_GRAYSCALE)


def components(image: np.ndarray, bounds: tuple[int, int, int, int]):
    x0, y0, x1, y1 = bounds
    mask = (image[y0:y1, x0:x1] < 160).astype(np.uint8)
    _, _, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    return [(int(x+x0), int(y+y0), int(w), int(h), int(area))
            for x, y, w, h, area in stats[1:]]


def dividers(image: np.ndarray, page: int):
    glyphs = [p for p in components(image, (440, 440, 2100, 3250))
              if 80 <= p[3] <= 122 and 7 <= p[2] <= 110 and p[4] > 160]
    lines = defaultdict(list)
    for glyph in glyphs:
        lines[round(glyph[1]/188)].append(glyph)
    found = []
    for line, line_glyphs in lines.items():
        line_glyphs.sort()
        for before, after in zip(line_glyphs, line_glyphs[1:]):
            left, right = before[0]+before[2], after[0]
            if not 14 <= right-left <= 40:
                continue
            top = max(0, min(before[1], after[1])-4)
            bottom = min(image.shape[0], max(before[1]+before[3], after[1]+after[3])+4)
            candidates = [q for q in components(image, (left, top, right, bottom))
                          if 2 <= q[2] <= 16 and 2 <= q[3] <= 16 and 2 <= q[4] <= 200]
            if len(candidates) != 1:
                continue
            x, y, w, h, area = candidates[0]
            found.append((page, line, right-x-w, x-left, right-left, w, h))
    return found


def run(archive_file: Path | None):
    archive = ZipFile(archive_file) if archive_file else None
    try:
        records = []
        for page in range(58):
            image = image_for(page, archive)
            assert image is not None and image.shape == (3600, 2400), page
            records.extend(dividers(image, page))
    finally:
        if archive:
            archive.close()
    unknown = [r for r in records if r[0] < 56]
    solved = [r for r in records if r[0] >= 56]
    assert (len(unknown), len(solved)) == (2579, 37)

    def summary(items):
        vals = Counter(int(r[2]) for r in items)
        return {"dividers": len(items),
                "right_clearance_px": dict(sorted(vals.items())),
                "outside_6_to_8_px": sum(not 6 <= r[2] <= 8 for r in items)}

    data = np.asarray([r[2] for r in unknown], dtype=int)
    rng = np.random.default_rng(3301)
    move = rng.integers(0, 2, len(data)) == 1
    one_sided = data.copy()
    one_sided[move] -= 2
    signs = rng.integers(0, 2, len(data)) * 2 - 1
    two_sided = data.copy()
    two_sided[move] -= 2 * signs[move]
    report = {"original_images": "LP2 17.jpg through 74.jpg",
              "component_rule": "black threshold <160, glyph height80..122 and area>160; solitary dot 2..16 in glyph bbox gap14..40",
              "unsolved_p0_p55": summary(unknown),
              "solved_p56_p57": summary(solved),
              "synthetic_bit_density": float(move.mean()),
              "one_sided_2px_plant_outliers": int(((one_sided<6)|(one_sided>8)).sum()),
              "symmetric_2px_plant_outliers": int(((two_sided<6)|(two_sided>8)).sum())}
    assert report["unsolved_p0_p55"]["outside_6_to_8_px"] == 2
    assert report["solved_p56_p57"]["outside_6_to_8_px"] == 0
    assert report["one_sided_2px_plant_outliers"] == 1231
    assert report["symmetric_2px_plant_outliers"] == 1047
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    print(json.dumps(run(args.archive), indent=2))


if __name__ == "__main__":
    main()
