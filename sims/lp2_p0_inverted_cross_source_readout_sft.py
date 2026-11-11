"""Source-fixed p0 half-turn motif and historical p56-cipher readout.

Run from the repository root: python sims/lp2_p0_inverted_cross_source_readout_sft.py

Input: original LP2 scan 17.jpg, canonical rune corpus and unchanged Shakespeare
native-GP control. No fitted original-cipher key, threshold, offset or phase.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
import json
import math
from pathlib import Path
import re

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SCAN = ROOT / "resources/liber-primus/17.jpg"
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
CONTROL = ROOT / "resources/control/shakespeare_first300k.txt"
TRANSCRIPT = ROOT / "resources/lp2-transcription.txt"
SOURCE_SHA256 = "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
GP_BASE = 29
PSEUDOCOUNT = 0.1
TRAIN_RUNES = 180000
GRAM = 4


def iou(mask1: np.ndarray, mask2: np.ndarray) -> float:
    return float(np.logical_and(mask1, mask2).sum() / np.logical_or(mask1, mask2).sum())


def source_crosses() -> dict:
    assert sha256(SCAN.read_bytes()).hexdigest() == SOURCE_SHA256
    picture = np.asarray(Image.open(SCAN).convert("L"), dtype=np.uint8)
    assert picture.shape == (3600, 2400)
    # Both original assets are precisely 500x1286 pixels, without rescaling.
    left = picture[1679:2965, 52:552]
    right = picture[635:1921, 1848:2348]
    assert left.shape == right.shape == (1286, 500)
    threshold = 145
    rmask = right < threshold
    masks = {
        "untransformed": left,
        "rotate_180": np.rot90(left, 2),
        "mirror_x": np.fliplr(left),
        "mirror_y": np.flipud(left),
    }
    values = {name: iou(mask < threshold, rmask) for name, mask in masks.items()}
    mean_error = float(np.abs(np.rot90(left, 2).astype(np.int16) -
                              right.astype(np.int16)).mean())
    assert values["rotate_180"] > 0.9874
    assert values["untransformed"] < 0.114
    assert mean_error < 0.947
    return {
        "image": "resources/liber-primus/17.jpg",
        "image_sha256": SOURCE_SHA256,
        "coordinates_xyxy": {
            "left": [52, 1679, 552, 2965],
            "right": [1848, 635, 2348, 1921],
        },
        "size_hw": [1286, 500],
        "threshold": threshold,
        "binary_ink_iou": values,
        "rotated_grayscale_mae": mean_error,
    }


def first_primes(n: int) -> list[int]:
    result: list[int] = []
    value = 2
    while len(result) < n:
        if all(value % divisor for divisor in range(2, math.isqrt(value) + 1)):
            result.append(value)
        value += 1
    return result


def totient(n: int) -> int:
    result = n
    divisor = 2
    while divisor * divisor <= n:
        if n % divisor == 0:
            while n % divisor == 0:
                n //= divisor
            result -= result // divisor
        divisor += 1
    if n > 1:
        result -= result // n
    return result


def gp_encode(source: str, labels: list[str]) -> list[int]:
    symbols = sorted(enumerate(labels), key=lambda item: -len(item[1]))
    encoded: list[int] = []
    for word in re.findall(r"[A-Z]+", source.upper()):
        word = word.replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Z", "S")
        j = 0
        while j < len(word):
            found = next(((index, token) for index, token in symbols
                          if word.startswith(token, j)), None)
            if found is None:
                j += 1
            else:
                encoded.append(found[0])
                j += len(found[1])
    return encoded


def build_score(training: list[int]):
    grams = Counter(tuple(training[i:i + GRAM]) for i in range(len(training) - GRAM + 1))
    denominator = math.log(len(training) - GRAM + 1 + PSEUDOCOUNT * GP_BASE**GRAM)

    def score(sequence: list[int]) -> float:
        return sum(math.log(grams[tuple(sequence[i:i + GRAM])] + PSEUDOCOUNT) -
                   denominator for i in range(len(sequence) - GRAM + 1)) / (
                       len(sequence) - GRAM + 1)
    return score


def readout() -> dict:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    ciphertext = corpus["pages"][0]["indices"]
    assert len(ciphertext) == 262
    lines = [re.findall(r"[\u16a0-\u16ff]", s) for s in
             TRANSCRIPT.read_text(encoding="utf-8").split("%")[0].splitlines()]
    assert [len(line) for line in lines] == [20, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23, 23]
    rune_index = {rune: index for index, rune in enumerate(corpus["runes"])}
    assert [rune_index[r] for line in lines for r in line] == ciphertext

    primes = first_primes(len(ciphertext))
    shifts = [totient(p) for p in primes]
    decode = lambda values: [(rune - shifts[i]) % GP_BASE for i, rune in enumerate(values)]
    known = decode(corpus["pages"][56]["indices"][:5])
    assert "".join(corpus["translit"][i] for i in known) == "ANEND"

    source = CONTROL.read_text(encoding="utf-8")
    native = gp_encode(source, corpus["translit"])
    assert len(native) == 218800
    score = build_score(native[:TRAIN_RUNES])
    held = native[TRAIN_RUNES:]
    window_length = len(ciphertext)
    windows = sorted(score(held[i:i + window_length]) for i in
                     range(0, len(held) - window_length + 1, 17))
    assert len(windows) == 2267
    observed = {
        "raw": score(ciphertext),
        "forward_phi": score(decode(ciphertext)),
        "reverse_all_phi": score(decode(ciphertext[::-1])),
    }
    assert all(value < windows[0] for value in observed.values())
    return {
        "test": "Direct p56 phi(prime_i) inverse, phase 0, GP29; p0 physical scan",
        "original_rune_count": len(ciphertext),
        "authentic_solved_p56_positive_control": "ANEND",
        "candidate_orientations": ["forward", "reverse_all"],
        "source_gp_shakespeare_training_runes": TRAIN_RUNES,
        "heldout_window_count": len(windows),
        "heldout_window_scores": {
            "min": windows[0],
            "median": windows[len(windows) // 2],
            "max": windows[-1],
        },
        "p0_fourgram_scores": observed,
        "reverse_phi_prefix": "".join(corpus["translit"][i] for i in
                                      decode(ciphertext[::-1])[:72]),
        "candidate_recovered_unknown_plaintext": False,
    }


if __name__ == "__main__":
    print(json.dumps({"source_crosses": source_crosses(),
                      "historical_phi_readout": readout()}, indent=2))
