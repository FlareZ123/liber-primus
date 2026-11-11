#!/usr/bin/env python3
"""Source-locked candidate selector for the 27x27 opening block.

Run from the repository root:
    python sims/lp2_27x27_p0_seed_selector_sft.py

This tests a candidate human solve path, not an authenticated LP2 decryption.
The twofold marginal-mark count is a visual interpretation; the code measures
the paired marks' 180-degree image symmetry but cannot prove division by two
is the intended operation.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources/liber-primus/17.jpg"
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
INK = ROOT / "resources/liber-primus/lp2-ink-annotations.json"
TRANSCRIPTION = ROOT / "resources/liber-primus/lp2-transcription.txt"

# At grayscale <80 these are the two large p0 marginal-mark components.
# Coordinates are (x, y, width, height) in the original 2400x3600 JPEG.
LEFT_BOX = (57, 1697, 490, 1254)
RIGHT_BOX = (1853, 649, 490, 1254)


def phi(n: int) -> int:
    result = n
    p = 2
    remaining = n
    while p * p <= remaining:
        if remaining % p == 0:
            while remaining % p == 0:
                remaining //= p
            result -= result // p
        p += 1
    if remaining > 1:
        result -= result // remaining
    return result


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    return all(n % d for d in range(2, math.isqrt(n) + 1))


def symbols(values: list[int], alphabet: list[str]) -> list[str]:
    return [alphabet[value] for value in values]


def main() -> None:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    ink = json.loads(INK.read_text(encoding="utf-8"))
    alphabet = corpus["translit"]
    prime = corpus["prime"]

    # Original source image: two marginal marks are near-exact 180-degree copies.
    with Image.open(IMAGE) as image:
        assert image.size == (2400, 3600)
        gray = np.asarray(image.convert("L"))
    dark = gray < 80

    def crop_mask(box: tuple[int, int, int, int]) -> np.ndarray:
        x, y, w, h = box
        return dark[y:y + h, x:x + w]

    left = crop_mask(LEFT_BOX)
    right = crop_mask(RIGHT_BOX)
    assert left.shape == right.shape == (1254, 490)
    left_rotated = np.flip(left, axis=(0, 1))
    intersection = int(np.logical_and(left_rotated, right).sum())
    union = int(np.logical_or(left_rotated, right).sum())
    iou = intersection / union
    assert iou > 0.98, iou

    def centroid(mask: np.ndarray, box: tuple[int, int, int, int]) -> tuple[float, float]:
        x, y, _, _ = box
        yy, xx = np.nonzero(mask)
        return (x + float(xx.mean()), y + float(yy.mean()))

    left_centroid = centroid(left, LEFT_BOX)
    right_centroid = centroid(right, RIGHT_BOX)
    midpoint = (
        (left_centroid[0] + right_centroid[0]) / 2,
        (left_centroid[1] + right_centroid[1]) / 2,
    )
    image_center = (1200.0, 1800.0)
    center_error = math.dist(midpoint, image_center)
    assert center_error < 1.0, center_error
    marginal_mark_count = 2  # the two measured, 180-degree-paired components

    pages = [p for p in corpus["pages"] if 0 <= p["page"] <= 2]
    flat = [r for page in pages for r in page["indices"]]
    grid_width = math.isqrt(len(flat))
    assert grid_width * grid_width == len(flat) == 729
    assert grid_width == 27

    p0 = next(p for p in corpus["pages"] if p["page"] == 0)
    p0_ink = next(p for p in ink["pages"] if p["page"] == 0)
    red_span = p0_ink["red_spans"][0]
    assert red_span["start"] == 0 and red_span["length"] == 13
    red_runes = p0["indices"][red_span["start"]:red_span["start"] + red_span["length"]]
    red_prime_weights = [prime[r] for r in red_runes]
    red_prime_sum = sum(red_prime_weights)
    assert red_prime_sum == 662

    half_sum = red_prime_sum // marginal_mark_count
    assert red_prime_sum % marginal_mark_count == 0
    assert half_sum == 331 and is_prime(half_sum)
    predicted_center = phi(half_sum) % 29
    assert phi(half_sum) == 330
    assert predicted_center == 11 and alphabet[predicted_center] == "J"

    # The red heading is horizontal; (row, column) are one-based.
    row = red_span["length"]
    column = phi(row)
    assert (row, column) == (13, 12)
    center_index = (row - 1) * grid_width + (column - 1)
    node_positions = [center_index - 1, center_index, center_index + 1]
    node = [flat[i] for i in node_positions]
    assert node == [25, 11, 28]
    assert node[1] == predicted_center
    node_symbols = symbols(node, alphabet)
    assert node_symbols == ["AE", "J", "EA"]

    key = [node[0], phi(node[1]), node[2]]
    assert key == [25, 10, 28]
    key_symbols = symbols(key, alphabet)
    assert key_symbols == ["AE", "I", "EA"]
    step = phi(node[1]) + phi(key[1])
    assert (phi(node[1]), phi(key[1]), step) == (10, 4, 14)

    first_line = TRANSCRIPTION.read_text(encoding="utf-8").splitlines()[0]
    before_marker, after_marker = first_line.split(".", 1)
    red_line_count = len(before_marker.replace("-", ""))
    first_black_line = re.sub(r"[-/]", "", after_marker)
    block_length = len(first_black_line)
    assert red_line_count == 13
    assert block_length == 7
    assert block_length == len(p0["indices"][13:20])

    node_start = node_positions[0]
    path_start = node_start + step
    assert (node_start, path_start) == (334, 348)
    path = list(range(path_start, path_start + block_length))
    assert path == list(range(348, 355))
    ciphertext = [flat[i] for i in path]
    cipher_symbols = symbols(ciphertext, alphabet)
    assert cipher_symbols == ["L", "AE", "N", "TH", "P", "U", "X"]

    plaintext = [(c - key[i % len(key)]) % 29 for i, c in enumerate(ciphertext)]
    plaintext_symbols = symbols(plaintext, alphabet)
    plaintext_compact = "".join(plaintext_symbols)
    assert plaintext_compact == "ASIGOTHE"

    print(json.dumps({
        "status": "candidate source selector; not an authenticated full-page decryption",
        "image": str(IMAGE.relative_to(ROOT)),
        "image_size": [2400, 3600],
        "marginal_marks": {
            "count": marginal_mark_count,
            "left_box_xywh": LEFT_BOX,
            "right_box_xywh": RIGHT_BOX,
            "threshold": 80,
            "rotation": "180 degrees",
            "intersection_pixels": intersection,
            "union_pixels": union,
            "iou": iou,
            "left_centroid": left_centroid,
            "right_centroid": right_centroid,
            "midpoint": midpoint,
            "image_center": image_center,
            "midpoint_error_pixels": center_error,
        },
        "grid": {"runes": len(flat), "width": grid_width, "layout": "row-major"},
        "red_heading": {
            "runes": symbols(red_runes, alphabet),
            "gp_prime_weights": red_prime_weights,
            "prime_sum": red_prime_sum,
            "divided_by_two_marks": half_sum,
            "phi": phi(half_sum),
            "mod29_center_prediction": predicted_center,
            "predicted_center_rune": alphabet[predicted_center],
        },
        "coordinate": {"row_one_based": row, "column_one_based": column,
                       "center_flat_zero_based": center_index},
        "source_node": {"positions": node_positions, "symbols": node_symbols},
        "key": {"indices": key, "symbols": key_symbols},
        "jump": {"phi_center_original": phi(node[1]),
                 "phi_center_transformed": phi(key[1]), "distance": step},
        "first_black_line": {"runes": block_length, "symbols": first_black_line},
        "cipher_path": {"positions": path, "symbols": cipher_symbols},
        "plaintext_consequence": {"symbols": plaintext_symbols,
                                  "compact": plaintext_compact},
        "caveats": [
            "Dividing the red-heading prime sum by the count of two paired marginal marks is an interpretation, not a proven instruction.",
            "The 27x27 row-major flattening and three-rune node convention still need independent source justification.",
            "The first-block selector has not predicted a held-out later transition.",
            "The decoded phrase was not used to select the node, key, path, or length.",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
