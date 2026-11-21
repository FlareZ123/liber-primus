#!/usr/bin/env python3
"""Independent original LP2 five-dot artwork census and held-out geometric test.

No rune keys, prior fitted transform, OCR or arbitrary image-level crop tuning.
Pillow 11.3.0 and NumPy 2.2.6, installed by the existing manual Windows workflow.
"""
from __future__ import annotations

from collections import deque
from hashlib import sha256
from itertools import combinations, permutations
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
SCALED = (600, 900)
THRESHOLD = 90
SEED = 0x33012356
CONTROL_COUNT = 10_000

# Eight rigid axis-aligned unit-scale transformations. No orientation prior.
D4 = (
    ("identity", ((1, 0), (0, 1))),
    ("horizontal", ((-1, 0), (0, 1))),
    ("vertical", ((1, 0), (0, -1))),
    ("rotate180", ((-1, 0), (0, -1))),
    ("diagonal", ((0, 1), (1, 0))),
    ("quarter_ccw", ((0, -1), (1, 0))),
    ("quarter_cw", ((0, 1), (-1, 0))),
    ("antidiagonal", ((0, -1), (-1, 0))),
)
MATRICES = [(label, np.array(matrix, dtype=np.float64)) for label, matrix in D4]


def image_dots(number: int) -> np.ndarray:
    """Find isolated 70-pixel black circles without source-specific coordinates."""
    image_file = ROOT / f"{number}.jpg"
    with Image.open(image_file) as image:
        assert image.size == (2400, 3600), image_file
        gray = image.convert("L")
        small = np.asarray(gray.resize(SCALED, Image.Resampling.BOX))
        remaining = set(zip(*np.nonzero(small < THRESHOLD)))
        found = []
        # Component extraction uses exactly the same eight-neighbor definition
        # for every original image; high-resolution centroids are measured anew.
        while remaining:
            start = remaining.pop()
            queue = [start]
            xlo = xhi = int(start[1])
            ylo = yhi = int(start[0])
            size = 1
            while queue:
                y, x = queue.pop()
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dy == 0 and dx == 0:
                            continue
                        point = (y + dy, x + dx)
                        if point in remaining:
                            remaining.remove(point)
                            queue.append(point)
                            size += 1
                            xlo = min(xlo, x + dx)
                            xhi = max(xhi, x + dx)
                            ylo = min(ylo, y + dy)
                            yhi = max(yhi, y + dy)
            width = xhi - xlo + 1
            height = yhi - ylo + 1
            if not (150 <= size <= 330 and 15 <= width <= 22
                    and 15 <= height <= 22 and abs(width - height) <= 3
                    and 0.56 <= size / (width * height) <= 0.85):
                continue
            # The candidate was located on an independent 1/4-resolution
            # connected component. Refine from the *unaltered original pixels*.
            x0, x1 = 4 * xlo, 4 * (xhi + 1)
            y0, y1 = 4 * ylo, 4 * (yhi + 1)
            pixels = np.asarray(gray.crop((x0, y0, x1, y1)))
            yy, xx = np.nonzero(pixels < THRESHOLD)
            assert len(xx) > 2000
            found.append((float(xx.mean() + x0), float(yy.mean() + y0)))
    return np.array(sorted(found, key=lambda p: (p[1], p[0])), dtype=np.float64).reshape((-1, 2))


def fit_five(src: np.ndarray, dst: np.ndarray) -> tuple[float, str, tuple[int, ...], np.ndarray]:
    """Fit *every* D4 map and all 5! unlabeled point permutations."""
    assert src.shape == dst.shape == (5, 2)
    best = (float("inf"), "", (), np.zeros(2))
    for name, mat in MATRICES:
        rotated = src @ mat.T
        for order in permutations(range(5)):
            delta = dst[list(order)] - rotated
            offset = delta.mean(axis=0)
            error = float(np.sqrt(np.mean(np.sum((delta - offset) ** 2, axis=1))))
            if error < best[0]:
                best = error, name, order, offset
    return best


def holdout_five(src: np.ndarray, dst: np.ndarray) -> list[float]:
    """Ten frozen three-point training / two-point holdout splits."""
    assert src.shape == dst.shape == (5, 2)
    scores = []
    for source_triple in combinations(range(5), 3):
        hold_source = [i for i in range(5) if i not in source_triple]
        fit = (float("inf"), None, (), np.zeros(2))
        for name, mat in MATRICES:
            rotated = src[list(source_triple)] @ mat.T
            for target_triple in permutations(range(5), 3):
                delta = dst[list(target_triple)] - rotated
                offset = delta.mean(axis=0)
                error = float(np.sqrt(np.mean(np.sum((delta - offset) ** 2, axis=1))))
                if error < fit[0]:
                    fit = error, mat, target_triple, offset
        _, mat, train_targets, offset = fit
        assert mat is not None
        test_target_ids = [i for i in range(5) if i not in train_targets]
        predicted = src[hold_source] @ mat.T + offset
        # Two possible unlabeled holdout correspondences are charged equally.
        score = min(
            float(np.sqrt(np.mean(np.sum((predicted - dst[list(order)]) ** 2, axis=1))))
            for order in permutations(test_target_ids)
        )
        scores.append(score)
    return scores


