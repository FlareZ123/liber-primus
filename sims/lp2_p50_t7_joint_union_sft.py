#!/usr/bin/env python3
"""SFT: joint T7 two-tap exception clock + p50 0D open-gate collisions.

The two-tap shape parameters are frozen from the existing T7 model. The only
rate normalization subtracts the source-gated iid GP29 collision expectation
from the observed 86-event total before choosing beta. The p50 gate and its
1/29 collision probability have no fitted cell-specific rate.

Run from repository root:
    python sims/lp2_p50_t7_joint_union_sft.py
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np

N = 12956
OBSERVED_TOTAL = 86
THETA = 0.460664260759037
ALPHA = 0.6366617848820242
OBSERVED = {
    "n_sites": 86.0,
    "T1_ks": 0.10924093712529709,
    "T2_gapcv2": 0.892419051024709,
    "T3_chi2_mod29": 32.69767441860465,
    "T4_chi2_mod60": 50.744186046511665,
    "T6_dispersion": 1.090732964363706,
    "T7_gap_ac1": 0.38001968924100965,
}
KEYS = tuple(OBSERVED)


def load_source(repo: Path) -> tuple[np.ndarray, np.ndarray, set[int], np.ndarray, set[int]]:
    corpus = json.loads((repo / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    grid = json.loads((repo / "resources/liber-primus/base60-grid.json").read_text(encoding="utf-8"))

    pages = [
        page for page in corpus["pages"]
        if page["status"] == "unsolved" and page["page"] <= 55 and page["runic_count"]
    ]
    tape: list[int] = []
    page_index: list[int] = []
    for j, page in enumerate(pages):
        assert page["runic_count"] == len(page["indices"])
        tape.extend(page["indices"])
        page_index.extend([j] * len(page["indices"]))
    x = np.asarray(tape, dtype=np.int64)
    pg = np.asarray(page_index, dtype=np.int64)
    assert len(pages) == 55 and len(x) == N

    seams: set[int] = set()
    offset = 0
    for page in pages[:-1]:
        offset += len(page["indices"])
        seams.add(offset - 1)

    tokens = [token for row in grid["rows"] for token in row]
    assert len(tokens) == 256
    open_residues = {
        i for i, token in enumerate(tokens)
        if token[0] == "0" and token[1].isdigit()
    }
    assert open_residues == {13, 39, 192, 210, 229}

    leading_residues = {i for i, token in enumerate(tokens) if token[0] == "0"}
    assert len(leading_residues) == 60

    valid = np.asarray([i for i in range(N - 1) if i not in seams], dtype=np.int64)
    valid_set = set(map(int, valid))
    open_positions = np.asarray(
        [i for i in valid if (int(i) & 255) in open_residues],
        dtype=np.int64,
    )
    assert len(valid) == 12901
    assert len(open_positions) == 251
    return x, pg, seams, open_positions, leading_residues


def eqsites(x: np.ndarray) -> np.ndarray:
    return np.flatnonzero(x[1:] == x[:-1])


def chi(v: np.ndarray, k: int) -> float:
    counts = np.bincount(v, minlength=k).astype(float)
    expected = len(v) / k
    return float(((counts - expected) ** 2 / expected).sum())


def ks(p: np.ndarray, n: int) -> float:
    u = np.sort(p / float(n))
    k = len(u)
    i = np.arange(1, k + 1)
    return float(max(np.max(i / k - u), np.max(u - (i - 1) / k)))


def battery(p: np.ndarray, pg: np.ndarray) -> dict[str, float]:
    p = np.asarray(p, dtype=np.int64)
    gaps = np.diff(p).astype(float)
    counts = np.bincount(pg[p], minlength=55)[:55].astype(float)
    opportunities = np.bincount(
        pg[:-1][pg[:-1] == pg[1:]], minlength=55
    )[:55].astype(float)
    phat = counts.sum() / opportunities.sum()
    variance = opportunities * phat * (1 - phat)
    keep = variance > 0
    return {
        "n_sites": float(len(p)),
        "T1_ks": ks(p, len(pg)),
        "T2_gapcv2": float(gaps.var() / gaps.mean() ** 2),
        "T3_chi2_mod29": chi(p % 29, 29),
        "T4_chi2_mod60": chi(p % 60, 60),
        "T6_dispersion": float(
            (((counts - opportunities * phat) ** 2 / variance)[keep]).sum()
            / (keep.sum() - 1)
        ),
        "T7_gap_ac1": float(np.corrcoef(gaps[:-1], gaps[1:])[0, 1]),
    }


def empirical_two_sided(values: np.ndarray, observed: float) -> float:
    n = len(values)
    lo = (np.count_nonzero(values <= observed) + 1) / (n + 1)
    hi = (np.count_nonzero(values >= observed) + 1) / (n + 1)
    return min(1.0, 2 * min(lo, hi))


def two_tap(rng: np.random.Generator, beta: float) -> set[int]:
    previous = rng.gamma(ALPHA, beta)
    position = 0
    out: set[int] = set()
    while True:
        current = rng.gamma(ALPHA, beta)
        position += max(1, int(round(current + THETA * previous)))
        if position >= N - 1:
            break
        out.add(position)
        previous = current
    return out


def joint(
    rng: np.random.Generator,
    beta: float,
    open_positions: np.ndarray,
) -> np.ndarray:
    # Background: frozen-shape two-tap exception clock.
    events = two_tap(rng, beta)

    # Source gate: when 0D is active, ordinary independent GP29 collisions are
    # additionally possible. 1/29 follows from iid GP29; it is not fitted.
    gate_draws = rng.random(len(open_positions)) < (1 / 29)
    events.update(map(int, open_positions[gate_draws]))
    return np.asarray(sorted(events), dtype=np.int64)


def evaluate(repo: Path, draws: int, seed: int) -> dict[str, object]:
    x, pg, seams, open_positions, leading_residues = load_source(repo)
    observed_sites = eqsites(x)
    source = battery(observed_sites, pg)
    for key in KEYS:
        assert abs(source[key] - OBSERVED[key]) < 1e-12, (key, source[key], OBSERVED[key])

    # Adding a source-fixed 1/29 collision branch at 251 positions contributes
    # 251/29 expected events. Renormalize only the renewal mean to leave room
    # for that fixed contribution; theta and alpha remain frozen.
    expected_gate = len(open_positions) / 29
    target_background = OBSERVED_TOTAL - expected_gate
    beta = N / (target_background * ALPHA * (1 + THETA))

    valid_set = {i for i in range(N - 1) if i not in seams}
    open_residues = {int(i) & 255 for i in open_positions}

    sims = {key: np.empty(draws, dtype=float) for key in KEYS}
    gate_hits = np.empty(draws, dtype=np.int64)
    leading_hits = np.empty(draws, dtype=np.int64)
    seam_hits = np.empty(draws, dtype=np.int64)

    rng = np.random.default_rng(seed)
    for draw in range(draws):
        sites = joint(rng, beta, open_positions)
        stats = battery(sites, pg)
        for key in KEYS:
            sims[key][draw] = stats[key]
        gate_hits[draw] = sum(
            int(i) in valid_set and (int(i) & 255) in open_residues
            for i in sites
        )
        leading_hits[draw] = sum(
            int(i) in valid_set and (int(i) & 255) in leading_residues
            for i in sites
        )
        seam_hits[draw] = sum(int(i) in seams for i in sites)

    pvalues = {
        key: empirical_two_sided(sims[key], OBSERVED[key])
        for key in KEYS
    }
    gate_upper = (np.count_nonzero(gate_hits >= 10) + 1) / (draws + 1)
    leading_upper = (np.count_nonzero(leading_hits >= 33) + 1) / (draws + 1)
    no_seam_frequency = float(np.mean(seam_hits == 0))

    result = {
        "seed": seed,
        "draws": draws,
        "beta_joint": beta,
        "expected_gate_events": expected_gate,
        "target_background_events": target_background,
        "mean_total_events": float(np.mean(sims["n_sites"])),
        "mean_gate_hits": float(np.mean(gate_hits)),
        "mean_leading_zero_hits": float(np.mean(leading_hits)),
        "mean_T7": float(np.mean(sims["T7_gap_ac1"])),
        "battery_two_sided_p": pvalues,
        "min_battery_p": min(pvalues.values()),
        "gate_hits_ge_10_upper": float(gate_upper),
        "leading_zero_hits_ge_33_upper": float(leading_upper),
        "no_page_seam_event_frequency": no_seam_frequency,
    }

    assert result["min_battery_p"] >= 0.05, result
    assert result["gate_hits_ge_10_upper"] >= 0.05, result
    assert result["leading_zero_hits_ge_33_upper"] >= 0.05, result
    assert result["no_page_seam_event_frequency"] >= 0.05, result
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--draws", type=int, default=20000)
    args = parser.parse_args()

    runs = [evaluate(args.repo, args.draws, seed) for seed in (3311, 123456789)]
    print(json.dumps({
        "model": (
            "frozen-shape T7 two-tap renewal union source-fixed p50 0D "
            "iid GP29 collisions"
        ),
        "runs": runs,
    }, indent=2, sort_keys=True))
    print("PASS: joint model crosses T1/T2/T3/T4/T6/T7 plus p50 gate and parent-state gates")


if __name__ == "__main__":
    main()
