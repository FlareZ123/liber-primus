"""Read-only source test: find the same five-dot stamp on LP2 p7/p23/p56.

Requires Python 3, numpy and opencv-python. Run from any working directory.
Source images are resources/liber-primus/00.jpg through 74.jpg.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
EXPECTED = {
    24: [(797, 3106), (992, 3167), (1297, 2867), (1479, 3128), (1527, 2936)],
    40: [(797, 568), (992, 507), (1297, 807), (1479, 546), (1527, 738)],
    73: [(873, 2517), (921, 2708), (1104, 2447), (1408, 2747), (1604, 2686)],
}
SHA256 = {
    24: "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
    40: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    73: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}


def components(page: int) -> tuple[np.ndarray, list[tuple[int, int]]]:
    payload = (ROOT / f"{page:02d}.jpg").read_bytes()
    if page in SHA256:
        assert hashlib.sha256(payload).hexdigest() == SHA256[page], page
    image = cv2.imdecode(np.frombuffer(payload, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (3600, 2400), (page, image.shape)
    mask = image < 75
    _, _, stats, ctr = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    dots = []
    for (_, _, width, height, area), (x, y) in zip(stats[1:], ctr[1:]):
        if 65 <= width <= 75 and 65 <= height <= 75 and 3000 <= area <= 3900:
            dots.append((round(float(x)), round(float(y))))
    return mask, sorted(dots)


def iou(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.count_nonzero(a & b)) / float(np.count_nonzero(a | b))


def patch(image: np.ndarray, center: tuple[int, int], radius: int = 46) -> np.ndarray:
    x, y = center
    return image[y - radius : y + radius + 1, x - radius : x + radius + 1]


def main() -> None:
    found = {}
    masks = {}
    for page in range(75):
        mask, dots = components(page)
        if dots:
            found[page] = dots
        if page in EXPECTED:
            assert dots == EXPECTED[page], (page, dots)
            masks[page] = mask
    assert {page for page, dots in found.items() if len(dots) == 5} == set(EXPECTED)
    assert {page: len(dots) for page, dots in found.items()} == {24: 5, 40: 5, 50: 3, 73: 5}
    print("Original 75-image source census:", {page: len(dots) for page, dots in found.items()})

    p7, p23, p56 = (EXPECTED[page] for page in (24, 40, 73))
    assert all(a[0] == b[0] and a[1] + b[1] == 3674 for a, b in zip(p7, p23))
    assert all(abs(a[0] + b[0] - 2400) <= 1 and abs(a[1] - b[1] - 420) <= 1
               for a, b in zip(p7, reversed(p56)))
    v = [iou(np.flipud(patch(masks[24], a)), patch(masks[40], b))
         for a, b in zip(p7, p23)]
    h = [iou(np.fliplr(patch(masks[24], a)), patch(masks[73], b))
         for a, b in zip(p7, reversed(p56))]
    print("p7 -> p23 reflection IoUs:", [round(x, 6) for x in v])
    print("p7 -> p56 reflection IoUs:", [round(x, 6) for x in h])
    assert min(v) > 0.997 and min(h) > 0.95
    print("PASS: exactly three five-disc occurrences; p23 is a vertical reflection,"
          " p56 a horizontal reflection and vertical translation of p7.")
    print("Interpretation: an identical source illustration, no selected cipher inverse.")


if __name__ == "__main__":
    main()
