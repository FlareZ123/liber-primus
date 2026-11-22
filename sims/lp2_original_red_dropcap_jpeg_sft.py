"""Reproduce red-initial JPEG component widths in the published 2014 LP2 scans.

This is a source-image verification program and produces no cipher plaintext.
It expects the original 75 scans in liber-primus-jpegs/00.jpg..74.jpg.
The seventeen LP1 pre-LP2 pages form an independent known-solved typography control.
Portable Python 3.12+ (Windows 11), Pillow, NumPy and OpenCV are required.
No files are written.

The component threshold selects dark-red ink pixels and counts eight-connected
components; it does not OCR a single original GP29 rune.
"""
from __future__ import annotations

import io
import json
import sys
import zipfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# (physical page, x, y, width, height, red pixel area), all original 2400x3600.
EXPECTED = (
    (0, 601, 667, 150, 498, 32002),
    (3, 601, 668, 150, 497, 24838),
    (3, 601, 2098, 229, 495, 39656),
    (6, 601, 1721, 149, 497, 31004),
    (8, 602, 667, 284, 498, 31971),
    (15, 601, 1731, 150, 497, 24846),
    (23, 601, 1156, 230, 497, 39216),
    (27, 601, 912, 230, 497, 54986),
    (33, 601, 667, 230, 498, 56866),
    (33, 601, 1908, 219, 498, 45269),
    (39, 601, 1852, 231, 498, 53570),
    (40, 601, 667, 150, 498, 31672),
    (54, 601, 912, 149, 497, 31007),
)


# Independent 2014 LP1 known-solved-page positive: same original typography.
# (original scan, x, y, width, height, red pixel area)
EXPECTED_LP1 = (
    (1, 601, 671, 165, 552, 46521),
    (3, 601, 669, 230, 496, 39119),
    (4, 601, 2042, 149, 496, 35636),
    (6, 600, 669, 151, 496, 29354),
    (9, 600, 2393, 150, 499, 29456),
    (10, 600, 667, 150, 498, 30325),
    (13, 601, 1488, 150, 499, 32032),
    (13, 600, 2487, 150, 497, 31099),
    (14, 601, 668, 149, 498, 31073),
    (16, 601, 668, 149, 497, 31008),
)


def measure_scans(
    archive: Path, scan_to_page: dict[int, int]
) -> list[tuple[int, int, int, int, int, int]]:
    """Read original JPEG pixel masks and report large red first initials."""
    recorded: list[tuple[int, int, int, int, int, int]] = []
    with zipfile.ZipFile(archive) as zf:
        for scan, page in scan_to_page.items():
            name = f"liber-primus-jpegs/{scan:02}.jpg"
            rgb = np.asarray(Image.open(io.BytesIO(zf.read(name))).convert("RGB"))
            assert rgb.shape == (3600, 2400, 3), name
            red = (rgb[:, :, 0] > 100) & (rgb[:, :, 0] > 1.6 * rgb[:, :, 1]) & (
                rgb[:, :, 0] > 1.6 * rgb[:, :, 2]
            ) & (rgb[:, :, 1] < 130)
            _, _, boxes, _ = cv2.connectedComponentsWithStats(red.astype(np.uint8))
            for x, y, width, height, area in boxes:
                if area > 2500 and height > 350 and 550 < x < 1000 and 400 < y < 3200:
                    recorded.append((page, int(x), int(y), int(width), int(height), int(area)))
    return sorted(recorded, key=lambda a: (a[0], a[2]))


def measure(archive: Path) -> list[tuple[int, int, int, int, int, int]]:
    """Return (physical LP2 page, x, y, width, height, red pixel area)."""
    return measure_scans(archive, {p + 17: p for p in range(56)})


def measure_lp1(archive: Path) -> list[tuple[int, int, int, int, int, int]]:
    """Return source-positive original solved LP1 typography control."""
    return measure_scans(archive, {p: p for p in range(17)})

def verify_source(archive: Path) -> list[tuple[int, int, int, int, int, int]]:
    """Exact independent source-image regression; use only original JPEGs."""
    observed = measure(archive)
    if observed != list(EXPECTED):
        raise AssertionError(f"red giant component mismatch: {observed!r}")
    lp1 = measure_lp1(archive)
    if lp1 != list(EXPECTED_LP1):
        raise AssertionError(f"known-solved LP1 red initials mismatch: {lp1!r}")
    return observed


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Specify one source archive: liber-primus-jpegs.zip")
    expected = verify_source(Path(sys.argv[1]))
    print(json.dumps({"verified": True, "lp2_red_giants": len(expected),
        "lp1_solved_red_giants": len(EXPECTED_LP1), "boxes": expected}, indent=2))
