"""Original-image SFT: test whether the p7/p23 five-dot reflection defines
a p15-centered matching of all sixteen surrounding physical pages.

Usage: python sims/lp2_p15_multisheet_mirror_gate_sft.py
Requires original JPEGs, numpy, opencv-python-headless. No file writes.
"""
from __future__ import annotations
from itertools import permutations
from pathlib import Path
import json
import cv2
import numpy as np

IMAGES = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
LEFT = tuple(range(7, 15))
RIGHT = tuple(range(16, 24))
X0, X1, Y0, Y1 = 510, 1900, 500, 2350

def source_ink(page: int) -> np.ndarray:
    path = IMAGES / f"{page + 17:02d}.jpg"
    image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400), path
    ys = np.arange(Y0, Y1)
    return image[3674 - ys if page >= 16 else ys, X0:X1] < 90

def main() -> None:
    masks = {p: source_ink(p) for p in LEFT + RIGHT}
    matrix = np.zeros((8, 8), dtype=np.float64)
    for i, lp in enumerate(LEFT):
        for j, rp in enumerate(RIGHT):
            a, b = masks[lp], masks[rp]
            matrix[i, j] = np.count_nonzero(a & b) / np.count_nonzero(a | b)

    symmetric = [float(matrix[i, 7 - i]) for i in range(8)]
    observed = sum(symmetric)
    possible = np.array([
        sum(matrix[i, perm[i]] for i in range(8))
        for perm in permutations(range(8))
    ])
    rank = int(np.count_nonzero(possible >= observed - 1e-14))
    assert tuple(round(x, 6) for x in symmetric) == (
        0.185720, 0.070829, 0.056779, 0.115096,
        0.131900, 0.123629, 0.121299, 0.096661)
    assert possible.size == 40320 and rank == 3408
    assert np.argmax(matrix[0]) == 7

    print(json.dumps({
        "input": "original physical LP2 pp7-14 and pp16-23",
        "source_fixed_mirror": "x unchanged; y -> 3674-y",
        "source_fixed_text_roi_xy": [X0, Y0, X1, Y1],
        "threshold": "grayscale <90",
        "p15_symmetric_pairs": [[p, 30-p] for p in LEFT],
        "all_pair_iou": [[round(float(v), 6) for v in row] for row in matrix],
        "symmetric_pair_iou": [round(v, 6) for v in symmetric],
        "observed_sum_iou": round(observed, 9),
        "assignment_null_mean_sum_iou": round(float(possible.mean()), 9),
        "total_eight_page_assignments": len(possible),
        "assignments_at_least_as_good": rank,
        "exact_assignment_tail_fraction": round(rank / len(possible), 9),
        "conclusion": "The source-original five-dot reflection does not identify a unique 16-page mirrored-text pairing; no plaintext, key or reversible operation."
    }, indent=2))

if __name__ == "__main__":
    main()
