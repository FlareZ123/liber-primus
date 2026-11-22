#!/usr/bin/env python3
"""Source-exact p53/p55 moth-copy comparison on the original LP2 JPEGs.

Run as a single-file test from any directory. Only the fixed source rasters,
their original coordinates and unaltered pixel intensities enter the test.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    53: ("70.jpg", "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548"),
    54: ("71.jpg", "dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4"),
    55: ("72.jpg", "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"),
}


def source_page(number: int) -> np.ndarray:
    filename, digest = SOURCES[number]
    path = ROOT / "resources" / "liber-primus" / filename
    data = path.read_bytes()
    assert sha256(data).hexdigest() == digest, f"original JPEG changed: {filename}"
    gray = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert gray is not None and gray.shape == (3600, 2400)
    return gray


def locate(template: np.ndarray, page: np.ndarray) -> tuple[float, tuple[int, int]]:
    # Fixed p53 moth-and-background crop; search same physical lower-paper area.
    search = page[2620:3310, 480:2000]
    scores = cv2.matchTemplate(search, template, cv2.TM_CCOEFF_NORMED)
    _, peak, _, at = cv2.minMaxLoc(scores)
    return float(peak), (480 + at[0], 2620 + at[1])


def main() -> None:
    p53, p54, p55 = (source_page(n) for n in (53, 54, 55))
    template = p53[2720:3160, 600:1850]
    score, (left, top) = locate(template, p55)
    negative_score, negative_at = locate(template, p54)
    assert (left, top) == (666, 2787), (left, top)
    assert score > 0.9998, score
    assert negative_score < 0.3, (negative_score, negative_at)

    matching = p55[top:top + template.shape[0], left:left + template.shape[1]]
    difference = template.astype(np.int16) - matching.astype(np.int16)
    large = np.abs(difference) > 10
    ys, xs = np.where(large)
    # All large residuals are at the crop's rightmost edge where p55's
    # neighboring ornamental vine intrudes, outside the moth itself.
    assert len(xs) == 17, len(xs)
    assert np.all(xs >= 1248) and np.all((ys >= 42) & (ys <= 50))
    ink53 = template < 128
    ink55 = matching < 128
    iou = float(np.count_nonzero(ink53 & ink55) / np.count_nonzero(ink53 | ink55))
    assert iou > 0.994, iou
    print(f"source-sha256 verified: 70.jpg, 71.jpg, 72.jpg")
    print(f"p53 moth origin (600,2720); p55 exact-match origin ({left},{top})")
    print(f"translation: (+{left - 600},+{top - 2720}) pixels")
    print(f"normalized gray correlation: {score:.9f}; p54 wrong-page: {negative_score:.9f}")
    print(f"gray MAE: {np.mean(np.abs(difference)):.9f}; threshold128 ink IoU: {iou:.9f}")
    print(f"abs(pixel difference)>10: {len(xs)} of {template.size}; all at non-moth right-edge ornament")
    print("PASS: identical copied moth artwork within original JPEG quantization; no distinct altered moth-symbol channel")


if __name__ == "__main__":
    main()
