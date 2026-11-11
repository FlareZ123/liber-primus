"""Original p55 fold-image comparison selected by signed FOLD -> SB route.

Run from the repository root. Source is resources/liber-primus/72.jpg,
the original (not retouched) p55 JPEG.  Only the outer mirrored botanical
vines are compared; text, central tree and moth are excluded by crop.

This is a physical-image clue test and does not decode unknown LP2 text.
"""
from __future__ import annotations

import hashlib
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path("resources/liber-primus/72.jpg")
EXPECTED_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"


def components(data: np.ndarray) -> list[tuple[int, int, int]]:
    """Return 8-connected component (area, median-ish x, y) centroids."""
    binary = data.astype(np.uint8)
    seen = np.zeros_like(binary, dtype=bool)
    height, width = binary.shape
    result = []
    for py in range(height):
        for px in range(width):
            if not binary[py, px] or seen[py, px]:
                continue
            frontier = deque([(px, py)])
            seen[py, px] = True
            xs, ys = [], []
            while frontier:
                x, y = frontier.pop()
                xs.append(x)
                ys.append(y)
                for yy in range(max(0, y - 1), min(height, y + 2)):
                    for xx in range(max(0, x - 1), min(width, x + 2)):
                        if binary[yy, xx] and not seen[yy, xx]:
                            seen[yy, xx] = True
                            frontier.append((xx, yy))
            result.append((len(xs), round(sum(xs) / len(xs)),
                           round(sum(ys) / len(ys))))
    return sorted(result, reverse=True)


def main() -> None:
    raw = SOURCE.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == EXPECTED_SHA256
    with Image.open(SOURCE) as image:
        assert image.size == (2400, 3600)
        gray = np.asarray(image.convert("L").resize((1200, 1800), Image.Resampling.LANCZOS))
    dark = gray < 100
    xs = np.arange(20, 295)
    left = dark[330:1250, :][:, xs]
    scores = {}
    exact_diff = None
    for axis in (594, 596, 598, 600, 602, 604, 606):
        right = dark[330:1250, :][:, 2 * axis - 1 - xs]
        intersect = int(np.logical_and(left, right).sum())
        union = int(np.logical_or(left, right).sum())
        scores[axis] = intersect / union
        if axis == 600:
            exact_diff = np.logical_xor(left, right)
    assert exact_diff is not None
    assert scores[600] > 0.97
    assert max(v for k, v in scores.items() if k != 600) < 0.25
    blobs = components(exact_diff)
    top_two = [(area, x + 20, y + 330) for area, x, y in blobs[:2]]
    # Both large outliers localize to two deliberately pale rings in the
    # otherwise exact left/right drawing; remaining differences are tiny.
    assert all(area >= 95 for area, _, _ in top_two)
    assert abs(top_two[0][1] - 197) <= 2 and abs(top_two[0][2] - 737) <= 2
    assert abs(top_two[1][1] - 189) <= 2 and abs(top_two[1][2] - 769) <= 2
    print({
        "status": "physical-fold indicator, no plaintext recovered",
        "source_sha256": EXPECTED_SHA256,
        "threshold": 100,
        "size_half": [1200, 1800],
        "left_crop": "x=20..294, y=330..1249",
        "reflection_axis_half": 600,
        "iou_by_axis": scores,
        "pixel_disagreements": int(exact_diff.sum()),
        "connected_regions": len(blobs),
        "largest_regions": top_two,
        "interpretation": "two deliberate pale rings dominate near-exact reflected vines",
    })


if __name__ == "__main__":
    main()
