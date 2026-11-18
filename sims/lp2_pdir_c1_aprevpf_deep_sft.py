#!/usr/bin/env python3
"""Deep calibration of the sole extra all-causal c=1 triage survivor.

The 8-plant all-causal screen left A_prev_pf reversed above one native control
only for convention 101 with coin retries. This script reruns that vector with
100 complete matched native plants under all four exact c=1 mechanics.
"""
from __future__ import annotations

import json
from pathlib import Path
import sys

SIMS = Path(__file__).resolve().parent
if str(SIMS) not in sys.path:
    sys.path.insert(0, str(SIMS))

import lp2_pdir_c1_allcausal_native_triage_sft as triage  # noqa: E402


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(
            "usage: lp2_pdir_c1_aprevpf_deep_sft.py EXTERNAL"
        )

    local = SIMS.parent
    external = Path(sys.argv[1]).resolve()
    work = external / "work/kscreen"
    if str(work) not in sys.path:
        sys.path.insert(0, str(work))

    import signrules  # type: ignore

    tabs = signrules.section_tables()
    assert len(tabs) == 8
    assert sum(len(runes) for _head, runes, _lens, _spans, _words in tabs) == 12947

    rule = signrules.build_rules()["A_prev_pf"]
    orientation = -1

    corpus = json.loads(
        (local / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
    primes = corpus["prime"]
    weights = triage.native_weights(local, corpus)

    gibran_words = triage.encode_english(
        (local / "resources/control/gibran_prophet_58585.txt").read_text(
            encoding="utf-8"
        ),
        corpus,
    )
    by_length: dict[int, list[list[int]]] = {}
    for word in gibran_words:
        by_length.setdefault(len(word), []).append(word)

    native_trials = [
        triage.matched_native_sections(tabs, by_length, trial)
        for trial in range(100)
    ]
    originals = {
        "skip": triage.source_score(
            tabs, rule, orientation, weights, coin_safe=False
        ),
        "coin": triage.source_score(
            tabs, rule, orientation, weights, coin_safe=True
        ),
    }

    mechanics = [
        ("021", 0, 2, "skip"),
        ("021", 0, 2, "coin"),
        ("101", 1, 0, "skip"),
        ("101", 1, 0, "coin"),
    ]
    results = []

    for mechanic_index, (conv, h, m, model) in enumerate(mechanics):
        scores = []
        sites = []
        for trial, native_sections in enumerate(native_trials):
            count, llr = triage.plant_score(
                native_sections,
                tabs,
                primes,
                weights,
                0xA9F3301 + mechanic_index * 0x100000 + trial * 271,
                h,
                m,
                model,
                rule,
                orientation,
            )
            sites.append(count)
            scores.append(llr)

        scores.sort()
        original = originals[model]
        results.append(
            {
                "convention": conv,
                "model": model,
                "original_sites": original["sites"],
                "original_llr": original["llr"],
                "control_site_min": min(sites),
                "control_site_max": max(sites),
                "control_llr_min": scores[0],
                "control_llr_median": scores[49],
                "control_llr_max": scores[-1],
                "controls_at_or_below_original": sum(
                    score <= original["llr"] for score in scores
                ),
            }
        )

    print(
        json.dumps(
            {
                "rule": "A_prev_pf",
                "orientation": "reversed",
                "results": results,
                "scope": (
                    "100-plant deep calibration of the sole non-C_cur_wp "
                    "all-causal triage survivor."
                ),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
