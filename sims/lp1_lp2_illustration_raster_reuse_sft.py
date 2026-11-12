#!/usr/bin/env python3
"""Original-JPEG SFT: independently replicated LP1 illustrations within LP2.

Run from repository root or any current directory. Consumes only pinned
original JPEGs under resources/liber-primus, with no external data or writes.
Scientific scope: identifies raster copies, not a cipher/key/plaintext.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np

SOURCE = Path(__file__).resolve().parents[1] / 'resources' / 'liber-primus'
PINNED = {
    5: '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7',
    14: 'de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e',
    15: 'f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9',
    16: '984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe',
    39: 'e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7',
    70: '4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548',
    71: 'dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4',
    72: 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba',
}


def image(n: int) -> np.ndarray:
    data = (SOURCE / f'{n:02d}.jpg').read_bytes()
    if n in PINNED:
        assert sha256(data).hexdigest() == PINNED[n], n
    gray = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert gray is not None and gray.shape == (3600, 2400), n
    return gray


def iou(a: np.ndarray, b: np.ndarray) -> float:
    union = np.count_nonzero(a | b)
    return float(np.count_nonzero(a & b) / union) if union else 0.0


def bottom(img: np.ndarray) -> np.ndarray:
    return cv2.resize(img[3150:3600], (600, 113), interpolation=cv2.INTER_AREA) < 160


def check_recliner() -> dict:
    assert all(np.array_equal(image(14)[3150:], image(n)[3150:]) for n in (15, 16))
    scans = [bottom(image(i)) for i in range(75)]
    ranking = sorted(
        ((iou(scans[a], scans[b][:, ::-1] if flip else scans[b]), a, b, flip)
         for a in range(17) for b in range(17, 75) for flip in (False, True)),
        reverse=True,
    )
    assert all(p[1:] == (a, 39, True) for p, a in zip(ranking[:3], (16, 15, 14)))
    assert abs(ranking[0][0] - 0.8890067911714771) < 1e-9
    assert ranking[3][0] < 0.18
    return {'source_lp1_archive': [14, 15, 16], 'lp2_archive': 39,
            'lp2_physical_page': 22, 'orientation': 'horizontal mirror',
            'cropped_bottom_ink_iou': ranking[0][0],
            'best_nonmirrored_or_unrelated': ranking[3]}


def check_moth() -> dict:
    # Crop choices fixed by illustration coordinates, with no text or rune data.
    a = image(5)[1450:1900, 750:1650]
    b = image(70)[2500:3250, 450:1950]
    other = image(71)[2500:3250, 450:1950]
    sift = cv2.SIFT_create(nfeatures=2200, contrastThreshold=0.005)
    ka, da = sift.detectAndCompute(a, None)
    kb, db = sift.detectAndCompute(b, None)
    assert da is not None and db is not None
    pairs = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [m for m, next_match in pairs if m.distance < 0.75 * next_match.distance]
    source = np.float32([ka[m.queryIdx].pt for m in good])
    target = np.float32([kb[m.trainIdx].pt for m in good])
    matrix, inlier_mask = cv2.findHomography(source, target, cv2.RANSAC, 3.0)
    assert matrix is not None and inlier_mask is not None
    assert len(good) == 369 and int(inlier_mask.astype(np.int64).sum()) == 351
    singular_values = np.linalg.svd(matrix[:2, :2])[1]
    assert 2.32 < min(singular_values) and max(singular_values) < 2.34
    warped = cv2.warpPerspective((a < 140).astype(np.uint8), matrix,
                                 (b.shape[1], b.shape[0])) > 0
    artwork_iou = iou(warped, b < 140)
    negative_iou = iou(warped, other < 140)
    assert artwork_iou > 0.82 and negative_iou < 0.07
    # Existing within-LP2 copy: p53 moth reappears on p55 at (+66,+67).
    original = image(70)[2720:3160, 600:1850]
    duplicate = image(72)[2787:3227, 666:1916]
    exact_corr = cv2.matchTemplate(duplicate, original,
                                   cv2.TM_CCOEFF_NORMED)[0, 0]
    assert exact_corr > 0.9998
    return {'source_lp1_archive': 5, 'lp2_archive': [70, 72],
            'lp2_physical_pages': [53, 55], 'orientation': 'upright scale',
            'sift_ratio_matches': len(good),
            'sift_ransac_inliers': int(inlier_mask.astype(np.int64).sum()),
            'homography_scales': singular_values.tolist(),
            'thresholded_ink_iou': artwork_iou,
            'wrong_page_p54_iou': negative_iou,
            'p53_to_p55_gray_correlation': float(exact_corr)}


def main() -> None:
    import json
    print(json.dumps({'reclining_figure': check_recliner(),
                      'moth': check_moth(),
                      'status': 'multiple authentic cross-release illustration copies; no decoded text'},
                     indent=2))


if __name__ == '__main__':
    main()
