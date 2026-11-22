#!/usr/bin/env python3
"""Held-out audit of an external 27x27 / three-rune LP2 decryption claim.

From the repository root:
  python sims/lp2_external_27x27_nextblock_audit.py
  python sims/lp2_external_27x27_nextblock_audit.py --null 100 --seed 20261116

TextBlob is optional; its spelling-frequency table supplies the weak unigram
segmentation heuristic used in the recorded random-control experiment.
"""
from __future__ import annotations

import argparse
import importlib.metadata
import json
import math
import random
import statistics
from pathlib import Path

GP = [
    "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N",
    "I", "J", "EO", "P", "X", "S", "T", "B", "E", "M",
    "L", "NG", "OE", "D", "A", "AE", "Y", "IA", "EA",
]
PREVIOUS_LEFTMOST = (8, 17)
EXPECTED_FIRST_BLOCK = [24, 15, 10, 6, 3, 2, 18]
FIRST_BLOCK_CELLS = [
    (13, 25), (13, 26), (13, 27), (14, 1), (14, 2), (14, 3), (14, 4)
]


def phi(n: int) -> int | None:
    if n <= 0:
        return None
    result, x, p = n, n, 2
    while p * p <= x:
        if x % p == 0:
            while x % p == 0:
                x //= p
            result -= result // p
        p += 1
    if x > 1:
        result -= result // x
    return result


def mobius(n: int) -> int | None:
    if n <= 0:
        return None
    if n == 1:
        return 1
    x, p, factors = n, 2, 0
    while p * p <= x:
        if x % p == 0:
            x //= p
            factors += 1
            if x % p == 0:
                return 0
        p += 1
    if x > 1:
        factors += 1
    return -1 if factors % 2 else 1


def n0(r: int, c: int) -> int:
    return 27 * (r - 1) + c


def n1(r: int, c: int) -> int:
    return 27 * (c - 1) + 28 - r


def n2(r: int, c: int) -> int:
    return 730 - n0(r, c)


def n3(r: int, c: int) -> int:
    return 27 * (27 - c) + r


def load_grid() -> tuple[list[int], list[str]]:
    root = Path(__file__).resolve().parents[1]
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text())
    pages = {int(page["page"]): page["indices"] for page in corpus["pages"]}
    grid = [value for page_no in (0, 1, 2) for value in pages[page_no]]
    if len(grid) != 729 or any(not 0 <= value < 29 for value in grid):
        raise ValueError("Expected exactly 729 GP29 indices on LP2 pages 0-2")
    return grid, corpus["translit"]


def positive_control(grid: list[int], translit: list[str]) -> dict:
    key = [25, 10, 28]  # AE-I-EA, as specified by the external claim
    cipher = [grid[(r - 1) * 27 + c - 1] for r, c in FIRST_BLOCK_CELLS]
    plain = [(value - key[i % 3]) % 29 for i, value in enumerate(cipher)]
    if plain != EXPECTED_FIRST_BLOCK:
        raise AssertionError(f"First-block reproduction failed: {plain}")
    return {
        "cipher_indices": cipher,
        "key_indices": key,
        "plaintext_indices": plain,
        "plaintext_gp": " ".join(translit[value] for value in plain),
    }


def source_candidates(grid: list[int]) -> list[dict]:
    """Horizontal, even/even, even-radius, non-mirror source nodes.

    Both centre-transform choices are included because the external method
    does not state a deterministic rule selecting transformed vs direct.
    """
    out = []
    for r in range(2, 27, 2):
        for c in range(2, 28, 2):
            for radius in range(2, 13, 2):
                if c - radius < 1 or c + radius > 27:
                    continue
                left = grid[(r - 1) * 27 + (c - radius) - 1]
                center = grid[(r - 1) * 27 + c - 1]
                right = grid[(r - 1) * 27 + (c + radius) - 1]
                if left == right or min(left, center, right) == 0:
                    continue
                for transform_center in (True, False):
                    derived_center = phi(center) if transform_center else center
                    key = [left, derived_center, right]
                    if any(value is None or value == 0 for value in key):
                        continue
                    signature = tuple(mobius(phi(value)) for value in key)
                    if signature != (0, 1, 0):
                        continue
                    # Signature sum is 1 mod 3: rotate the derived key left once.
                    out.append({
                        "center": (r, c),
                        "radius": radius,
                        "transform_center": transform_center,
                        "source_key": [left, center, right],
                        "derived_key": key,
                        "aligned_key": [key[1], key[2], key[0]],
                    })
    return out


