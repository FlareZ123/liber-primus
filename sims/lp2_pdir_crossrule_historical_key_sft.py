#!/usr/bin/env python3
"""Original LP2 #1329: keyed reuse across distinct sections, allowing a changed rule.

Reuses exact completed published six-section historical and matched-random
top50 vectors. The key source may recur across sections even if a chapter
uses a different pointer direction rule. A section-conditional key-label
permutation tests this source-selected hypothesis against postselection.

Windows 11 / Python 3.12. No ciphertext or key stream is generated.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import json
import os
from pathlib import Path
import random
import tempfile

from filelock import FileLock

from lp2_pdir_sixsection_key_recurrence_sft import (
    EXPECTED_WINDOWS, FULL_NULL_CONVENTIONS, load_rows
)

KEY_POOL = 581
PERMUTATIONS = 2000
SEED = 20261118
SCORES = (1.30, 1.35)


def aggregate(raw: Path, convention: str) -> dict:
    data = {"real": defaultdict(dict), "null": defaultdict(dict)}
    for shard in range(12):
        folder = raw / f"pdir-sixsections-{convention}-{shard}"
        if not folder.is_dir():
            raise ValueError(f"Missing complete full-null source shard {folder}")
        for role in data:
            ts = list(folder.rglob(f"{role}/*.tsv"))
            if len(ts) not in (10, 12):
                raise ValueError(f"Missing exact original/null vector TSVs in {folder}/{role}: {len(ts)}")
            for file in ts:
                for row in load_rows(file):
                    # Exact source key ID; the direction rule/multiplier/model
                    # are chosen independently per section by the existing
                    # published search, a strictly broader receiver.
                    key, window, value = row["item"], row["window"], row["ioc"]
                    previous = data[role][window].get(key)
                    if previous is None or value > previous:
                        data[role][window][key] = value
    if any(set(data[role]) != EXPECTED_WINDOWS for role in data):
        raise ValueError("Original six-section gate not complete")
    if len(set().union(*(set(q) for q in data["real"].values()))) > KEY_POOL:
        raise ValueError("More than 581 original historical streams")
    if len(set().union(*(set(q) for q in data["null"].values()))) > KEY_POOL:
        raise ValueError("More than 581 matched random streams")
    return data


def rank_keys(windows: dict) -> list[dict]:
    by_key = defaultdict(dict)
    for section, keys in windows.items():
        for key, value in keys.items():
            by_key[key][section] = value
    ranked = []
    for key, by_section in by_key.items():
        if len(by_section) < 2:
            continue
        scores = sorted(by_section.values(), reverse=True)
        ranked.append({
            "key": key,
            "windows_visited": len(scores),
            "second_best": scores[1],
            "third_best": scores[2] if len(scores) >= 3 else None,
            "sections": [{"section": s, "max_score": v} for s, v in
                         sorted(by_section.items(), key=lambda x: -x[1])],
        })
    return sorted(ranked, key=lambda q: (-q["second_best"], q["key"]))


def summary(windows: dict) -> dict:
    keys = rank_keys(windows)
    return {
        "keys_with_two_sections": len(keys),
        "two_section_gate": {str(c): sum(k["second_best"] >= c for k in keys) for c in SCORES},
        "three_section_gate": {str(c): sum(
            k["third_best"] is not None and k["third_best"] >= c
            for k in keys) for c in SCORES},
        "max_second_best": keys[0]["second_best"] if keys else None,
        "max_third_best": max(
            (k["third_best"] for k in keys if k["third_best"] is not None),
            default=None),
        "top_key_sources": keys[:12],
    }


def calibration(windows: dict, seed: int) -> dict:
    """Permutation preserves each section's source score distribution.

    The permutation moves whole key profiles, preserving all correlated
    rule/vector maxima *within* each source section. It breaks only the
    hypothesis that exact key labels should recur across distinct sections.
    """
    source = summary(windows)
    observed = source["max_second_best"] or 0
    if observed <= 0:
        raise ValueError("All source sections have no repeated top50 key identities")
    observed_third = source["max_third_best"] or 0
    rng = random.Random(seed)
    score_windows = [list(keys.values()) for _, keys in sorted(windows.items())]
    if any(len(values) > KEY_POOL for values in score_windows):
        raise ValueError("Key identity pool too small")
    max_null = []
    max_null_third = []
    for _ in range(PERMUTATIONS):
        best_by_id = [[] for _ in range(KEY_POOL)]
        for values in score_windows:
            slots = rng.sample(range(KEY_POOL), len(values))
            for idx, score in zip(slots, values):
                best_by_id[idx].append(score)
        candidates = [sorted(v, reverse=True) for v in best_by_id if len(v) > 1]
        max_null.append(max((v[1] for v in candidates), default=0.0))
        max_null_third.append(max((v[2] for v in candidates if len(v) > 2), default=0.0))
    exceed = sum(v >= observed for v in max_null)
    exceed_third = sum(v >= observed_third for v in max_null_third)
    return {
        "observed_second_best": observed,
        "key_label_permutation_count": PERMUTATIONS,
        "seed": seed,
        "null_second_best_min": min(max_null),
        "null_second_best_median": sorted(max_null)[len(max_null)//2],
        "null_second_best_max": max(max_null),
        "null_exceedances": exceed,
        "empirical_p_plus_one": (exceed + 1) / (PERMUTATIONS + 1),
        "observed_third_best": observed_third,
        "null_third_best_min": min(max_null_third),
        "null_third_best_median": sorted(max_null_third)[len(max_null_third)//2],
        "null_third_best_max": max(max_null_third),
        "null_third_best_exceedances": exceed_third,
        "third_best_empirical_p_plus_one": (exceed_third + 1) / (PERMUTATIONS + 1),
    }


def run(raw: Path) -> dict:
    result = {}
    for j, convention in enumerate(FULL_NULL_CONVENTIONS):
        windows = aggregate(raw, convention)
        real, null = summary(windows["real"]), summary(windows["null"])
        result[convention] = {
            "real": real,
            "matched_random": null,
            "real_key_label_permutation": calibration(windows["real"], SEED + 2*j),
            "random_key_label_permutation": calibration(windows["null"], SEED + 2*j + 1),
        }
    return {
        "experiment": "Historical source key recurrence across rules and six source LP2 sections",
        "screen_run": 44075903575,
        "source_section_count": 6,
        "original_rule_vectors_each_role": 396,
        "complete_pointer_conventions": list(FULL_NULL_CONVENTIONS),
        "source_key_pool": KEY_POOL,
        "top_hits_per_rule_vector": 50,
        "scope": "Original 000/001/002 only; all published directions/mults/models; top50 receiver; speculative chapter-specific pointer rule",
        "inference": "Permutation null shuffles exact key-source identity only across different chapters; no language or plaintext recovered",
        "by_convention": result,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("raw_shards", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    report = run(args.raw_shards)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.out) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=args.out.parent,
            prefix=args.out.name + ".", suffix=".tmp", delete=False
        ) as file:
            filename = Path(file.name)
            json.dump(report, file, ensure_ascii=False, indent=2)
            file.write("\n")
        os.replace(filename, args.out)
    print(json.dumps({
        conv: {
            "best_real": group["real"]["top_key_sources"][:1],
            "best_random": group["matched_random"]["top_key_sources"][:1],
            "real_second_best": group["real"]["max_second_best"],
            "random_second_best": group["matched_random"]["max_second_best"],
            "real_permutation": group["real_key_label_permutation"],
            "random_permutation": group["random_key_label_permutation"],
            "real_two_section_gates": group["real"]["two_section_gate"],
            "random_two_section_gates": group["matched_random"]["two_section_gate"],
            "real_three_section_gates": group["real"]["three_section_gate"],
            "random_three_section_gates": group["matched_random"]["three_section_gate"],
        } for conv, group in report["by_convention"].items()
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