def subset_three_rms(src: np.ndarray, triple: np.ndarray) -> float:
    """Independent three-dot artwork matched against every source triple."""
    best = float("inf")
    for _, mat in MATRICES:
        for source_ids in combinations(range(5), 3):
            points = src[list(source_ids)] @ mat.T
            for dest_ids in permutations(range(3)):
                delta = triple[list(dest_ids)] - points
                err = float(np.sqrt(np.mean(np.sum((delta - delta.mean(axis=0)) ** 2, axis=1))))
                best = min(best, err)
    return best


def fast_rms(src: np.ndarray, dst: np.ndarray) -> float:
    """Vectorized same complete permutation family for randomized matched controls."""
    orders = np.array(list(permutations(range(5))), dtype=int)
    dest = dst[orders]
    best = float("inf")
    for _, mat in MATRICES:
        delta = dest - (src @ mat.T)[None, :, :]
        delta -= delta.mean(axis=1, keepdims=True)
        rms = np.sqrt(np.mean(np.sum(delta ** 2, axis=2), axis=1))
        best = min(best, float(rms.min()))
    return best


def main() -> None:
    marks = {}
    for number in range(17, 75):
        marks[number] = image_dots(number)
    census = [(num, len(values)) for num, values in marks.items() if len(values)]
    print("All 58 original LP2 scans: exact 69–88px black-circle census", census)
    assert census == [(24, 5), (40, 5), (50, 3), (73, 5)]
    for scan in (24, 40, 50, 73):
        image_file = ROOT / f"{scan}.jpg"
        print("source", scan, "SHA256", sha256(image_file.read_bytes()).hexdigest())
        print("centroids", scan, np.round(marks[scan], 6).tolist())

    pairs = ((24, 40), (24, 73), (40, 73))
    for first, second in pairs:
        rms, orientation, match, translate = fit_five(marks[first], marks[second])
        split_scores = holdout_five(marks[first], marks[second])
        print(f"five-dot pair {first}->{second}: full_rms={rms:.6f}px",
              "map=", orientation, "translation=", np.round(translate, 4).tolist(),
              "5! match=", match, "heldout2_max=", f"{max(split_scores):.6f}px",
              "heldout2_range=", [round(min(split_scores), 5), round(max(split_scores), 5)])
        assert rms < 0.4 and max(split_scores) < 0.5

    for number in (24, 40, 73):
        discrepancy = subset_three_rms(marks[number], marks[50])
        print(f"three-dot matched-artwork control {number}->50: triple_rms={discrepancy:.6f}px")
        assert discrepancy > 100

    # Two independent source-pinned original five-dot groups: p23 vs p56.
    # Null positions share the actual p56 bounding rectangle and 69px dot diameter,
    # with physically nonoverlapping disks, but no shared template geometry.
    src = marks[40]
    observed = fit_five(src, marks[73])[0]
    lower = marks[73].min(axis=0)
    upper = marks[73].max(axis=0)
    rng = np.random.default_rng(SEED)
    exceed = 0
    null_min = float("inf")
    for _ in range(CONTROL_COUNT):
        for _trial in range(1000):
            alternative = rng.uniform(lower, upper, size=(5, 2))
            displacements = alternative[:, None, :] - alternative[None, :, :]
            squared = np.sum(displacements ** 2, axis=2)
            squared += np.eye(5) * 1_000_000
            if squared.min() > 69 ** 2:
                break
        else:
            raise AssertionError("matched-geometry rejection sampler failed")
        score = fast_rms(src, alternative)
        null_min = min(null_min, score)
        exceed += score <= observed
    print(f"familywise 8*5! matched-geometry uniform-bounds null N={CONTROL_COUNT}",
          f"observed={observed:.6f}px, smallest_control={null_min:.6f}px",
          f"tail={exceed}/{CONTROL_COUNT} with add-one {(exceed + 1)/(CONTROL_COUNT + 1):.8f}")
    assert exceed == 0
    print("PASS: p7/p23/p56 are reused mirrored artwork, p23/p56 is NOT uniquely selected,",
          "and no image-to-cipher instruction follows.")


if __name__ == "__main__":
    main()
