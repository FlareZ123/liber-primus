"""Original JPEG registration gate: are LP2 p32 and p55 trees related?

Read-only single-file test. Requires opencv-python, numpy. Run from the repo
root with: python sims/lp2_p32_p55_tree_blur_registration_sft.py

The same-image interpretation is a morphological hypothesis, not an LP2 key.
A high correlation after fitted blur is evidence of pictorial similarity, not
by itself an authenticated exact source identity or decoding instruction.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'resources' / 'liber-primus'
SOURCES = {
    'p32': ('49.jpg', 'c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72'),
    'p55': ('72.jpg', 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba'),
}


def image(name: str) -> np.ndarray:
    filename, expected = SOURCES[name]
    raw = (SRC / filename).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == expected, name
    im = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert im.shape == (3600, 2400), (name, im.shape)
    return im


def max_registration(reference: np.ndarray, source: np.ndarray, mirrored: bool) -> tuple:
    """Fit small image-morphology and placement grid to white-backed tree crops."""
    candidate = np.fliplr(source).copy() if mirrored else source
    best: tuple = (-1.0, None, None, None, None)
    for scale in (0.84, 0.88, 0.92):
        pixels = round(360 * scale)
        small = cv2.resize(candidate, (pixels, pixels))
        for radius in (4, 6, 9):
            dilated = cv2.dilate(
                small,
                cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * radius + 1, 2 * radius + 1))
            )
            for sigma in (6, 9, 12, 15):
                filtered = cv2.GaussianBlur(dilated, (0, 0), sigma)
                corr = cv2.matchTemplate(reference, filtered, cv2.TM_CCOEFF_NORMED)
                _, maximum, _, location = cv2.minMaxLoc(corr)
                if maximum > best[0]:
                    best = (float(maximum), scale, radius, sigma, location)
    return best


def main() -> None:
    # Original crop bounding rectangles in 2400x3600 pixel scans.
    first = image('p32')[2070:3230, 650:1810]
    second = image('p55')[1430:2510, 625:1735]
    # Brightness-invariant inverted (ink positive) source; same fixed crop size.
    a = (255 - cv2.resize(first, (360, 360))).astype(np.float32) / 255
    b = (255 - cv2.resize(second, (360, 360))).astype(np.float32) / 255
    direct = max_registration(a, b, mirrored=False)
    mirrored = max_registration(a, b, mirrored=True)
    assert direct[0] > 0.78, direct
    assert mirrored[0] < 0.70, mirrored
    assert direct[0] - mirrored[0] > 0.13, (direct, mirrored)
    print('Original p32/p55 tree blur registration:')
    print('  direct  best Pearson-template NCC:', direct)
    print('  mirror  best Pearson-template NCC:', mirrored)
    print('  orientation-margin:', round(direct[0] - mirrored[0], 6))
    print('  verdict: conspicuous orientation-specific pictorial resemblance;')
    print('  no verified exact image provenance, source-chosen rune path, or plaintext')


if __name__ == '__main__':
    main()
