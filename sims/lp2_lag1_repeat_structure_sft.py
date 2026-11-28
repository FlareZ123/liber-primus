#!/usr/bin/env python3
"""SFT for LP2's lag-1 repeat-suppression structure.

Reads the repository's image-corrected transcription and reproduces the structural
constraint documented in im-results/lp2-lag1-repeat-suppression-structure.md.

Default mode is deterministic and fast. Add --permutations 200000 --seed 3301
to reproduce the count-conditioned gap-autocorrelation Monte Carlo.
"""
from __future__ import annotations

import argparse
import math
import random
import re
from pathlib import Path
from statistics import NormalDist

RUNE_RE = re.compile(r"[\u16A0-\u16FF]")
EXPECTED_N = 12956
EXPECTED_DOUBLET = 86
EXPECTED_BLOCKS = [8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]


def corr(x: list[float], y: list[float]) -> float:
    if len(x) != len(y) or len(x) < 2:
        raise ValueError("correlation needs equal nontrivial vectors")
    mx = sum(x) / len(x)
    my = sum(y) / len(y)
    num = sum((a - mx) * (b - my) for a, b in zip(x, y))
    dx = sum((a - mx) ** 2 for a in x)
    dy = sum((b - my) ** 2 for b in y)
    return num / math.sqrt(dx * dy)


def chi2_sf_wh(x: float, df: int) -> float:
    """Wilson-Hilferty chi-square survival approximation."""
    z = ((x / df) ** (1.0 / 3.0) - (1.0 - 2.0 / (9.0 * df))) / math.sqrt(2.0 / (9.0 * df))
    return 1.0 - NormalDist().cdf(z)


def load_unknown(path: Path) -> tuple[list[str], list[str]]:
    text = path.read_text(encoding="utf-8")
    blocks = text.split("\n%\n")
    if len(blocks) < 57:
        raise AssertionError(f"expected >=57 rune-bearing blocks, got {len(blocks)}")
    raw = blocks[:55]
    pages = ["".join(RUNE_RE.findall(p)) for p in raw]
    stream = "".join(pages)
    if len(stream) != EXPECTED_N:
        raise AssertionError(f"expected {EXPECTED_N} runes, got {len(stream)}")
    if len(set(stream)) != 29:
        raise AssertionError(f"expected 29 runes, got {len(set(stream))}")
    return raw, pages


def transition_stats(stream: str) -> dict[str, object]:
    chars = sorted(set(stream))
    pos = {c: i for i, c in enumerate(chars)}
    matrix = [[0] * 29 for _ in range(29)]
    row = [0] * 29
    col = [0] * 29
    freq = [0] * 29

    for c in stream:
        freq[pos[c]] += 1
    for a, b in zip(stream, stream[1:]):
        i, j = pos[a], pos[b]
        matrix[i][j] += 1
        row[i] += 1
        col[j] += 1

    diagonal = [matrix[i][i] for i in range(29)]
    off_chi = 0.0
    for i in range(29):
        off_row = row[i] - matrix[i][i]
        denom = sum(col[j] for j in range(29) if j != i)
        for j in range(29):
            if j == i:
                continue
            expected = off_row * col[j] / denom
            off_chi += (matrix[i][j] - expected) ** 2 / expected

    weights = [n * (n - 1) for n in freq]
    total_w = sum(weights)
    total_d = sum(diagonal)
    diag_expected = [total_d * w / total_w for w in weights]
    diag_chi = sum((o - e) ** 2 / e for o, e in zip(diagonal, diag_expected))

    return {
        "offdiag_chi2": off_chi,
        "offdiag_df": 783,
        "offdiag_p_wh": chi2_sf_wh(off_chi, 783),
        "diag_identity_chi2": diag_chi,
        "diag_identity_df": 28,
        "diag_identity_p_wh": chi2_sf_wh(diag_chi, 28),
    }


def boundary_stats(raw_pages: list[str], pages: list[str]) -> dict[str, tuple[int, int, float]]:
    classes = {
        "same_group": [0, 0],
        "cross_group": [0, 0],
        "cross_line": [0, 0],
        "cross_period": [0, 0],
        "cross_page": [0, 0],
    }

    for raw in raw_pages:
        runes = [(m.group(0), m.start()) for m in RUNE_RE.finditer(raw)]
        for (a, ia), (b, ib) in zip(runes, runes[1:]):
            sep = raw[ia + 1:ib]
            eq = int(a == b)
            is_line = "/" in sep or "\n" in sep
            is_group = "-" in sep or "." in sep or "&" in sep or "$" in sep or is_line
            key = "cross_group" if is_group else "same_group"
            classes[key][0] += 1
            classes[key][1] += eq
            if is_line:
                classes["cross_line"][0] += 1
                classes["cross_line"][1] += eq
            if "." in sep:
                classes["cross_period"][0] += 1
                classes["cross_period"][1] += eq

    for prev, cur in zip(pages, pages[1:]):
        classes["cross_page"][0] += 1
        classes["cross_page"][1] += int(prev[-1] == cur[0])

    return {
        k: (pairs, d, d / pairs if pairs else float("nan"))
        for k, (pairs, d) in classes.items()
    }


