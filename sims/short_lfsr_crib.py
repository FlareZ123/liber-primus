"""Opening two-word known-plaintext attack on GF(29) linear keystream recurrences.

Input: resources/lp2-transcription.txt, preserving all 29 runes in reading order.
Dependencies: numpy, textblob. Run with Python 3.10+ from the repository root.

Assumptions: C_i = K_i +/- P_i mod 29; keystream advances once per
ciphertext rune; at most one unknown null in the opening eight-rune word
(order-3 null test). English opening words are in TextBlob's spelling
dictionary, with the spelling-to-GP alternatives generated below.

Scores use *untouched* ciphertext positions 13..299. A candidate is
plausible only if those positions independently decode as English.
The attack does not assume or report that these key models are true.
"""
from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path

import numpy as np
from textblob.en import spelling

ALPHABET = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
RUNE_TO_INT = {s: i for i, s in enumerate(ALPHABET)}
SPELLINGS = [
    ("ing", 21), ("th", 2), ("ng", 21), ("eo", 12),
    ("oe", 22), ("ae", 25), ("ia", 27), ("io", 27), ("ea", 28),
]
SINGLE = dict(zip(
    "fuorcgwhnijpxstbemlday",
    [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 23, 24, 26],
))
SINGLE.update(k=5, q=5, z=15, v=1)
TOKENS: dict[str, list[tuple[str, int]]] = {}
for token, number in SPELLINGS + list(SINGLE.items()):
    TOKENS.setdefault(token[0], []).append((token, number))


def encode_word(word: str, limit: int = 24) -> list[tuple[int, ...]]:
    cache: dict[int, list[tuple[int, ...]]] = {}

    def search(at: int) -> list[tuple[int, ...]]:
        if at == len(word):
            return [()]
        if at in cache:
            return cache[at]
        values: list[tuple[int, ...]] = []
        for symbol, index in TOKENS.get(word[at], ()):
            if word.startswith(symbol, at):
                for suffix in search(at + len(symbol)):
                    seq = (index,) + suffix
                    if len(seq) <= 8:
                        values.append(seq)
                    if len(values) >= limit:
                        break
            if len(values) >= limit:
                break
        cache[at] = values
        return values

    return search(0)


def load_cipher() -> np.ndarray:
    source = (Path(__file__).resolve().parents[1] / "resources"
              / "lp2-transcription.txt").read_text(encoding="utf-8")
    segments = source.split("%")
    assert len(segments) == 57, "57 rune-bearing LP2 page segments"
    unsolved = "".join(segments[:-2])
    runes = [RUNE_TO_INT[ch] for ch in unsolved if ch in RUNE_TO_INT]
    assert len(runes) == 12956
    # The first two contiguous groups must have 8 and 5 runes.
    first = re.findall(f"[{ALPHABET}]+", segments[0])
    assert len(first[0]) == 8
    assert len(first[1]) == 5
    return np.array(runes[:360], dtype=np.int64)


def dictionary() -> tuple[list[tuple[int, ...]], list[tuple[int, ...]],
                          set[tuple[int, ...]], np.ndarray]:
    eight, seven, five = set(), set(), set()
    frequencies = np.zeros(29, dtype=np.float64)
    for word, frequency in spelling.items():
        if not re.fullmatch("[a-z]+", word):
            continue
        variants = encode_word(word)
        for seq in variants:
            if len(seq) == 8:
                eight.add(seq)
            elif len(seq) == 7:
                seven.add(seq)
            elif len(seq) == 5 and frequency > 1:
                five.add(seq)
        if variants:
            for number in encode_word(word, limit=1)[0]:
                frequencies[number] += frequency
    odds = np.log(np.maximum(frequencies / frequencies.sum(), 1e-9) * 29)
    return sorted(eight), sorted(seven), five, odds


def solve_linear(a: list[list[int]], b: list[int]) -> tuple[int, ...] | None:
    n = len(b)
    matrix = [[v % 29 for v in row] + [b[i] % 29] for i, row in enumerate(a)]
    for i in range(n):
        pivot = next((r for r in range(i, n) if matrix[r][i]), None)
        if pivot is None:
            return None
        matrix[i], matrix[pivot] = matrix[pivot], matrix[i]
        scale = pow(matrix[i][i], -1, 29)
        matrix[i] = [(v * scale) % 29 for v in matrix[i]]
        for r in range(n):
            if r != i:
                factor = matrix[r][i]
                matrix[r] = [(u - factor * v) % 29
                             for u, v in zip(matrix[r], matrix[i])]
    return tuple(matrix[i][-1] for i in range(n))


def recurrence(key: list[int], coeff: tuple[int, ...],
               offset: int = 0) -> list[int]:
    order = len(coeff) - bool(offset)
    for i in range(len(key), 360):
        key.append((sum(coeff[j] * key[i-j-1] for j in range(order))
                    + (coeff[-1] if offset else 0)) % 29)
    return key


def score_key(cipher: np.ndarray, key: list[int],
              sign: int, odds: np.ndarray) -> float:
    decoded = (sign * (cipher[13:300] - np.array(key[13:300]))) % 29
    return float(odds[decoded].sum())


