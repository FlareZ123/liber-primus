"""Original LP2 p0–2 triple-cross illustration reuse and inversion SFT.

Reads only three byte-pinned JPEGs; computes SIFT/RANSAC geometry and one exact
same-region pixel identity. Requires NumPy, Pillow and OpenCV with SIFT.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
DIGESTS = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}


def load_scan(n: int) -> np.ndarray:
    """Load the exact 2014 image decoded into grayscale pixels."""
    data = (ROOT / f"{n:02d}.jpg").read_bytes()
    assert hashlib.sha256(data).hexdigest() == DIGESTS[n]
    img = np.asarray(Image.open(io.BytesIO(data)).convert("L"), dtype=np.uint8)
    assert img.shape == (3600, 2400)
    return img


def paired_crosses(img: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Fixed original-page crops; deliberately no image-fitted crop search."""
    return img[720:2960, 0:550], img[540:1720, 1720:2360]


def registration(img: np.ndarray) -> dict[str, float | int]:
    """Fit a single projective transform between left and right exact-art crops."""
    left, right = paired_crosses(img)
    sift = cv2.SIFT_create(nfeatures=3000)
    lkp, ld = sift.detectAndCompute(left, None)
    rkp, rd = sift.detectAndCompute(right, None)
    pairs = cv2.BFMatcher().knnMatch(ld, rd, k=2)
    good = [m for m, n in pairs if m.distance < 0.8 * n.distance]
    src = np.float32([lkp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([rkp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    homography, inliers = cv2.findHomography(src, dst, cv2.RANSAC, 4.0)
    assert homography is not None and inliers is not None
    homography /= homography[2, 2]
    assert len(good) >= 840
    assert int(inliers.sum()) >= 750
    assert abs(homography[0, 0] + 1.0) < 0.01
    assert abs(homography[1, 1] + 1.0) < 0.01
    assert abs(homography[0, 1]) < 0.01
    assert abs(homography[1, 0]) < 0.01
    return {
        "features_left": len(lkp), "features_right": len(rkp),
        "good_matches": len(good), "ransac_inliers": int(inliers.sum()),
        "orientation_degrees": 180, "h00": float(homography[0, 0]),
        "h01": float(homography[0, 1]),
        "h10": float(homography[1, 0]),
        "h11": float(homography[1, 1]),
    }


def main() -> None:
    cv2.setRNGSeed(0)
    source = {n: load_scan(n) for n in DIGESTS}
    reports = {str(n): registration(source[n]) for n in DIGESTS}
    left18, right18 = paired_crosses(source[18])
    left19, right19 = paired_crosses(source[19])
    # Exact crop equality proves the layout/art is reused within the source.
    assert np.array_equal(left18, left19)
    right_fraction = float(np.mean(right18 == right19))
    assert right_fraction > 0.98
    print(json.dumps({
        "source_scans": [17, 18, 19], "cross_pairs": reports,
        "same_absolute_left_cross_crop_18_19_pixel_identity": True,
        "same_absolute_right_cross_crop_18_19_pixel_identity_fraction": right_fraction,
        "decision": "one triple-bar cross illustration is reused and rotated 180 degrees in the printed pair; no external caption/key operation recovered",
    }, indent=2))


if __name__ == "__main__":
    main()