def gap_stats(stream: str) -> tuple[list[int], list[int], float]:
    positions = [i - 1 for i in range(1, len(stream)) if stream[i] == stream[i - 1]]
    gaps = [b - a for a, b in zip(positions, positions[1:])]
    gap_r = corr([float(x) for x in gaps[:-1]], [float(x) for x in gaps[1:]])
    return positions, gaps, gap_r


def monte_carlo(n_pairs: int, count: int, observed_r: float, reps: int, seed: int) -> tuple[int, float]:
    rng = random.Random(seed)
    hits = 0
    for _ in range(reps):
        positions = sorted(rng.sample(range(n_pairs), count))
        gaps = [b - a for a, b in zip(positions, positions[1:])]
        r = corr([float(x) for x in gaps[:-1]], [float(x) for x in gaps[1:]])
        if r >= observed_r:
            hits += 1
    return hits, (hits + 1) / (reps + 1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "transcription",
        nargs="?",
        type=Path,
        default=Path("resources/transcriptions/lp2-image-corrected.txt"),
    )
    ap.add_argument("--permutations", type=int, default=0)
    ap.add_argument("--seed", type=int, default=3301)
    args = ap.parse_args()

    raw_pages, pages = load_unknown(args.transcription)
    stream = "".join(pages)

    pairs = len(stream) - 1
    doublets = sum(a == b for a, b in zip(stream, stream[1:]))
    assert doublets == EXPECTED_DOUBLET

    freq = {c: stream.count(c) for c in set(stream)}
    p_marginal = sum(n * (n - 1) for n in freq.values()) / (len(stream) * (len(stream) - 1))

    lags = []
    for lag in range(1, 21):
        eq = sum(stream[i] == stream[i - lag] for i in range(lag, len(stream)))
        lags.append((lag, eq, len(stream) - lag, eq / (len(stream) - lag)))
    assert lags[0][1] == 86 and lags[1][1] == 441

    trans = transition_stats(stream)
    bounds = boundary_stats(raw_pages, pages)
    _, gaps, gap_r = gap_stats(stream)

    blocks = []
    for start in range(0, len(stream), 1000):
        end = min(len(stream), start + 1000)
        d = sum(stream[i] == stream[i - 1] for i in range(start + 1, end))
        blocks.append(d)
    assert blocks == EXPECTED_BLOCKS

    print("PASS: LP2 lag-1 structure")
    print(f"runes={len(stream)} pairs={pairs} doublets={doublets} rate={doublets/pairs:.12f}")
    print(f"random-permutation marginal equality reference={p_marginal:.12f}")
    print(f"lag1={lags[0]} lag2={lags[1]} lag11={lags[10]}")
    print(
        "offdiag:",
        f"chi2={trans['offdiag_chi2']:.6f}",
        f"df={trans['offdiag_df']}",
        f"p_WH={trans['offdiag_p_wh']:.6f}",
    )
    print(
        "diagonal identities:",
        f"chi2={trans['diag_identity_chi2']:.6f}",
        f"df={trans['diag_identity_df']}",
        f"p_WH={trans['diag_identity_p_wh']:.6f}",
    )
    for name, (n, d, rate) in bounds.items():
        print(f"{name}: pairs={n} doublets={d} rate={rate:.8f}")
    print(f"blocks={blocks}")
    print(f"gaps={len(gaps)} mean={sum(gaps)/len(gaps):.6f} lag1_corr={gap_r:.12f}")

    assert abs(doublets / pairs - 0.00663836356619066) < 1e-15
    assert abs(p_marginal - 0.0344783978645057) < 1e-15
    assert abs(trans["offdiag_chi2"] - 784.2529280329566) < 1e-9
    assert abs(gap_r - 0.38001968924100965) < 1e-12
    assert bounds["same_group"][:2] == (9640, 60)
    assert bounds["cross_group"][:2] == (3261, 26)
    assert bounds["cross_line"][:2] == (539, 4)
    assert bounds["cross_period"][:2] == (162, 1)
    assert bounds["cross_page"][:2] == (54, 0)

    if args.permutations:
        hits, p = monte_carlo(pairs, doublets, gap_r, args.permutations, args.seed)
        print(
            f"MC count-conditioned positions: seed={args.seed} reps={args.permutations} "
            f"hits_ge_observed={hits} add1_p={p:.12g}"
        )
        if args.permutations == 200000 and args.seed == 3301:
            assert hits == 82
            assert abs(p - 0.00041499792501037495) < 1e-18


if __name__ == "__main__":
    main()
