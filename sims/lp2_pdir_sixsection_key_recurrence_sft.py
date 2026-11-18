#!/usr/bin/env python3
"""Read-only cross-section recurrence test for the existing LP2 #1329 pdir campaign.

Only the original completed six-section TSVs are read. No ciphertext is rerun
and no new candidate keys, directions or cipher parameters are introduced.
Windows 11, Python 3.12. The original six sections are the immutable test set.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import json
from math import comb
from pathlib import Path
import re
import tempfile
import os

from filelock import FileLock

EXPECTED_WINDOWS = {"seg0.9", "seg0.11", "seg0.12", "seg0.13", "seg0.14", "seg0.15"}
SHARD_NAME = re.compile(r"^pdir-sixsections-(\d{3})-(\d{1,2})$")
HEADER = "ioc\titem\toffset\tmult\tmodel\twindow\tn"
THRESHOLDS = (1.30, 1.35)
FULL_NULL_CONVENTIONS = ("000", "001", "002")


def load_rows(path: Path) -> list[dict]:
    lines = path.read_text(encoding="utf-8").split("\n")
    if HEADER not in lines:
        raise ValueError(f"Missing frozen screen columns: {path}")
    pos = lines.index(HEADER)
    rows = []
    for line in lines[pos + 1:]:
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) != 7:
            raise ValueError(f"Malformed original TSV row in {path}: {line[:100]!r}")
        score, item, offset, mult, model, window, length = parts
        if window not in EXPECTED_WINDOWS:
            raise ValueError(f"Unexpected original source section {window} in {path}")
        rows.append({
            "ioc": float(score), "item": item, "offset": int(offset),
            "mult": mult, "model": model, "window": window, "n": int(length)
        })
    if len(rows) != 50:
        raise ValueError(f"Expected the pinned global top50, got {len(rows)} in {path}")
    return rows


def summarize_rows(rows: list[dict]) -> dict:
    # Each candidate key/multiplier/model is one hypothesis, even when it
    # appears at many offsets or in multiple windows. Do not count duplicate
    # offset rows as independent evidence.
    keyed = defaultdict(dict)
    for row in rows:
        identity = (row["item"], row["mult"], row["model"])
        prev = keyed[identity].get(row["window"])
        if prev is None or row["ioc"] > prev["ioc"]:
            keyed[identity][row["window"]] = row
    pairs = []
    for (item, mult, model), by_window in keyed.items():
        windows = sorted(by_window.values(), key=lambda r: -r["ioc"])
        if len(windows) < 2:
            continue
        pairs.append({
            "key": item[:130], "mult": mult, "model": model,
            "count_windows": len(windows),
            "second_window_ioc": windows[1]["ioc"],
            "min_window_ioc": min(v["ioc"] for v in windows),
            "windows": [{"section": v["window"], "ioc": v["ioc"],
                         "offset": v["offset"]} for v in windows]
        })
    pairs.sort(key=lambda p: (-p["count_windows"], -p["second_window_ioc"], p["key"]))
    return {
        "distinct_streams": len(keyed),
        "reused_in_at_least_2_sections": len(pairs),
        "reused_in_at_least_3_sections": sum(p["count_windows"] >= 3 for p in pairs),
        "at_least_two_windows_min_score": {
            str(t): any(p["second_window_ioc"] >= t for p in pairs) for t in THRESHOLDS
        },
        "best_pair": (
            max(pairs, key=lambda p: p["second_window_ioc"])
            if pairs else None
        ),
    }


def paired_exact_tail(real_only: int, null_only: int) -> float:
    # Exact two-sided discordance test; no language or random-key assumption.
    n = real_only + null_only
    if n == 0:
        return 1.0
    k = min(real_only, null_only)
    return min(1.0, 2.0 * sum(comb(n, i) for i in range(k + 1)) / (2 ** n))


def scan(base: Path) -> dict:
    by_conv = {}
    for conv in FULL_NULL_CONVENTIONS:
        shards = [base / f"pdir-sixsections-{conv}-{i}" for i in range(12)]
        if not all(s.is_dir() for s in shards):
            raise ValueError(f"Unfinished full-null convention {conv}: no partial-family comparisons")
        roles = {"real": {}, "null": {}}
        for shard in shards:
            summary = list(shard.rglob("summary_real_null.txt"))
            if len(summary) != 1:
                raise ValueError(f"Expected one full original/null summary: {shard}")
            text = summary[0].read_text(encoding="utf-8")
            if ("null 581 random keystreams" not in text or
                "seg0.9,seg0.11,seg0.12,seg0.13,seg0.14,seg0.15" not in text):
                raise ValueError(f"Unmatched random-key original source experiment: {shard}")
            for path in shard.rglob("*.tsv"):
                if path.parent.name not in roles:
                    continue
                role = path.parent.name
                if path.name in roles[role]:
                    raise ValueError(f"Duplicate frozen vector {conv}/{role}/{path.name}")
                roles[role][path.name] = summarize_rows(load_rows(path))
        if set(roles["real"]) != set(roles["null"]) or len(roles["real"]) != 132:
            raise ValueError(f"Must have same 132 original and matched-random vectors for {conv}")
        vectors = sorted(roles["real"])
        gate = {}
        for cutoff in THRESHOLDS:
            successes = [v for v in vectors if roles["real"][v]["at_least_two_windows_min_score"][str(cutoff)]]
            nulls = [v for v in vectors if roles["null"][v]["at_least_two_windows_min_score"][str(cutoff)]]
            a, b = set(successes), set(nulls)
            gate[str(cutoff)] = {
                "original_vectors": len(a), "matched_random_vectors": len(b),
                "original_only": len(a - b), "random_only": len(b - a),
                "two_sided_exact_p": paired_exact_tail(len(a - b), len(b - a)),
            }
        rank = []
        for role in ("real", "null"):
            for vector in vectors:
                summary = roles[role][vector]
                pair = summary["best_pair"]
                if pair:
                    rank.append({"kind": role, "convention": conv, "vector": vector, **pair})
        by_conv[conv] = {
            "vector_count_each": 132,
            "sections": sorted(EXPECTED_WINDOWS),
            "cross_section_pairs_real": sum(roles["real"][v]["reused_in_at_least_2_sections"] for v in vectors),
            "cross_section_pairs_random": sum(roles["null"][v]["reused_in_at_least_2_sections"] for v in vectors),
            "three_section_keys_real": sum(roles["real"][v]["reused_in_at_least_3_sections"] for v in vectors),
            "three_section_keys_random": sum(roles["null"][v]["reused_in_at_least_3_sections"] for v in vectors),
            "score_cutoff_paired": gate,
            "top_original_pairs": sorted((r for r in rank if r["kind"] == "real"),
                                         key=lambda x: -x["second_window_ioc"])[:10],
            "top_matched_random_pairs": sorted((r for r in rank if r["kind"] == "null"),
                                               key=lambda x: -x["second_window_ioc"])[:10],
        }
    return {
        "experiment": "Original LP2 #1329 six-section repeated historical key stream",
        "original_run": 44075903575,
        "preselected_conventions": list(FULL_NULL_CONVENTIONS),
        "total_real_vectors": 396,
        "total_matched_random_vectors": 396,
        "original_source_windows": sorted(EXPECTED_WINDOWS),
        "score_gate": "Within same rule/direction, same key+mult+model in >=2 different original windows among frozen top50",
        "calibration": "Exactly matched 581 random streams per original real vector, same source windows",
        "scope": "Only completed 000/001/002 conventions, top50-limited exploratory recurrence, no new plaintext",
        "results": by_conv,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("raw_shards", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    result = scan(args.raw_shards)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.out) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=args.out.parent,
            prefix=args.out.name + ".", suffix=".tmp", delete=False
        ) as file:
            temp_path = Path(file.name)
            json.dump(result, file, ensure_ascii=False, indent=2)
            file.write("\n")
        os.replace(temp_path, args.out)
    compact = {
        conv: {
            "pairs": [v["cross_section_pairs_real"], v["cross_section_pairs_random"]],
            "triples": [v["three_section_keys_real"], v["three_section_keys_random"]],
            "cutoffs": v["score_cutoff_paired"],
            "top_real": v["top_original_pairs"][:2],
            "top_null": v["top_matched_random_pairs"][:2],
        } for conv, v in result["results"].items()
    }
    print(json.dumps(compact, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
