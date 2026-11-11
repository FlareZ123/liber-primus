"""Source-first SFT: p7/p23/p56 mirrored five-dot template and p15 prime-clock gate.

Read-only, reproducible from original resources/liber-primus/{24,40,73}.jpg
and resources/liber-primus/lp2-corpus.json.
Requires numpy and opencv-python-headless.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"
CORPUS = IMAGES / "lp2-corpus.json"


def load_greyscale(number: int) -> np.ndarray:
    image = cv2.imread(str(IMAGES / f"{number:02d}.jpg"), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(IMAGES / f"{number:02d}.jpg")
    assert image.shape == (3600, 2400)
    return image


def locate_five_dots(image: np.ndarray, low_y: int, high_y: int) -> list[tuple[float, float]]:
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(
        (image < 90).astype(np.uint8), connectivity=8
    )
    dots = []
    for i in range(1, count):
        x, y, w, h, area = map(int, stats[i])
        cx, cy = map(float, centroids[i])
        if (55 <= w <= 100 and 55 <= h <= 100
                and 1800 <= area <= 6000 and 650 <= cx <= 1800
                and low_y <= cy <= high_y):
            dots.append((cx, cy))
    dots.sort()
    assert len(dots) == 5, f"expected five dots, saw {dots}"
    return dots


def jaccard(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.count_nonzero(a & b) / np.count_nonzero(a | b))


def first_primes(count: int) -> list[int]:
    found = []
    candidate = 2
    while len(found) < count:
        if all(candidate % div for div in range(2, math.isqrt(candidate) + 1)):
            found.append(candidate)
        candidate += 1
    return found


def ioc(values: list[int]) -> float:
    histogram = [0] * 29
    for value in values:
        histogram[value] += 1
    length = len(values)
    return sum(k * (k - 1) for k in histogram) / (length * (length - 1))


def evaluate_prime_clock(corpus: dict, primes: list[int], fib: list[int],
                         pages: list[int]) -> dict:
    all_plain = []
    page_iocs = []
    for n, page in enumerate(pages):
        original = corpus["pages"][page]["indices"]
        decoded = [(v - (primes[fib[n] + i] - 1)) % 29
                   for i, v in enumerate(original)]
        assert all((p + primes[fib[n] + i] - 1) % 29 == c
                   for i, (p, c) in enumerate(zip(decoded, original)))
        all_plain.extend(decoded)
        page_iocs.append(ioc(decoded))
    assert len(all_plain) == 3894
    return {
        "order": pages,
        "runes": len(all_plain),
        "pooled_ioc": round(ioc(all_plain), 12),
        "mean_page_ioc": round(sum(page_iocs) / len(page_iocs), 12),
        "range_page_ioc": [round(min(page_iocs), 12), round(max(page_iocs), 12)],
        "opening_runes_by_page": [
            "".join(corpus["translit"][(v - (primes[fib[n] + i] - 1)) % 29]
                    for i, v in enumerate(corpus["pages"][page]["indices"][:12]))
            for n, page in enumerate(pages)
        ],
    }


def main() -> None:
    p7 = load_greyscale(24)
    p23 = load_greyscale(40)
    p56 = load_greyscale(73)
    dots7 = locate_five_dots(p7, 2750, 3550)
    dots23 = locate_five_dots(p23, 100, 1400)
    dots56 = locate_five_dots(p56, 2100, 3000)
    x_differences = [abs(a[0] - b[0]) for a, b in zip(dots7, dots23)]
    y_sums = [a[1] + b[1] for a, b in zip(dots7, dots23)]
    assert max(x_differences) < 0.1
    assert max(abs(s - 3674) for s in y_sums) < 0.12
    # Five identical source circles reappear at solved p56 after a horizontal flip.
    x_reflect_sums = [a[0] + b[0] for a, b in zip(dots7, reversed(dots56))]
    y_translations = [a[1] - b[1] for a, b in zip(dots7, reversed(dots56))]
    assert max(abs(s - 2400.65) for s in x_reflect_sums) < 0.5
    assert max(abs(s - 419.36) for s in y_translations) < 0.5

    ys = np.arange(2760, 3220)
    xs = np.arange(740, 1590)
    observed = p7[np.ix_(ys, xs)] < 180
    mirrored = p23[np.ix_(3674 - ys, xs)] < 180
    flat_shift = round(float(np.median([b[1] - a[1] for a, b in zip(dots7, dots23)])))
    translated = p23[np.ix_(ys + flat_shift, xs)] < 180
    flipped_both = p23[np.ix_(3674 - ys, 2324 - xs)] < 180
    p56_horizontal = p56[np.ix_(ys - 419, 2401 - xs)] < 180
    p56_translation = p56[np.ix_(ys - 419, xs)] < 180
    mirror_iou = jaccard(observed, mirrored)
    p56_iou = jaccard(observed, p56_horizontal)
    assert p56_iou > 0.97
    assert jaccard(observed, p56_translation) < 0.05
    assert mirror_iou > 0.998
    assert jaccard(observed, translated) < mirror_iou
    assert jaccard(observed, flipped_both) < mirror_iou

    with CORPUS.open(encoding="utf-8") as f:
        corpus = json.load(f)
    fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]
    printed_spiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
                      3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]
    page_order = list(range(7, 15)) + list(range(16, 24))
    center_out = [16, 14, 17, 13, 18, 12, 19, 11, 20, 10, 21, 9, 22, 8, 23, 7]
    primes = first_primes(988 + 350)
    assert [abs(3301 - primes[index]) for index in fibonacci] == printed_spiral

    # Native-GP positive plant: p57 is unciphered historical plaintext.
    known = corpus["pages"][57]["indices"]
    planted = [(v + primes[i] - 1) % 29 for i, v in enumerate(known)]
    recovered = [(v - primes[i] + 1) % 29 for i, v in enumerate(planted)]
    wrong_key = [(v - primes[i + 1] + 1) % 29 for i, v in enumerate(planted)]
    assert recovered == known
    assert wrong_key != known

    chronological = evaluate_prime_clock(corpus, primes, fibonacci, page_order)
    outward = evaluate_prime_clock(corpus, primes, fibonacci, center_out)
    raw = [r for p in page_order for r in corpus["pages"][p]["indices"]]
    assert len(raw) == 3894
    for n, page in enumerate(page_order):
        seq = corpus["pages"][page]["indices"]
        constant_shifted = [(v - printed_spiral[n]) % 29 for v in seq]
        assert abs(ioc(seq) - ioc(constant_shifted)) < 1e-14

    print(json.dumps({
        "images": ["24.jpg: physical p7", "40.jpg: physical p23",
                   "73.jpg: solved physical p56"],
        "dot_centroids_p7": [[round(a, 3), round(b, 3)] for a, b in dots7],
        "dot_centroids_p23": [[round(a, 3), round(b, 3)] for a, b in dots23],
        "dot_centroids_p56": [[round(a, 3), round(b, 3)] for a, b in dots56],
        "p56_horizontal_mirror_ink_mask_iou": round(p56_iou, 9),
        "p56_translation_wrong_control_iou": round(jaccard(observed, p56_translation), 9),
        "p56_mirror_mask_disagreement_pixels": int(np.count_nonzero(observed ^ p56_horizontal)),
        "p7_p56_x_reflection_sums_px": [round(s, 5) for s in x_reflect_sums],
        "p7_p56_y_translation_differences_px": [round(s, 5) for s in y_translations],
        "max_horizontal_delta_px": round(max(x_differences), 6),
        "all_corresponding_y_sums_px": [round(v, 5) for v in y_sums],
        "mirror_ink_mask_iou": round(mirror_iou, 9),
        "wrong_translation_iou": round(jaccard(observed, translated), 9),
        "wrong_horizontal_plus_vertical_iou": round(jaccard(observed, flipped_both), 9),
        "mirror_mask_disagreement_pixels": int(np.count_nonzero(observed ^ mirrored)),
        "symmetric_physical_pages": [7, 15, 23],
        "16_outside_pages": page_order,
        "p15_spiral_verified": True,
        "raw_3894_rune_ioc": round(ioc(raw), 12),
        "fixed_cell_caesar_per_page_ioc_invariant": True,
        "known_p57_plant_exact": len(known),
        "wrong_start_plant_mismatches": sum(a != b for a, b in zip(wrong_key, known)),
        "chronological_prime_phi": chronological,
        "center_out_prime_phi": outward,
        "conclusion": "The p7/p23/p56 glyphs form a single reused source figure; "
                      "mirroring around p15 alone is not an intended-key proof. Neither "
                      "one-value-per-page GP29 Caesar nor source-seeded running "
                      "prime-totient shifts recover native GP-English plaintext. "
                      "Neither cipher transfer is independently instructed by the dots."
    }, indent=2))


if __name__ == "__main__":
    main()