def scan_short(cipher: np.ndarray, cribs: list[tuple[int, ...]],
               sign: int, odds: np.ndarray) -> dict:
    candidates = []
    for word in cribs:
        key = [int((cipher[i] - sign*word[i]) % 29) for i in range(8)]
        for order, affine in [(2, False), (2, True),
                              (3, False), (3, True), (4, False)]:
            size = order + int(affine)
            a, b = [], []
            for i in range(order, order+size):
                a.append([key[i-j-1] for j in range(order)]
                         + ([1] if affine else []))
                b.append(key[i])
            params = solve_linear(a, b)
            if params is None:
                continue
            if any(key[i] != (
                sum(params[j]*key[i-j-1] for j in range(order))
                + (params[-1] if affine else 0)) % 29
                for i in range(order+size, 8)
            ):
                continue
            stream = recurrence(key.copy(), params, int(affine))
            candidates.append((score_key(cipher, stream, sign, odds),
                               word, order, affine, params))
    return {
        "retained": len(candidates),
        "best": sorted(candidates, reverse=True)[:3],
    }


def inverse3(matrix: np.ndarray) -> np.ndarray | None:
    a = np.concatenate([matrix % 29, np.eye(3, dtype=np.int64)], axis=1)
    for i in range(3):
        pivot = next((p for p in range(i, 3) if a[p, i]), None)
        if pivot is None:
            return None
        a[[i, pivot]] = a[[pivot, i]]
        a[i] = a[i] * pow(int(a[i, i]), -1, 29) % 29
        for r in range(3):
            if r != i:
                a[r] = (a[r] - a[r, i] * a[i]) % 29
    return a[:, 3:]


def scan_order5(cipher: np.ndarray, cribs: list[tuple[int, ...]],
                words5: set[tuple[int, ...]], sign: int,
                odds: np.ndarray) -> dict:
    # The first eight key values impose three linear constraints on five
    # tap coefficients. Exhaust the remaining 29^2 = 841 possibilities.
    u, v = np.divmod(np.arange(841, dtype=np.int64), 29)
    found = []
    singular = 0
    for word in cribs:
        key = (cipher[:8] - sign*np.array(word)) % 29
        rows = np.array([[key[i-j-1] for j in range(5)]
                         for i in (5, 6, 7)], dtype=np.int64)
        inv = inverse3(rows[:, :3])
        if inv is None:
            singular += 1
            continue
        goal = (key[[5, 6, 7]][None, :] - u[:, None]*rows[:, 3]
                - v[:, None]*rows[:, 4]) % 29
        three = goal @ inv.T % 29
        coeff = np.column_stack([three, u, v])
        streams = np.zeros((841, 13), dtype=np.int64)
        streams[:, :8] = key
        for i in range(8, 13):
            streams[:, i] = (
                coeff * streams[:, i-5:i][:, ::-1]).sum(axis=1) % 29
        decrypted_second = (
            sign * (cipher[None, 8:13] - streams[:, 8:13])) % 29
        for row in range(841):
            if tuple(int(x) for x in decrypted_second[row]) not in words5:
                continue
            params = tuple(map(int, coeff[row]))
            stream = recurrence(list(map(int, streams[row])), params)
            found.append((score_key(cipher, stream, sign, odds),
                          word, params))
    return {"singular_openings": singular, "retained": len(found),
            "best": sorted(found, reverse=True)[:5]}


def scan_one_null_order3(cipher: np.ndarray, cribs7: list[tuple[int, ...]],
                         words5: set[tuple[int, ...]], sign: int,
                         odds: np.ndarray) -> dict:
    # A null in the first word may represent any of 29 unobserved
    # plaintext values. The key is assumed to advance at this null.
    out, algebraic, trials = [], 0, 0
    for word in cribs7:
        for slot in range(8):
            for unknown in range(29):
                plain = word[:slot] + (unknown,) + word[slot:]
                key = [int((cipher[i]-sign*plain[i]) % 29)
                       for i in range(8)]
                rows = [[key[2], key[1], key[0]],
                        [key[3], key[2], key[1]],
                        [key[4], key[3], key[2]]]
                params = solve_linear(rows, key[3:6])
                trials += 1
                if params is None or any(
                    key[i] != sum(params[j]*key[i-j-1]
                                  for j in range(3)) % 29
                    for i in (6, 7)
                ):
                    continue
                algebraic += 1
                for i in range(8, 13):
                    key.append(sum(params[j]*key[i-j-1]
                                   for j in range(3)) % 29)
                second = tuple(int(sign*(cipher[i]-key[i]) % 29)
                               for i in range(8, 13))
                if second not in words5:
                    continue
                stream = recurrence(key, params)
                out.append((score_key(cipher, stream, sign, odds),
                            word, slot, unknown, params))
    return {"tested": trials, "algebraic_matches": algebraic,
            "dictionary_second": len(out),
            "best": sorted(out, reverse=True)[:5]}


def main() -> None:
    cipher = load_cipher()
    eight, seven, five, odds = dictionary()
    data = {
        "rune_prefix_length": len(cipher),
        "opening_8_cribs": len(eight),
        "opening_7_cribs": len(seven),
        "second_5_cribs": len(five),
        "scores_region": [13, 300],
    }
    for sign in (1, -1):
        data[str(sign)] = {
            "orders_2_to_4": scan_short(cipher, eight, sign, odds),
            "order5": scan_order5(cipher, eight, five, sign, odds),
            "order3_one_opening_null": scan_one_null_order3(
                cipher, seven, five, sign, odds),
        }
    print(json.dumps(data, indent=2))


if __name__ == "__main__":
    main()
