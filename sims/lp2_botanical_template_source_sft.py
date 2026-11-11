"""Original JPEG marginal-artwork template gate for LP2 pp8-14 and pp24-26.

Run: python sims/lp2_botanical_template_source_sft.py
Dependencies: numpy, scipy, opencv-python. No ciphertext or model fitting.
"""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

import cv2
import numpy as np
from scipy.signal import fftconvolve


def scan(images: Path, physical_page: int) -> np.ndarray:
    path = images / f"{physical_page + 17:02d}.jpg"
    raw = path.read_bytes()
    im = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    assert im is not None and im.shape == (3600, 2400, 3), path
    return im


def bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def align(a: np.ndarray, b: np.ndarray) -> tuple[tuple[int, int], int, float]:
    correlation = fftconvolve(a.astype(np.float32), b[::-1, ::-1].astype(np.float32), mode="full")
    y, x = np.unravel_index(correlation.argmax(), correlation.shape)
    dy, dx = int(y - b.shape[0] + 1), int(x - b.shape[1] + 1)
    y0, y1 = max(0, dy), min(a.shape[0], a.shape[0] + dy)
    x0, x1 = max(0, dx), min(a.shape[1], a.shape[1] + dx)
    aa = a[y0:y1, x0:x1]
    bb = b[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
    intersection = np.logical_and(aa, bb).sum()
    union = np.logical_or(aa, bb).sum()
    return (dx, dy), int(union - intersection), float(intersection / union)


def tree_crop(page: int, image: np.ndarray) -> np.ndarray:
    return image[580:3080, 0:600] if page % 2 == 0 else image[580:3080, 1800:2400]


def insect_crop(image: np.ndarray, side: str) -> np.ndarray:
    return image[900:2500, 0:600] if side == "left" else image[900:2500, 1800:2400]


def max_ink_distance(a: np.ndarray, b: np.ndarray) -> float:
    distance = cv2.distanceTransform(np.uint8(~b), cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    return float(distance[a].max())


def main(images: Path) -> None:
    trees = {p: tree_crop(p, scan(images, p)) for p in range(8, 15)}
    assert np.array_equal(trees[10], trees[12])
    assert np.array_equal(trees[10], trees[14])
    assert np.array_equal(trees[9], trees[11])
    assert np.array_equal(trees[9], trees[13])
    print("Original RGB crop identical: p10=p12=p14; p9=p11=p13")

    reference = cv2.cvtColor(trees[10], cv2.COLOR_BGR2GRAY) < 125
    for page, crop in trees.items():
        h = hashlib.sha256(crop.tobytes()).hexdigest()
        ink = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY) < 125
        shift, misses, iou = align(ink, reference)
        mirror_shift, _, mirror_iou = align(np.fliplr(ink), reference)
        print(
            f"p{page} tree: ink={int(ink.sum())}, bbox={bbox(ink)}, RGB_crop_SHA256={h}; "
            f"p10 shift={shift} IoU={iou:.7f} disagreement={misses}; "
            f"mirrored shift={mirror_shift} IoU={mirror_iou:.7f}"
        )
        if page == 8:
            print(
                "p8/p10 nearest-ink max distances:",
                max_ink_distance(ink, reference),
                max_ink_distance(reference, ink),
            )

    insects = {
        (page, side): insect_crop(scan(images, page), side)
        for page in (24, 25, 26)
        for side in ("left", "right")
    }
    for side in ("left", "right"):
        assert np.array_equal(insects[24, side], insects[26, side])
        a = cv2.cvtColor(insects[25, side], cv2.COLOR_BGR2GRAY) < 155
        b = cv2.cvtColor(insects[24, side], cv2.COLOR_BGR2GRAY) < 155
        shift, misses, iou = align(a, b)
        print(
            f"p24=p26 {side} insect: RGB crop exact; "
            f"p25 vs p24 shift={shift} IoU={iou:.7f} disagreement={misses}"
        )

    print("PASS: original page-family template controls (no key or plaintext recovered)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--images", type=Path,
        default=Path(__file__).resolve().parents[1] / "resources" / "liber-primus",
    )
    args = parser.parse_args()
    main(args.images)