def segment_candidates() -> list[dict]:
    """Diagonal, leftmost-first segments satisfying the block-38 forecast."""
    starts = []
    lr, lc = PREVIOUS_LEFTMOST
    for r in range(1, 28, 2):  # odd leftmost row
        for c in range(2, 28, 2):  # even leftmost column
            if not (r - c == lr - lc or r + c == lr + lc):
                continue
            # S=32 gives Direct/+1 mode; forecast requires mu(n1(B)) in {0,+1}.
            if mobius(n1(r, c)) not in (0, 1):
                continue
            starts.append((r, c))

    out = []
    for r, c in starts:
        for dr in (-1, 1):  # up-right or down-right; column increases
            for length in range(3, 28, 2):  # odd length => odd endpoint row
                coords = [(r + dr * step, c + step) for step in range(length)]
                if not all(1 <= rr <= 27 and 1 <= cc <= 27 for rr, cc in coords):
                    continue
                endpoint = coords[-1]
                if endpoint[0] % 2 != 1:
                    continue
                out.append({
                    "beginning": (r, c),
                    "endpoint": endpoint,
                    "direction_dr": dr,
                    "length": length,
                    "coords": coords,
                })
    return out


def squarefree_gcd(a: int, b: int) -> bool:
    value = mobius(math.gcd(a, b))
    return value is not None and value != 0


def load_word_frequencies():
    from textblob.en import spelling
    freq = {
        word.lower(): count
        for word, count in spelling.items()
        if word.isalpha()
    }
    return freq, sum(freq.values()), importlib.metadata.version("textblob")


def best_segmentation(text: str, freq: dict[str, int], total: int):
    """Best full segmentation by TextBlob unigram frequency."""
    n = len(text)
    dp = [None] * (n + 1)
    dp[0] = (0.0, [])
    for i in range(n):
        if dp[i] is None:
            continue
        for j in range(i + 1, min(n, i + 20) + 1):
            word = text[i:j]
            count = freq.get(word)
            if count is None or count < 2:
                continue
            penalty = 2.0 if len(word) == 1 else 0.35 if len(word) == 2 else 0.0
            score = dp[i][0] + math.log(count / total) - penalty
            if dp[j] is None or score > dp[j][0]:
                dp[j] = (score, dp[i][1] + [word])
    if dp[n] is None:
        return None
    return dp[n][0] / n, dp[n][1]


