#!/usr/bin/env python3
"""Test whether smooth lognormal rate drift explains the LP2 doublet-gap T7 signal.

This is an exploratory alternative-model plant, not a cipher decoder. It models
adjacent-equal ciphertext sites as a Cox process with a piecewise-constant,
lognormal intensity whose log-rate follows AR(1) across cells. Cell width L is
the nominal correlation length; rho=exp(-1) per cell. The exact observed event
count is conditioned on each draw.

Run from the repository root:
    python sims/t7_smooth_heterogeneity_plant.py
    python sims/t7_smooth_heterogeneity_plant.py --quick
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np

N_BLOCK = 1000
OBSERVED_AC1 = 0.38001968924100965
OBSERVED_BLOCK_COUNTS = np.array([8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5])


def lag1(values: np.ndarray) -> float:
    a = np.asarray(values[:-1], dtype=float)
    b = np.asarray(values[1:], dtype=float)
    da = a - a.mean()
    db = b - b.mean()
    denom = math.sqrt(float(da @ da) * float(db @ db))
    return float(da @ db / denom) if denom else float("nan")


def observed(corpus_path: Path) -> dict:
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    pages = [
        p for p in sorted(corpus["pages"], key=lambda p: p["page"])
        if 0 <= p["page"] <= 55 and p["indices"]
    ]
    stream = np.asarray([r for page in pages for r in page["indices"]], dtype=np.int16)
    sites = np.flatnonzero(stream[:-1] == stream[1:])
    gaps = np.diff(sites)
    blocks = np.bincount(sites // N_BLOCK, minlength=math.ceil(len(stream) / N_BLOCK))
    assert len(pages) == 55, len(pages)
    assert len(stream) == 12956, len(stream)
    assert len(sites) == 86, len(sites)
    assert np.array_equal(blocks, OBSERVED_BLOCK_COUNTS), blocks.tolist()
    return {
        "physical_pages": [p["page"] for p in pages],
        "n_runes": int(len(stream)),
        "doublet_sites": int(len(sites)),
        "gap_count": int(len(gaps)),
        "gap_lag1": lag1(gaps),
        "block_counts": blocks.tolist(),
        "block_variance": float(blocks.var(ddof=1)),
        "block_lag1": lag1(blocks),
        "gap_max": int(gaps.max()),
        "gap_min": int(gaps.min()),
    }


def block_summary(sites: np.ndarray, n: int) -> tuple[float, float]:
    counts = np.bincount(sites // N_BLOCK, minlength=math.ceil(n / N_BLOCK))
    return float(counts.var(ddof=1)), lag1(counts)


def simulate_uniform(n: int, k: int, draws: int, seed: int,
                     obs: dict) -> dict:
    rng = np.random.default_rng(seed)
    ac = np.empty(draws)
    block_var = np.empty(draws)
    block_ac = np.empty(draws)
    for i in range(draws):
        sites = np.sort(rng.choice(n - 1, size=k, replace=False))
        ac[i] = lag1(np.diff(sites))
        block_var[i], block_ac[i] = block_summary(sites, n)
    return {
        "model": "uniform fixed-count sites",
        "draws": draws,
        "seed": seed,
        "gap_ac1_mean": float(ac.mean()),
        "gap_ac1_sd": float(ac.std(ddof=1)),
        "p_gap_ac1_ge_observed": float(np.mean(ac >= obs["gap_lag1"])),
        "block_variance_mean": float(block_var.mean()),
        "block_ac1_mean": float(block_ac.mean()),
        "joint_count": int(np.sum(
            (ac >= obs["gap_lag1"])
            & (block_var <= obs["block_variance"])
            & (block_ac <= obs["block_lag1"])
        )),
    }


def simulate_smooth(n: int, k: int, cell_width: int, sigma: float,
                    draws: int, seed: int, obs: dict) -> dict:
    rng = np.random.default_rng(seed)
    lengths = np.asarray([
        min(cell_width, n - i * cell_width)
        for i in range(math.ceil(n / cell_width))
    ], dtype=np.int64)
    cells = len(lengths)
    rho = math.exp(-1.0)
    innovation = math.sqrt(1.0 - rho * rho)
    ac = np.empty(draws)
    block_var = np.empty(draws)
    block_ac = np.empty(draws)

    for it in range(draws):
        z = np.empty(cells)
        z[0] = rng.normal()
        for j in range(1, cells):
            z[j] = rho * z[j - 1] + innovation * rng.normal()
        weights = np.exp(sigma * z - 0.5 * sigma * sigma)
        probabilities = weights * lengths
        probabilities /= probabilities.sum()
        counts = rng.multinomial(k, probabilities)

        sites = []
        for j, count in enumerate(counts):
            if count:
                start = j * cell_width
                offsets = rng.choice(lengths[j], size=count, replace=False)
                sites.extend((start + offsets).tolist())
        sites = np.sort(np.asarray(sites, dtype=np.int64))
        ac[it] = lag1(np.diff(sites))
        block_var[it], block_ac[it] = block_summary(sites, n)

    joint = (
        (ac >= obs["gap_lag1"])
        & (block_var <= obs["block_variance"])
        & (block_ac <= obs["block_lag1"])
    )
    return {
        "model": "lognormal AR(1) Cox intensity",
        "cell_width": cell_width,
        "sigma": sigma,
        "rho_per_cell": rho,
        "draws": draws,
        "seed": seed,
        "gap_ac1_mean": float(ac.mean()),
        "gap_ac1_sd": float(ac.std(ddof=1)),
        "p_gap_ac1_ge_observed": float(np.mean(ac >= obs["gap_lag1"])),
        "block_variance_mean": float(block_var.mean()),
        "p_block_variance_le_observed": float(np.mean(block_var <= obs["block_variance"])),
        "block_ac1_mean": float(block_ac.mean()),
        "p_block_ac1_le_observed": float(np.mean(block_ac <= obs["block_lag1"])),
        "joint_count": int(joint.sum()),
        "p_joint": float(joint.mean()),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--corpus", type=Path,
        default=Path("resources/liber-primus/lp2-corpus.json")
    )
    parser.add_argument("--quick", action="store_true")
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    obs = observed(args.corpus)
    base_draws = 5000 if args.quick else 20000
    grid_draws = 1000 if args.quick else 4000
    selected_draws = 2000 if args.quick else 10000
    result = {
        "scope": "55 nonempty physical pages p0-p55; empty numeric p50 excluded",
        "observed": obs,
        "uniform_null": simulate_uniform(
            obs["n_runes"], obs["doublet_sites"], base_draws, 4321, obs
        ),
        "smooth_grid": [],
        "selected_joint_checks": [],
        "model_caveat": (
            "This tests one smooth-rate alternative only. It does not rule out "
            "event-level state, short-memory filters, page/word-conditioned "
            "processes, or other nonstationary mechanisms."
        ),
    }
    for width in [50, 100, 200, 400, 800, 1600]:
        for sigma in [0.2, 0.4, 0.6, 0.8]:
            seed = 123 + width * 100 + int(sigma * 1000)
            result["smooth_grid"].append(simulate_smooth(
                obs["n_runes"], obs["doublet_sites"], width, sigma,
                grid_draws, seed, obs
            ))
    selected = [
        (50, .8), (100, .8), (200, .8), (400, .8),
        (800, .6), (800, .8), (1600, .6), (1600, .8),
    ]
    for width, sigma in selected:
        seed = 991 + width * 100 + int(sigma * 1000)
        result["selected_joint_checks"].append(simulate_smooth(
            obs["n_runes"], obs["doublet_sites"], width, sigma,
            selected_draws, seed, obs
        ))

    payload = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.write_text(payload, encoding="utf-8")
    print(payload, end="")


if __name__ == "__main__":
    main()
