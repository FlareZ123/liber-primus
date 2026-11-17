#!/usr/bin/env python3
"""Reduce the six previously untested LP2 pointer-direction windows, Issue #1329.

The completed first-two-section matrix is separate. This reducer strictly
requires every one of the 216 original six-section shards and every registered
matched-null vector. A screening score is not accepted as plaintext.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from lp2_pdir_stage1_reduce import (
    SIX,
    REMAINING,
    THRESHOLD,
    atomic_locked,
    per_convention,
)

CONVENTIONS = tuple(sorted((*SIX, *REMAINING)))
WINDOWS = {
    "seg0.9": 1729,
    "seg0.11": 1894,
    "seg0.12": 1021,
    "seg0.13": 1524,
    "seg0.14": 1589,
    "seg0.15": 3316,
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--run-id", type=int, required=True)
    args = parser.parse_args()

    table = [per_convention(args.root, "pdir-sixsections", conv) for conv in CONVENTIONS]
    real = sum(row["original"]["vectors"] for row in table)
    null = sum(row["matched_random"]["vectors"] for row in table)
    assert (len(table), real, null) == (18, 2376, 396), (len(table), real, null)

    candidates = [
        {"convention": row["convention"], **hit}
        for row in table
        for hit in row["candidate_files"]
    ]
    report = {
        "task": "Director Issue #1329, original six-section complement",
        "status": "complete 216-shard original six-section screening",
        "runs_already_covering_first_two_sections": [44006868510, 44007390480],
        "six_section_run": args.run_id,
        "windows": WINDOWS,
        "original_runes_in_six_sections": sum(WINDOWS.values()),
        "short_nine_rune_section_not_screenable": "seg0.10",
        "external_engine_commit": "15200c67abee106913ba01ff504c5b6e88d16cc7",
        "original_vectors": real,
        "matched_random_vectors": null,
        "streams_per_vector": 581,
        "candidate_threshold_300runes": THRESHOLD,
        "screen_candidates": candidates,
        "screen_candidate_count": len(candidates),
        "per_convention": table,
        "plaintext_status": "No candidate counts as plaintext without exact full-window and held-out recovery.",
    }

    lines = [
        "# Original LP2 pointer direction: six additional sections",
        "",
        "This strictly reduced, source-pinned manual campaign covers the **six original",
        "section windows omitted from the two earlier 216-shard stage1 matrices**.",
        "It uses the same 581 historical streams, 66 word-number rules, two",
        "orientations, 18 pointer conventions, both collision models, and independent",
        "planted controls. The six windows contain **11,073** authentic ciphertext",
        "runes; section 0.10 is only nine runes and cannot supply a 300-rune score.",
        "",
        f"All 216 artifacts present: **{real}** original rule/conv/orientation vectors.",
        f"Matched random-key controls: **{null}** vectors.",
        "",
        "| Convention | Best original first-300 IoC | Best vector | Hits >=1.40 | Null max |",
        "|---|---:|---|---:|---:|",
    ]
    for row in table:
        original = row["original"]
        control = row["matched_random"]
        null_text = str(control.get("best_ioc", "not tested"))
        lines.append(
            f'| {row["convention"]} | {original["best_ioc"]:.4f} | '
            f'{original["best_vector"]} | {original["candidates_at_least_1_40"]} | '
            f'{null_text} |'
        )
    lines.extend([
        "",
        f"**Candidate screen hits: {len(candidates)}.** These require the actual",
        "reference complete-window inversion, 20 wrong-offset controls, authentic",
        "coherent 150-rune plaintext, and forward reconstruction on withheld input.",
        "A preliminary IoC peak is never a decipherment.",
        "",
        f"[Six-window original GitHub Actions run]"
        f"(https://github.com/FlareZ123/liber-primus/actions/runs/{args.run_id}).",
        "The two earlier windows remain independently registered under runs",
        "44006868510 and 44007390480. No source key, original plaintext or",
        "puzzle endpoint is inferred from a negative screen.",
        "",
    ])
    atomic_locked(args.out / "lp2-pdir-original-sixsection.json",
                  json.dumps(report, indent=2) + "\n")
    atomic_locked(args.out / "lp2-pdir-original-sixsection.md",
                  "\n".join(lines))
    print(json.dumps({
        "result": "FULL SIX-SECTION SHARD COVERAGE",
        "original_vectors": real,
        "random_null_vectors": null,
        "candidate_count": len(candidates),
        "best_original": sorted([
            (r["original"]["best_ioc"], r["convention"], r["original"]["best_vector"])
            for r in table
        ], reverse=True)[:10],
    }, indent=2))


if __name__ == "__main__":
    main()