def evaluate_grid(grid, translit, segments, freq=None, total_freq=None, keep=10):
    sources = source_candidates(grid)
    candidate_count = 0
    unique_texts = set()
    multi_common = 0
    top = []

    for source in sources:
        mr, mc = source["center"]
        m0, m1 = n0(mr, mc), n1(mr, mc)
        key = source["aligned_key"]
        for segment in segments:
            br, bc = segment["beginning"]
            er, ec = segment["endpoint"]
            b0, l0 = n0(br, bc), n0(br, bc)  # B=L: leftmost is beginning
            if not squarefree_gcd(m0, b0):
                continue
            if not squarefree_gcd(m0, l0):
                continue
            if not squarefree_gcd(m1, n3(er, ec)):
                continue
            if not squarefree_gcd(m0, n2(er, ec)):
                continue

            candidate_count += 1
            plain = [
                (grid[(r - 1) * 27 + c - 1] - key[i % 3]) % 29
                for i, (r, c) in enumerate(segment["coords"])
            ]
            text = "".join(translit[value] for value in plain).lower()
            unique_texts.add(text)

            if freq is None or total_freq is None:
                continue
            scored = best_segmentation(text, freq, total_freq)
            if scored is None:
                continue
            score, words = scored
            if (
                len(words) >= 2
                and all(len(word) >= 2 and freq.get(word, 0) >= 10 for word in words)
            ):
                multi_common += 1
            top.append({
                "score_per_character": score,
                "text": text,
                "words": words,
                "source_center": list(source["center"]),
                "source_radius": source["radius"],
                "transform_center": source["transform_center"],
                "source_key": source["source_key"],
                "derived_key": source["derived_key"],
                "aligned_key": key,
                "beginning": list(segment["beginning"]),
                "endpoint": list(segment["endpoint"]),
                "length": segment["length"],
                "direction_dr": segment["direction_dr"],
            })

    top.sort(key=lambda item: item["score_per_character"], reverse=True)
    return {
        "source_candidates": len(sources),
        "segments": len(segments),
        "candidate_assignments": candidate_count,
        "unique_plaintext_strings": len(unique_texts),
        "multi_common": multi_common if freq is not None else None,
        "top_score": top[0]["score_per_character"] if top else None,
        "top_candidates": top[:keep],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--null", type=int, default=0, help="frequency-preserving grid shuffles")
    parser.add_argument("--seed", type=int, default=20261116)
    parser.add_argument("--top", type=int, default=10)
    args = parser.parse_args()

    grid, translit = load_grid()
    control = positive_control(grid, translit)
    segments = segment_candidates()
    try:
        freq, total_freq, textblob_version = load_word_frequencies()
    except ImportError:
        freq = total_freq = None
        textblob_version = None
        if args.null:
            raise SystemExit("--null requires TextBlob (tested with version 0.19.0)")

    actual = evaluate_grid(grid, translit, segments, freq, total_freq, args.top)
    result = {
        "positive_control": control,
        "next_block_forecast": {
            "previous_leftmost": list(PREVIOUS_LEFTMOST),
            "key_signature": [0, 1, 0],
            "phase": 1,
            "source_axis": "horizontal W-E",
            "source_center_parity": "even/even",
            "source_radius": "even",
            "source_type": "non-mirror",
            "ciphertext_axis": "diagonal",
            "leftmost_first": True,
            "leftmost_parity": "odd row/even column",
            "endpoint_row_parity": "odd",
            "ray_offset": 0,
            "center_transform_rule": "unspecified; both choices tested",
        },
        "actual_grid": actual,
        "textblob_version": textblob_version,
    }

    if args.null:
        rng = random.Random(args.seed)
        null_rows = []
        for _ in range(args.null):
            shuffled = grid.copy()
            rng.shuffle(shuffled)
            measured = evaluate_grid(shuffled, translit, segments, freq, total_freq, keep=1)
            null_rows.append({
                "source_candidates": measured["source_candidates"],
                "candidate_assignments": measured["candidate_assignments"],
                "multi_common": measured["multi_common"],
                "top_score": measured["top_score"],
                "top_text": measured["top_candidates"][0]["text"] if measured["top_candidates"] else None,
            })
        actual_score = actual["top_score"]
        actual_multi = actual["multi_common"]
        result["null"] = {
            "n": args.null,
            "seed": args.seed,
            "source_candidates_mean": statistics.mean(x["source_candidates"] for x in null_rows),
            "source_candidates_stdev": statistics.stdev(x["source_candidates"] for x in null_rows) if args.null > 1 else 0.0,
            "candidate_assignments_mean": statistics.mean(x["candidate_assignments"] for x in null_rows),
            "candidate_assignments_stdev": statistics.stdev(x["candidate_assignments"] for x in null_rows) if args.null > 1 else 0.0,
            "multi_common_mean": statistics.mean(x["multi_common"] for x in null_rows),
            "multi_common_stdev": statistics.stdev(x["multi_common"] for x in null_rows) if args.null > 1 else 0.0,
            "top_score_ge_actual": sum(x["top_score"] is not None and x["top_score"] >= actual_score for x in null_rows),
            "multi_common_ge_actual": sum(x["multi_common"] >= actual_multi for x in null_rows),
            "rows": null_rows,
        }

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
